# Credential Profile Security: Known Issues and Required Mitigations

## Background

The credential profiles feature (`mapps profile`) stores named commands in `.mappsrc` that are executed at runtime to fetch access tokens from secrets managers (1Password, Vault, AWS Secrets Manager, etc.). A profile entry looks like:

```json
{
  "profiles": {
    "dev": "/usr/local/bin/op read op://vault/monday-dev/token"
  },
  "defaultProfile": "dev"
}
```

At runtime, the stored command is split on whitespace into `[cmd, ...args]` and executed via `execFileSync` (no shell). Its stdout is used as the access token.

This design is directly analogous to pnpm's `tokenHelper` feature, which was affected by **CVE-2025-69262**. We adopt pnpm's security model as our baseline and add additional write-time validation since we control the add flow (pnpm doesn't — `.npmrc` is hand-edited).

---

## CVE-2025-69262 — pnpm tokenHelper Injection

**CVSS:** 7.5 HIGH
**CWEs:** CWE-78 (OS Command Injection), CWE-94 (Code Injection)
**Affected versions:** pnpm 6.25.0 – 10.26.x
**Fixed in:** pnpm 10.27.0

### Attack vector

pnpm's `.npmrc` supports `${VAR}` syntax for environment variable expansion. The `tokenHelper` setting specifies an executable and optional arguments. The vulnerable code path was:

1. Read `tokenHelper` value from `.npmrc`
2. Expand `${VAR}` references using the current process environment
3. Execute the resulting string with `spawnSync(helperPath, { shell: true })`

An attacker who can inject or influence environment variables — common in CI/CD pipelines via pull request builds, poisoned workflow env, compromised runner dependencies — can redirect the helper to an arbitrary executable or inject shell metacharacters into the expanded value.

### pnpm's security model (post-fix, from source)

The actual pnpm implementation (`config/reader/src/parseCreds.ts`, `network/auth-header/src/getAuthHeadersFromConfig.ts`) uses three layers:

1. **Reserved character blocking** — `$`, `%`, `` ` ``, `"`, `'` are rejected in the tokenHelper value. This prevents env var expansion (`$`, `%`), command substitution (`` ` ``), and quoting tricks (`"`, `'`).

2. **Whitespace split into array** — the value is split on whitespace into `[cmd, ...args]`, a tuple type `TokenHelper = [string, ...string[]]`. Arguments are allowed.

3. **`spawnSync(cmd, args, { shell: false })`** — the command is executed without a shell. This is the core security mechanism:
   - Shell operators (`;`, `|`, `&&`, `||`, `>`, `<`) are inert bytes in argv, not operators
   - No shell-level `$VAR` expansion occurs at execution time
   - Each argument is a distinct argv entry passed directly to the process
   - Arguments are safe because there is nothing to interpret them maliciously

4. **Global config only** — project-level `.npmrc` `tokenHelper` entries are rejected.

Note: pnpm's documentation states "absolute path, with no arguments" but the implementation and test suite allow both relative paths and arguments. The security guarantee comes from `shell: false` + character blocking, not from restricting path format or argument count.

---

## Our Design

We adopt pnpm's runtime security model (reserved character blocking, whitespace split, `execFileSync` with no shell, global config only) and add write-time validation that pnpm cannot do (since `.npmrc` is hand-edited, but we control the `profile:add` flow).

### Runtime security (matches pnpm)

1. **Reserved characters** — `$`, `%`, `` ` ``, `"`, `'` are rejected in profile command values
2. **Whitespace split** — command is split into `[cmd, ...args]`
3. **`execFileSync(cmd, args)` with no shell** — the core security mechanism
4. **Global config only** — local `.mappsrc` profiles are ignored with a warning (already implemented)

### Write-time validation (our addition)

Since `profile:add` is an interactive flow we control, we add two checks at add time that pnpm cannot enforce:

1. **Resolve to absolute path** — when the user enters `op read op://vault/dev/token`, we run `which op` to resolve the binary to its absolute path (e.g. `/usr/local/bin/op`) and store the absolute path. This prevents PATH-hijacking attacks where an attacker places a malicious binary earlier in PATH. If `which` fails, we prompt for the full path.

2. **Reject reserved characters and `${VAR}` patterns** — we check at add time and error immediately with a clear message, rather than waiting for runtime failure. This catches mistakes early.

Users who manually edit `.mappsrc` bypass write-time validation, but runtime validation (reserved character check + `execFileSync` without shell) still protects them.

### Arguments are allowed

Arguments are safe because `execFileSync(cmd, args)` passes them as distinct argv entries directly to the process — no shell interprets them. This means `op read op://vault/dev/token` works directly without a wrapper script:

```json
{
  "profiles": {
    "dev": "/usr/local/bin/op read op://vault/monday-dev/token",
    "prod": "/usr/local/bin/op read op://vault/monday-prod/token"
  },
  "defaultProfile": "dev"
}
```

---

## Validation

### Reserved characters (runtime — checked on every execution)

```typescript
const RESERVED_CHARACTERS = new Set(['$', '%', '`', '"', "'"]);

function validateReservedCharacters(command: string, profileName: string): void {
  for (const char of command) {
    if (RESERVED_CHARACTERS.has(char)) {
      let hint = 'Try using a wrapper script whose command does not contain this character.';
      if (char === '"' || char === "'") {
        hint = `Quotation marks are not supported — arguments are split on whitespace and passed directly. ${hint}`;
      } else if (char === '$' || char === '%') {
        hint = `Environment variable references are not allowed for security reasons (CVE-2025-69262). ${hint}`;
      }
      throw new Error(
        `Profile "${profileName}": unsupported character ${JSON.stringify(char)}. ${hint}`
      );
    }
  }
}
```

### Absolute path resolution (write-time — at `profile:add` only)

```typescript
import { execFileSync } from 'node:child_process';

function resolveAbsolutePath(command: string): string {
  const parts = command.split(/\s+/).filter(Boolean);
  const cmd = parts[0];
  const args = parts.slice(1);

  if (cmd.startsWith('/')) {
    return command; // already absolute
  }

  try {
    const resolved = execFileSync('which', [cmd], { encoding: 'utf8' }).trim();
    return [resolved, ...args].join(' ');
  } catch {
    throw new Error(
      `Could not find "${cmd}" in PATH. Provide the full absolute path to the executable.`
    );
  }
}
```

### Execution (runtime)

```typescript
import { execFileSync } from 'node:child_process';

function executeProfile(command: string, profileName: string): string {
  validateReservedCharacters(command, profileName);

  const [cmd, ...args] = command.split(/\s+/).filter(Boolean);

  const token = execFileSync(cmd, args, {
    encoding: 'utf8',
    timeout: 10_000,
  }).trim();

  if (!token) {
    throw new Error(`Profile "${profileName}" returned an empty token.`);
  }

  return token;
}
```

`execFileSync` does not invoke a shell. Shell operators are inert. Each argument is a distinct argv entry. This matches pnpm's `spawnSync(cmd, args, { shell: false })` model exactly.

---

## Files to Change When Implementing

- `src/services/config-service.ts` — `resolveProfile()`: replace `execSync(command)` with the `executeProfile` pattern above (validate reserved chars, split on whitespace, `execFileSync` without shell)
- `src/commands/profile/add.ts` — call `resolveAbsolutePath` before `saveConfig` to resolve and store absolute paths; call `validateReservedCharacters` to reject bad input early
- `src/commands/profile/index.ts` — same validation in `ACTION_ADD_PROFILE` branch
- `src/services/__tests__/config-service.test.ts` — add test cases: `$VAR` rejected, `${VAR}` rejected, backtick rejected, quote rejected, `%VAR%` rejected, valid command with args accepted, empty token rejected
- `src/commands/profile/__tests__/profile.test.ts` — add test cases: `which` resolution at add time, reserved characters rejected at add time

## UX

- `profile:add` command prompt: `Command to fetch token (e.g. op read op://vault/dev/token)`
- On add: resolve binary to absolute path automatically via `which`, confirm the stored value to the user
- Example output: `Resolved "op" to /usr/local/bin/op. Profile "dev" saved.`
- On reserved character error: tell the user exactly which character and why, suggest a wrapper script

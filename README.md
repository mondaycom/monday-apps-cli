monday-code-cli
=================

monday.com cli tool for `<monday-code />` apps management.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g monday-code-cli
$ mcode COMMAND
running command...
$ mcode (--version)
monday-code-cli/0.0.1 darwin-arm64 node-v18.12.1
$ mcode --help [COMMAND]
USAGE
  $ mcode COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mcode help [COMMAND]`](#mcode-help-command)
* [`mcode init`](#mcode-init)
* [`mcode login`](#mcode-login)

## `mcode help [COMMAND]`

Display help for mcode.

```
USAGE
  $ mcode help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mcode.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.19/src/commands/help.ts)_

## `mcode init`

Initialize monday-code config file - '.mcoderc'

```
USAGE
  $ mcode init [-t <value>]

FLAGS
  -t, --token=<value>  monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)

DESCRIPTION
  Initialize monday-code config file - '.mcoderc'

EXAMPLES
  $ mcode init -t SECRET_TOKEN
```

_See code: [dist/commands/init/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.0.1/dist/commands/init/index.ts)_

## `mcode login`

Login to monday.com to make full use of `mcode`

```
USAGE
  $ mcode login [-e <value> -m credentials|SSO|something_else]

FLAGS
  -e, --email=<value>                            Your monday.com email
  -m, --method=(credentials|SSO|something_else)  Login method to monday.com

DESCRIPTION
  Login to monday.com to make full use of `mcode`

EXAMPLES
  $ mcode login -m credentials -e exa@ple.com
```

_See code: [dist/commands/login/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.0.1/dist/commands/login/index.ts)_
<!-- commandsstop -->

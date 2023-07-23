monday-code-cli
=================

monday.com cli tool for `<monday-code />` apps management.

<!-- toc -->
* [Development](#development)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
<!-- development -->
# Development
## Local install
```ssh-session
$ cd <monday-code-cli repo>
$ nvm use
$ npm i yarn
$ yarn global add ./
$ yarn
$ yarn build
$ mapps YOUR_COMMAND
```
## Add new command
```ssh-session
$ cd <monday-code-cli repo>
$ oclif generate command <COMMAND_NAME>
```
<!-- developmentstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @mondaycom/apps-cli
$ mapps COMMAND
running command...
$ mapps (--version)
@mondaycom/apps-cli/0.1.7 darwin-arm64 node-v18.12.1
$ mapps --help [COMMAND]
USAGE
  $ mapps COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mapps app-version:list`](#mapps-app-versionlist)
* [`mapps app:list`](#mapps-applist)
* [`mapps autocomplete [SHELL]`](#mapps-autocomplete-shell)
* [`mapps code:logs`](#mapps-codelogs)
* [`mapps code:push`](#mapps-codepush)
* [`mapps code:secrets`](#mapps-codesecrets)
* [`mapps code:status`](#mapps-codestatus)
* [`mapps help [COMMANDS]`](#mapps-help-commands)
* [`mapps init`](#mapps-init)

## `mapps app-version:list`

List all versions for a specific app.

```
USAGE
  $ mapps app-version:list [--verbose] [-i <value>]

FLAGS
  -i, --appId=<value>  Please enter app id:

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  List all versions for a specific app.

EXAMPLES
  $ mapps app-version:list
```

_See code: [dist/commands/app-version/list.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/app-version/list.ts)_

## `mapps app:list`

List all apps for a specific user.

```
USAGE
  $ mapps app:list [--verbose]

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  List all apps for a specific user.

EXAMPLES
  $ mapps app:list
```

_See code: [dist/commands/app/list.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/app/list.ts)_

## `mapps autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ mapps autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ mapps autocomplete

  $ mapps autocomplete bash

  $ mapps autocomplete zsh

  $ mapps autocomplete powershell

  $ mapps autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v2.2.0/src/commands/autocomplete/index.ts)_

## `mapps code:logs`

Stream logs

```
USAGE
  $ mapps code:logs [--verbose] [-i <value>] [-t <value>]

FLAGS
  -i, --appVersionId=<value>  Please enter the app version id of your app:
  -t, --logsType=<value>      Logs type: "http" for http events, "console" for stdout

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  Stream logs

EXAMPLES
  $ mapps code:logs -i APP_VERSION_ID -t LOGS_TYPE
```

_See code: [dist/commands/code/logs.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/code/logs.ts)_

## `mapps code:push`

Push your project to get hosted on monday-code.

```
USAGE
  $ mapps code:push [--verbose] [-d <value>] [-i <value>]

FLAGS
  -d, --directoryPath=<value>  Directory path of you project in your machine. If not included will use the current
                               working directory.
  -i, --appVersionId=<value>   Please enter the app version id of your app:

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  Push your project to get hosted on monday-code.

EXAMPLES
  $ mapps code:push -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH

  $ mapps code:push -i APP_VERSION_ID_TO_PUSH
```

_See code: [dist/commands/code/push.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/code/push.ts)_

## `mapps code:secrets`

Manage secrets for your project hosted on monday-code.

```
USAGE
  $ mapps code:secrets [--verbose] [-i <value>] [-m list-keys|set|delete] [-k <value>] [-s <value>]

FLAGS
  -i, --appId=<value>   Please enter app id:
  -k, --key=<value>     Secret key
  -m, --mode=<option>   Secret management mode
                        <options: list-keys|set|delete>
  -s, --secret=<value>  The secret value

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  Manage secrets for your project hosted on monday-code.

EXAMPLES
  $ mapps code:secrets
```

_See code: [dist/commands/code/secrets.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/code/secrets.ts)_

## `mapps code:status`

Status of a specific project hosted on monday-code.

```
USAGE
  $ mapps code:status [--verbose] [-i <value>]

FLAGS
  -i, --appVersionId=<value>  Please enter the app version id of your app:

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  Status of a specific project hosted on monday-code.

EXAMPLES
  $ mapps code:status -i APP_VERSION_ID
```

_See code: [dist/commands/code/status.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/code/status.ts)_

## `mapps help [COMMANDS]`

Display help for mapps.

```
USAGE
  $ mapps help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mapps.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `mapps init`

Initialize mapps config file - ".mappsrc".

```
USAGE
  $ mapps init [--verbose] [-t <value>]

FLAGS
  -t, --token=<value>  monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)

GLOBAL FLAGS
  --verbose  Print advanced logs (optional).

DESCRIPTION
  Initialize mapps config file - ".mappsrc".

EXAMPLES
  $ mapps init -t SECRET_TOKEN
```

_See code: [dist/commands/init/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.7/dist/commands/init/index.ts)_
<!-- commandsstop -->

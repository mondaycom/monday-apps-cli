<h3 style="color:red"><b>Public access to this CLI is currently restricted but will become available in the next few months</b></h3>

---
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
$ npm install -g @mondaycom/apps-cli
$ mapps COMMAND
running command...
$ mapps (--version)
@mondaycom/apps-cli/0.1.16 darwin-arm64 node-v18.12.1
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
* [`mapps code:env`](#mapps-codeenv)
* [`mapps code:logs`](#mapps-codelogs)
* [`mapps code:push`](#mapps-codepush)
* [`mapps code:status`](#mapps-codestatus)
* [`mapps help [COMMANDS]`](#mapps-help-commands)
* [`mapps init`](#mapps-init)

## `mapps app-version:list`

List all versions for a specific app.

```
USAGE
  $ mapps app-version:list [--verbose] [--print-command] [-i <value>]

FLAGS
  -i, --appId=<value>  Please enter app id:

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  List all versions for a specific app.

EXAMPLES
  $ mapps app-version:list
```

_See code: [dist/commands/app-version/list.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/app-version/list.ts)_

## `mapps app:list`

List all apps for a specific user.

```
USAGE
  $ mapps app:list [--verbose] [--print-command]

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  List all apps for a specific user.

EXAMPLES
  $ mapps app:list
```

_See code: [dist/commands/app/list.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/app/list.ts)_

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

## `mapps code:env`

Manage environment variables for your app hosted on monday-code.

```
USAGE
  $ mapps code:env [--verbose] [--print-command] [-i <value>] [-m list-keys|set|delete] [-k <value>] [-v
    <value>]

FLAGS
  -i, --appId=<value>  The id of the app to manage environment variables for
  -k, --key=<value>    variable key [required for set and delete]]
  -m, --mode=<option>  management mode
                       <options: list-keys|set|delete>
  -v, --value=<value>  variable value [required for set]

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  Manage environment variables for your app hosted on monday-code.

EXAMPLES
  $ mapps code:env
```

_See code: [dist/commands/code/env.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/code/env.ts)_

## `mapps code:logs`

Stream logs

```
USAGE
  $ mapps code:logs [--verbose] [--print-command] [-i <value>] [-t <value>] [-s <value>] [-f <value>] [-e
    <value>] [-r <value>]

FLAGS
  -e, --logsEndDate=<value>        End date (MM/DD/YYYY HH:mm) e.g. "03/25/1983 16:45" [supported only if
                                   eventSource=live]
  -f, --logsStartDate=<value>      Start date (MM/DD/YYYY HH:mm) e.g. "03/24/1983 15:45" [supported only if
                                   eventSource=live]
  -i, --appVersionId=<value>       Please enter the app version id of your app:
  -r, --logSearchFromText=<value>  text: a text in regex that will be searched among the logs text [supported only if
                                   eventSource=live]
  -s, --eventSource=<value>        Source: "live" for live events, "History" for fetching events from the past
  -t, --logsType=<value>           Logs type: "http" for http events, "console" for stdout

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  Stream logs

EXAMPLES
  $ mapps code:logs -i APP_VERSION_ID -t LOGS_TYPE
```

_See code: [dist/commands/code/logs.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/code/logs.ts)_

## `mapps code:push`

Push your project to get hosted on monday-code.

```
USAGE
  $ mapps code:push [--verbose] [--print-command] [-d <value>] [-i <value>]

FLAGS
  -d, --directoryPath=<value>  Directory path of you project in your machine. If not included will use the current
                               working directory.
  -i, --appVersionId=<value>   Please enter the app version id of your app:

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  Push your project to get hosted on monday-code.

EXAMPLES
  $ mapps code:push -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH

  $ mapps code:push -i APP_VERSION_ID_TO_PUSH
```

_See code: [dist/commands/code/push.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/code/push.ts)_

## `mapps code:status`

Status of a specific project hosted on monday-code.

```
USAGE
  $ mapps code:status [--verbose] [--print-command] [-i <value>]

FLAGS
  -i, --appVersionId=<value>  Please enter the app version id of your app:

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  Status of a specific project hosted on monday-code.

EXAMPLES
  $ mapps code:status -i APP_VERSION_ID
```

_See code: [dist/commands/code/status.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/code/status.ts)_

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
  $ mapps init [--verbose] [--print-command] [-t <value>]

FLAGS
  -t, --token=<value>  monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)

GLOBAL FLAGS
  --print-command  Print the command that was executed (optional).
  --verbose        Print advanced logs (optional).

DESCRIPTION
  Initialize mapps config file - ".mappsrc".

EXAMPLES
  $ mapps init -t SECRET_TOKEN
```

_See code: [dist/commands/init/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.16/dist/commands/init/index.ts)_
<!-- commandsstop -->

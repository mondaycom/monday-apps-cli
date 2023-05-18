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
$ npm i -g ./
$ npm run build
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
$ npm install -g monday-code-cli
$ mapps COMMAND
running command...
$ mapps (--version)
monday-code-cli/0.1.1 darwin-arm64 node-v18.12.1
$ mapps --help [COMMAND]
USAGE
  $ mapps COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mapps base-command`](#mapps-base-command)
* [`mapps code:logs`](#mapps-codelogs)
* [`mapps code:push`](#mapps-codepush)
* [`mapps help [COMMANDS]`](#mapps-help-commands)
* [`mapps init`](#mapps-init)

## `mapps base-command`

```
USAGE
  $ mapps base-command
```

_See code: [dist/commands/base-command.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.1/dist/commands/base-command.ts)_

## `mapps code:logs`

Stream logs

```
USAGE
  $ mapps code:logs [--verbose] [-i <value>] [-t <value>]

FLAGS
  -i, --appVersionId=<value>  Please enter the app version id of your app:
  -t, --logsType=<value>      Logs type: "http" for http events, "console" for stdout
  --verbose                   Print advanced logs (optional).

DESCRIPTION
  Stream logs

EXAMPLES
  $ mapps code:logs -i APP VERSION ID TO STREAM LOGS -t LOGS TYPE TO WATCH
```

_See code: [dist/commands/code/logs.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.1/dist/commands/code/logs.ts)_

## `mapps code:push`

Push your project to get hosted on monday-code.

```
USAGE
  $ mapps code:push [--verbose] [-d <value>] [-i <value>]

FLAGS
  -d, --directoryPath=<value>  Directory path of you project in your machine. If not included will use the current
                               working directory.
  -i, --appVersionId=<value>   Please enter the app version id of your app:
  --verbose                    Print advanced logs (optional).

DESCRIPTION
  Push your project to get hosted on monday-code.

EXAMPLES
  $ mapps code:push -d PROJECT DIRECTORY PATH -i APP VERSION ID TO PUSH

  $ mapps code:push -i APP VERSION ID TO PUSH
```

_See code: [dist/commands/code/push.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.1/dist/commands/code/push.ts)_

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

Initialize monday-code config file - ".mappsrc".

```
USAGE
  $ mapps init [--verbose] [-t <value>]

FLAGS
  -t, --token=<value>  monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)
  --verbose            Print advanced logs (optional).

DESCRIPTION
  Initialize monday-code config file - ".mappsrc".

EXAMPLES
  $ mapps init -t SECRET_TOKEN
```

_See code: [dist/commands/init/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.1.1/dist/commands/init/index.ts)_
<!-- commandsstop -->

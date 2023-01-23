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
monday-code-cli/0.0.2 darwin-arm64 node-v18.12.1
$ mapps --help [COMMAND]
USAGE
  $ mapps COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mapps help [COMMAND]`](#mapps-help-command)
* [`mapps init`](#mapps-init)
* [`mapps login`](#mapps-login)

## `mapps help [COMMAND]`

Display help for mapps.

```
USAGE
  $ mapps help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mapps.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.19/src/commands/help.ts)_

## `mapps init`

Initialize monday-code config file - '.mappsrc'

```
USAGE
  $ mapps init [-t <value>]

FLAGS
  -t, --token=<value>  monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)

DESCRIPTION
  Initialize monday-code config file - '.mappsrc'

EXAMPLES
  $ mapps init -t SECRET_TOKEN
```

_See code: [dist/commands/init/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.0.2/dist/commands/init/index.ts)_

## `mapps login`

Login to monday.com to make full use of `mapps`

```
USAGE
  $ mapps login [-e <value> -m credentials|SSO|something_else]

FLAGS
  -e, --email=<value>                            Your monday.com email
  -m, --method=(credentials|SSO|something_else)  Login method to monday.com

DESCRIPTION
  Login to monday.com to make full use of `mapps`

EXAMPLES
  $ mapps login -m credentials -e exa@ple.com
```

_See code: [dist/commands/login/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.0.2/dist/commands/login/index.ts)_
<!-- commandsstop -->

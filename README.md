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
* [`mcode login`](#mcode-login)
* [`mcode plugins`](#mcode-plugins)
* [`mcode plugins:install PLUGIN...`](#mcode-pluginsinstall-plugin)
* [`mcode plugins:inspect PLUGIN...`](#mcode-pluginsinspect-plugin)
* [`mcode plugins:install PLUGIN...`](#mcode-pluginsinstall-plugin-1)
* [`mcode plugins:link PLUGIN`](#mcode-pluginslink-plugin)
* [`mcode plugins:uninstall PLUGIN...`](#mcode-pluginsuninstall-plugin)
* [`mcode plugins:uninstall PLUGIN...`](#mcode-pluginsuninstall-plugin-1)
* [`mcode plugins:uninstall PLUGIN...`](#mcode-pluginsuninstall-plugin-2)
* [`mcode plugins:update`](#mcode-pluginsupdate)

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

## `mcode login`

Login to monday.com to make full use of `mcode`

```
USAGE
  $ mcode login [-m credentials|SSO|something_else] [-e <value> ] [-p <value> ]

FLAGS
  -e, --email=<value>                            Your monday.com email
  -m, --method=(credentials|SSO|something_else)  Login method to monday.com
  -p, --password=<value>                         Your monday.com password

DESCRIPTION
  Login to monday.com to make full use of `mcode`

EXAMPLES
  $ mcode login
```

_See code: [dist/commands/login/index.ts](https://github.com/mondaycom/monday-code-cli/blob/v0.0.1/dist/commands/login/index.ts)_

## `mcode plugins`

List installed plugins.

```
USAGE
  $ mcode plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ mcode plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/index.ts)_

## `mcode plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ mcode plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ mcode plugins:add

EXAMPLES
  $ mcode plugins:install myplugin 

  $ mcode plugins:install https://github.com/someuser/someplugin

  $ mcode plugins:install someuser/someplugin
```

## `mcode plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ mcode plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ mcode plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/inspect.ts)_

## `mcode plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ mcode plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ mcode plugins:add

EXAMPLES
  $ mcode plugins:install myplugin 

  $ mcode plugins:install https://github.com/someuser/someplugin

  $ mcode plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/install.ts)_

## `mcode plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ mcode plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ mcode plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/link.ts)_

## `mcode plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ mcode plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mcode plugins:unlink
  $ mcode plugins:remove
```

## `mcode plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ mcode plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mcode plugins:unlink
  $ mcode plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/uninstall.ts)_

## `mcode plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ mcode plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mcode plugins:unlink
  $ mcode plugins:remove
```

## `mcode plugins:update`

Update installed plugins.

```
USAGE
  $ mcode plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/update.ts)_
<!-- commandsstop -->

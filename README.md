# monday-apps-cli

monday.com cli tool for monday apps management.

<!-- toc -->

- [monday-apps-cli](#monday-apps-cli)
- [Usage](#usage)
- [Authentication](#authentication)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @mondaycom/apps-cli
$ mapps COMMAND
running command...
$ mapps (--version)
@mondaycom/apps-cli/4.10.5 linux-x64 node-v22.22.0
$ mapps --help [COMMAND]
USAGE
  $ mapps COMMAND
...
```

<!-- usagestop -->

# Authentication

## Basic

```sh
mapps init -t YOUR_ACCESS_TOKEN
```

## Secrets Manager Integration

Using a secrets manager is recommended to avoid storing plaintext tokens on disk, reducing the risk of credential theft from supply chain attacks targeting developer machines.

Instead of storing tokens as plaintext, you can configure named profiles that fetch tokens from any secrets manager at runtime:

```sh
mapps profile --add dev --command "op read 'op://vault/dev/credential'" --set-as-default
mapps profile --add prod --command "aws ssm get-parameter --name /app/token --query Parameter.Value --output text"
```

You can also use profiles with plaintext tokens (**not recommended**) for multi-account switching without a secrets manager:

```sh
mapps profile --add dev --command "echo YOUR_DEV_TOKEN" --set-as-default
mapps profile --add prod --command "echo YOUR_PROD_TOKEN"
```

Use `--profile` on any command to override the default:

```sh
mapps code:push --profile prod
```

Run `mapps profile` for an interactive setup flow, or `mapps profile:list` to view configured profiles.

Profiles are stored in the global config only. Profile commands in local project `.mappsrc` files are ignored for security — this prevents a malicious repository from executing attacker-controlled shell commands.

# Commands

<!-- commands -->

- [`mapps api:generate`](#mapps-apigenerate)
- [`mapps app-features:build`](#mapps-app-featuresbuild)
- [`mapps app-features:create`](#mapps-app-featurescreate)
- [`mapps app-features:list`](#mapps-app-featureslist)
- [`mapps app-version:builds`](#mapps-app-versionbuilds)
- [`mapps app-version:list`](#mapps-app-versionlist)
- [`mapps app:create`](#mapps-appcreate)
- [`mapps app:deploy`](#mapps-appdeploy)
- [`mapps app:list`](#mapps-applist)
- [`mapps app:promote`](#mapps-apppromote)
- [`mapps app:scaffold [DESTINATION] [PROJECT]`](#mapps-appscaffold-destination-project)
- [`mapps autocomplete [SHELL]`](#mapps-autocomplete-shell)
- [`mapps code:env`](#mapps-codeenv)
- [`mapps code:logs`](#mapps-codelogs)
- [`mapps code:push`](#mapps-codepush)
- [`mapps code:report`](#mapps-codereport)
- [`mapps code:secret`](#mapps-codesecret)
- [`mapps code:status`](#mapps-codestatus)
- [`mapps database:connection-string`](#mapps-databaseconnection-string)
- [`mapps help [COMMANDS]`](#mapps-help-commands)
- [`mapps init`](#mapps-init)
- [`mapps manifest:export`](#mapps-manifestexport)
- [`mapps manifest:import`](#mapps-manifestimport)
- [`mapps profile`](#mapps-profile)
- [`mapps profile:add`](#mapps-profileadd)
- [`mapps profile:clear-default`](#mapps-profileclear-default)
- [`mapps profile:list`](#mapps-profilelist)
- [`mapps profile:remove`](#mapps-profileremove)
- [`mapps profile:remove-token`](#mapps-profileremove-token)
- [`mapps profile:set-default`](#mapps-profileset-default)
- [`mapps scheduler:create`](#mapps-schedulercreate)
- [`mapps scheduler:delete`](#mapps-schedulerdelete)
- [`mapps scheduler:list`](#mapps-schedulerlist)
- [`mapps scheduler:run`](#mapps-schedulerrun)
- [`mapps scheduler:update`](#mapps-schedulerupdate)
- [`mapps storage:export`](#mapps-storageexport)
- [`mapps storage:remove-data`](#mapps-storageremove-data)
- [`mapps storage:search`](#mapps-storagesearch)
- [`mapps tunnel:create`](#mapps-tunnelcreate)

## `mapps api:generate`

Prepares your environment for custom queries development. run it from your root directory!

```
USAGE
  $ mapps api:generate

DESCRIPTION
  Prepares your environment for custom queries development. run it from your root directory!
  Creates all necessary files and scripts
  to start working with custom api queries and mutations.
  Read the documentation at
  [@mondaydotcomorg/setup-api](https://github.com/mondaycom/monday-graphql-api/tree/main/packages/setup-api)
```

_See code: [src/commands/api/generate.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/api/generate.ts)_

## `mapps app-features:build`

Perform operations related to app features in monday.com

```
USAGE
  $ mapps app-features:build [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-i
    <value>] [-d <value>] [-t custom_url|monday_code|monday_code_cdn] [-u <value>]

FLAGS
  -a, --appId=<value>         Please enter app id:
  -d, --appFeatureId=<value>  Please enter the app feature id of your app:
  -i, --appVersionId=<value>  Please enter the app version id of your app:
  -t, --buildType=<option>    Build type
                              <options: custom_url|monday_code|monday_code_cdn>
  -u, --customUrl=<value>     Custom url

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Perform operations related to app features in monday.com

EXAMPLES
  $ mapps app-features:build -a APP_ID -i APP_VERSION_ID -d APP_FEATURE_ID  -t BUILD_TYPE -u CUSTOM_URL
```

_See code: [src/commands/app-features/build.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app-features/build.ts)_

## `mapps app-features:create`

Create an app feature.

```
USAGE
  $ mapps app-features:create [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-i
    <value>] [-t <value>] [-n <value>]

FLAGS
  -a, --appId=<value>         Please enter app id:
  -i, --appVersionId=<value>  Please enter the app version id of your app:
  -n, --featureName=<value>   Feature name
  -t, --featureType=<value>   Feature type

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Create an app feature.

EXAMPLES
  $ mapps app-features:create -a APP_ID -i APP_VERSION_ID -t APP-FEATURE-TYPE
```

_See code: [src/commands/app-features/create.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app-features/create.ts)_

## `mapps app-features:list`

List all features for a specific app version.

```
USAGE
  $ mapps app-features:list [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-i
    <value>]

FLAGS
  -a, --appId=<value>         Please enter app id:
  -i, --appVersionId=<value>  Please enter the app version id of your app:

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  List all features for a specific app version.

EXAMPLES
  $ mapps app-features:list -a APP_ID -i APP_VERSION_ID
```

_See code: [src/commands/app-features/list.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app-features/list.ts)_

## `mapps app-version:builds`

List all builds for a specific app version

```
USAGE
  $ mapps app-version:builds [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>]

FLAGS
  -i, --appVersionId=<value>  Please enter the app version id of your app:

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  List all builds for a specific app version

EXAMPLES
  $ mapps app-version:builds -i APP_VERSION_ID
```

_See code: [src/commands/app-version/builds.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app-version/builds.ts)_

## `mapps app-version:list`

List all versions for a specific app.

```
USAGE
  $ mapps app-version:list [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>]

FLAGS
  -i, --appId=<value>  Please enter app id:

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  List all versions for a specific app.

EXAMPLES
  $ mapps app-version:list
```

_See code: [src/commands/app-version/list.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app-version/list.ts)_

## `mapps app:create`

Create an app.

```
USAGE
  $ mapps app:create [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-n <value>] [-d
    <value>]

FLAGS
  -d, --targetDir=<value>  Directory to create the app in.
  -n, --name=<value>       Name your new app.

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Create an app.

EXAMPLES
  $ mapps app:create

  $ mapps app:create -n NEW_APP_NAME
```

_See code: [src/commands/app/create.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app/create.ts)_

## `mapps app:deploy`

Deploy an app using manifest file.

```
USAGE
  $ mapps app:deploy [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-d <value>] [-a
    <value>] [-v <value>] [-f] [-z us|eu|au|il]

FLAGS
  -a, --appId=<value>          App id (will use the latest draft version)
  -d, --directoryPath=<value>  Directory path of you project in your machine. If not included will use the current
                               working directory.
  -f, --force                  Force push to latest version (draft or live)
  -v, --appVersionId=<value>   App version id
  -z, --region=<option>        Region to use
                               <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Deploy an app using manifest file.

EXAMPLES
  $ mapps app:deploy
```

_See code: [src/commands/app/deploy.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app/deploy.ts)_

## `mapps app:list`

List all apps for a specific user.

```
USAGE
  $ mapps app:list [--verbose] [--print-command] [--profile <value>] [--ignore-profiles]

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  List all apps for a specific user.

EXAMPLES
  $ mapps app:list
```

_See code: [src/commands/app/list.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app/list.ts)_

## `mapps app:promote`

Promote an app to live.

```
USAGE
  $ mapps app:promote [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-i
    <value>]

FLAGS
  -a, --appId=<value>         App id to promote
  -i, --appVersionId=<value>  App version id to promote

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Promote an app to live.

EXAMPLES
  $ mapps app:promote

  $ mapps app:promote
```

_See code: [src/commands/app/promote.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app/promote.ts)_

## `mapps app:scaffold [DESTINATION] [PROJECT]`

Scaffold a monday app from a template, install dependencies, and start the project automatically.

```
USAGE
  $ mapps app:scaffold [DESTINATION] [PROJECT] [--verbose] [--print-command] [--profile <value>]
    [--ignore-profiles] [-s <value>] [-c <value>]

ARGUMENTS
  DESTINATION  The destination directory for the scaffolded project
  PROJECT      The name of the template project to scaffold

FLAGS
  -c, --command=<value>        [default: start] npm script command to run after installation (default: start)
  -s, --signingSecret=<value>  monday signing secret (for .env configuration)

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Scaffold a monday app from a template, install dependencies, and start the project automatically.

EXAMPLES
  $ mapps app:scaffold

  $ mapps app:scaffold ./my-app quickstart-react

  $ mapps app:scaffold ./my-app slack-node --signingSecret YOUR_SECRET

  $ mapps app:scaffold ./my-app word-cloud --command dev
```

_See code: [src/commands/app/scaffold.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/app/scaffold.ts)_

## `mapps autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ mapps autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ mapps autocomplete

  $ mapps autocomplete bash

  $ mapps autocomplete zsh

  $ mapps autocomplete powershell

  $ mapps autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.0.5/src/commands/autocomplete/index.ts)_

## `mapps code:env`

Manage environment variables for your app hosted on monday-code.

```
USAGE
  $ mapps code:env [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>] [-m
    list-keys|set|delete] [-k <value>] [-v <value>] [-z us|eu|au|il]

FLAGS
  -i, --appId=<value>    The id of the app to manage environment variables for
  -k, --key=<value>      variable key [required for set and delete]]
  -m, --mode=<option>    management mode
                         <options: list-keys|set|delete>
  -v, --value=<value>    variable value [required for set]
  -z, --region=<option>  Region to use
                         <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Manage environment variables for your app hosted on monday-code.

EXAMPLES
  $ mapps code:env
```

_See code: [src/commands/code/env.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/code/env.ts)_

## `mapps code:logs`

Stream logs

```
USAGE
  $ mapps code:logs [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>] [-t
    <value>] [-s <value>] [-f <value>] [-e <value>] [-r <value>] [-z us|eu|au|il]

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
  -z, --region=<option>            Region to use
                                   <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Stream logs

EXAMPLES
  $ mapps code:logs -i APP_VERSION_ID -t LOGS_TYPE
```

_See code: [src/commands/code/logs.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/code/logs.ts)_

## `mapps code:push`

Push your project to get hosted on monday-code.

```
USAGE
  $ mapps code:push [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-d <value>] [-a
    <value>] [-i <value>] [-f] [-c] [-s] [-z us|eu|au|il]

FLAGS
  -a, --appId=<value>          Please enter app id:
  -c, --client-side            Push files to CDN
  -d, --directoryPath=<value>  Directory path of you project in your machine. If not included will use the current
                               working directory.
  -f, --force                  Force push to live version
  -i, --appVersionId=<value>   Please enter the app version id of your app:
  -s, --security-scan          Run a security scan to find dependency vulnerabilities during code deployment
  -z, --region=<option>        Region to use
                               <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Push your project to get hosted on monday-code.

EXAMPLES
  $ mapps code:push -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH

  $ mapps code:push -i APP_VERSION_ID_TO_PUSH

  $ mapps code:push -a APP_ID_TO_PUSH
```

_See code: [src/commands/code/push.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/code/push.ts)_

## `mapps code:report`

Get security scan report for a monday-code deployment.

```
USAGE
  $ mapps code:report [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>] [-d
    <value> -o] [-z us|eu|au|il]

FLAGS
  -d, --outputDir=<value>     Directory to save the report file (requires -o flag)
  -i, --appVersionId=<value>  Please enter the app version id of your app:
  -o, --output                Save the full report to a JSON file
  -z, --region=<option>       Region to use
                              <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Get security scan report for a monday-code deployment.

EXAMPLES
  $ mapps code:report -i APP_VERSION_ID

  $ mapps code:report -i APP_VERSION_ID -o

  $ mapps code:report -i APP_VERSION_ID -o -d /path/to/directory
```

_See code: [src/commands/code/report.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/code/report.ts)_

## `mapps code:secret`

Manage secret variables for your app hosted on monday-code.

```
USAGE
  $ mapps code:secret [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>] [-m
    list-keys|set|delete] [-k <value>] [-v <value>] [-z us|eu|au|il]

FLAGS
  -i, --appId=<value>    The id of the app to manage secret variables for
  -k, --key=<value>      variable key [required for set and delete]]
  -m, --mode=<option>    management mode
                         <options: list-keys|set|delete>
  -v, --value=<value>    variable value [required for set]
  -z, --region=<option>  Region to use
                         <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Manage secret variables for your app hosted on monday-code.

EXAMPLES
  $ mapps code:secret
```

_See code: [src/commands/code/secret.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/code/secret.ts)_

## `mapps code:status`

Status of a specific project hosted on monday-code.

```
USAGE
  $ mapps code:status [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-i <value>] [-z
    us|eu|au|il]

FLAGS
  -i, --appVersionId=<value>  Please enter the app version id of your app:
  -z, --region=<option>       Region to use
                              <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Status of a specific project hosted on monday-code.

EXAMPLES
  $ mapps code:status -i APP_VERSION_ID
```

_See code: [src/commands/code/status.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/code/status.ts)_

## `mapps database:connection-string`

Get the connection string for your app database.

```
USAGE
  $ mapps database:connection-string [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-z
    us|eu|au|il]

FLAGS
  -a, --appId=<value>    Select the app that you wish to retrieve the connection string for
  -z, --region=<option>  Region to use
                         <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Get the connection string for your app database.

EXAMPLES
  $ mapps database:connection-string -a APP_ID
```

_See code: [src/commands/database/connection-string.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/database/connection-string.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.12/src/commands/help.ts)_

## `mapps init`

Initialize mapps config file - ".mappsrc".

```
USAGE
  $ mapps init [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-t <value>] [-l]

FLAGS
  -l, --local          create the configuration file locally, in the current project working directory
  -t, --token=<value>  monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Initialize mapps config file - ".mappsrc".

EXAMPLES
  $ mapps init -t SECRET_TOKEN
```

_See code: [src/commands/init/index.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/init/index.ts)_

## `mapps manifest:export`

export app manifest.

```
USAGE
  $ mapps manifest:export [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-p <value>] [-a
    <value>] [-i <value>]

FLAGS
  -a, --appId=<value>         App id (will export the live version)
  -i, --appVersionId=<value>  App version id
  -p, --manifestPath=<value>  Path to export your app manifest files to

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  export app manifest.

EXAMPLES
  $ mapps manifest:export

  $ mapps manifest:export -p ./exports

  $ mapps manifest:export --manifestPath ./my-manifests
```

_See code: [src/commands/manifest/export.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/manifest/export.ts)_

## `mapps manifest:import`

Import manifest with optional template variables.

```
USAGE
  $ mapps manifest:import [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-p <value>] [-a
    <value>] [-i <value>] [-n] [-m]

FLAGS
  -a, --appId=<value>          App id (will create a new draft version)
  -i, --appVersionId=<value>   App version id to override
  -m, --allowMissingVariables  Allow missing variables
  -n, --newApp                 Create new app
  -p, --manifestPath=<value>   Path to your app manifest file on your machine

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Import manifest with optional template variables.

EXAMPLES
  $ mapps manifest:import

  $ mapps manifest:import -p ./manifest.json

  $ mapps manifest:import --manifestPath ./manifest.json
```

_See code: [src/commands/manifest/import.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/manifest/import.ts)_

## `mapps profile`

Manage authentication profiles for monday.com API access (interactive).

```
USAGE
  $ mapps profile [-l]

FLAGS
  -l, --local  Use the local project config instead of the global config.

DESCRIPTION
  Manage authentication profiles for monday.com API access (interactive).

EXAMPLES
  $ mapps profile
```

_See code: [src/commands/profile/index.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/index.ts)_

## `mapps profile:add`

Add a credential profile to .mappsrc.

```
USAGE
  $ mapps profile:add [-l] [-n <value>] [-c <value>] [--set-as-default]

FLAGS
  -c, --command=<value>  Shell command that prints the access token to stdout.
  -l, --local            Use the local project config instead of the global config.
  -n, --name=<value>     Profile name (e.g. dev, prod, staging).
      --set-as-default   Set this profile as the default.

DESCRIPTION
  Add a credential profile to .mappsrc.

EXAMPLES
  $ mapps profile:add

  $ mapps profile:add --name dev --command "op read op://vault/dev/token"

  $ mapps profile:add --name dev --command "echo MY_TOKEN" --set-as-default
```

_See code: [src/commands/profile/add.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/add.ts)_

## `mapps profile:clear-default`

Clear the default credential profile.

```
USAGE
  $ mapps profile:clear-default [-l]

FLAGS
  -l, --local  Use the local project config instead of the global config.

DESCRIPTION
  Clear the default credential profile.

EXAMPLES
  $ mapps profile:clear-default
```

_See code: [src/commands/profile/clear-default.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/clear-default.ts)_

## `mapps profile:list`

List all configured credential profiles.

```
USAGE
  $ mapps profile:list [-l]

FLAGS
  -l, --local  Use the local project config instead of the global config.

DESCRIPTION
  List all configured credential profiles.

EXAMPLES
  $ mapps profile:list
```

_See code: [src/commands/profile/list.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/list.ts)_

## `mapps profile:remove`

Remove a credential profile from .mappsrc.

```
USAGE
  $ mapps profile:remove [-l] [-n <value>]

FLAGS
  -l, --local         Use the local project config instead of the global config.
  -n, --name=<value>  Profile name to remove.

DESCRIPTION
  Remove a credential profile from .mappsrc.

EXAMPLES
  $ mapps profile:remove

  $ mapps profile:remove --name dev
```

_See code: [src/commands/profile/remove.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/remove.ts)_

## `mapps profile:remove-token`

Remove the plaintext access token from .mappsrc.

```
USAGE
  $ mapps profile:remove-token [-l]

FLAGS
  -l, --local  Use the local project config instead of the global config.

DESCRIPTION
  Remove the plaintext access token from .mappsrc.

EXAMPLES
  $ mapps profile:remove-token
```

_See code: [src/commands/profile/remove-token.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/remove-token.ts)_

## `mapps profile:set-default`

Set the default credential profile.

```
USAGE
  $ mapps profile:set-default [-l] [-n <value>]

FLAGS
  -l, --local         Use the local project config instead of the global config.
  -n, --name=<value>  Profile name to set as default.

DESCRIPTION
  Set the default credential profile.

EXAMPLES
  $ mapps profile:set-default

  $ mapps profile:set-default --name dev
```

_See code: [src/commands/profile/set-default.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/profile/set-default.ts)_

## `mapps scheduler:create`

Create a new scheduler job for an app

```
USAGE
  $ mapps scheduler:create [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-n
    <value>] [-z us|eu|au|il] [-d <value>] [-s <value>] [-e <value>] [-r <value>] [-b <value>] [-t <value>]

FLAGS
  -a, --appId=<value>               Please enter app id:
  -b, --minBackoffDuration=<value>  Minimum backoff duration in seconds between retries (optional)
  -d, --description=<value>         Scheduled job description (optional)
  -e, --targetUrl=<value>           Target URL path for the job endpoint (will be relative to
                                    /mndy-cronjob/<YOUR_ENDPOINT>)
  -n, --name=<value>                Scheduled job name (no whitespace)
  -r, --maxRetries=<value>          Maximum number of retries for failed jobs (optional)
  -s, --schedule=<value>            Cron expression for the job schedule (relative to UTC)
  -t, --timeout=<value>             Job execution timeout in seconds (optional)
  -z, --region=<option>             Region to use
                                    <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Create a new scheduler job for an app

EXAMPLES
  $ mapps scheduler:create -a APP_ID -s "0 * * * *" -e "my-endpoint"

  $ mapps scheduler:create -a APP_ID -s "0 * * * *" -e "my-endpoint" -n "My-special-job" -d "My description"

  $ mapps scheduler:create -a APP_ID -s "0 * * * *" -e "my-endpoint" -r 3 -b 10 -t 60
```

_See code: [src/commands/scheduler/create.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/scheduler/create.ts)_

## `mapps scheduler:delete`

Delete a scheduler job for an app

```
USAGE
  $ mapps scheduler:delete [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-n
    <value>] [-z us|eu|au|il]

FLAGS
  -a, --appId=<value>    Please enter app id:
  -n, --name=<value>     Scheduled job name (no whitespace)
  -z, --region=<option>  Region to use
                         <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Delete a scheduler job for an app

EXAMPLES
  $ mapps scheduler:delete -a APP_ID -n "my-job"
```

_See code: [src/commands/scheduler/delete.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/scheduler/delete.ts)_

## `mapps scheduler:list`

List all scheduler jobs for an app

```
USAGE
  $ mapps scheduler:list [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-z
    us|eu|au|il]

FLAGS
  -a, --appId=<value>    Please enter app id:
  -z, --region=<option>  Region to use
                         <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  List all scheduler jobs for an app

EXAMPLES
  $ mapps scheduler:list -a APP_ID
```

_See code: [src/commands/scheduler/list.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/scheduler/list.ts)_

## `mapps scheduler:run`

Manually trigger a scheduled job to run for an app

```
USAGE
  $ mapps scheduler:run [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-n
    <value>] [-z us|eu|au|il]

FLAGS
  -a, --appId=<value>    Please enter app id:
  -n, --name=<value>     Scheduled job name (no whitespace)
  -z, --region=<option>  Region to use
                         <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Manually trigger a scheduled job to run for an app

EXAMPLES
  $ mapps scheduler:run -a APP_ID -n "my-job"
```

_See code: [src/commands/scheduler/run.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/scheduler/run.ts)_

## `mapps scheduler:update`

Update a scheduler job for an app

```
USAGE
  $ mapps scheduler:update [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-n
    <value>] [-z us|eu|au|il] [-d <value>] [-s <value>] [-e <value>] [-r <value>] [-b <value>] [-t <value>]

FLAGS
  -a, --appId=<value>               Please enter app id:
  -b, --minBackoffDuration=<value>  Minimum backoff duration in seconds between retries (optional)
  -d, --description=<value>         Scheduled job description (optional)
  -e, --targetUrl=<value>           Target URL path for the job endpoint (will be relative to
                                    /mndy-cronjob/<YOUR_ENDPOINT>)
  -n, --name=<value>                Scheduled job name (no whitespace)
  -r, --maxRetries=<value>          Maximum number of retries for failed jobs (optional)
  -s, --schedule=<value>            Cron expression for the job schedule (relative to UTC)
  -t, --timeout=<value>             Job execution timeout in seconds (optional)
  -z, --region=<option>             Region to use
                                    <options: us|eu|au|il>

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Update a scheduler job for an app

EXAMPLES
  $ mapps scheduler:update -a APP_ID -n "my-job" -s "0 * * * *"

  $ mapps scheduler:update -a APP_ID -n "my-job" -e "my-endpoint"

  $ mapps scheduler:update -a APP_ID -n "my-job" -d "My description" -r 3 -b 10 -t 60
```

_See code: [src/commands/scheduler/update.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/scheduler/update.ts)_

## `mapps storage:export`

Export all keys and values stored on monday for a specific customer account.

```
USAGE
  $ mapps storage:export [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-c
    <value>] [-f <value>] [-d <value>]

FLAGS
  -a, --appId=<value>            Select the app that you wish to retrieve the key for
  -c, --clientAccountId=<value>  Client account number.
  -d, --fileDirectory=<value>    Optional, file path.
  -f, --fileFormat=<value>       Optional, file format "CSV" or "JSON" (the default value is "JSON").

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Export all keys and values stored on monday for a specific customer account.

EXAMPLES
  $ mapps storage:export -a APP_ID -c CLIENT_ACCOUNT_ID -d FILE_FULL_PATH -f FILE_FORMAT
```

_See code: [src/commands/storage/export.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/storage/export.ts)_

## `mapps storage:remove-data`

Completely remove all the storage data for specific customer account.

```
USAGE
  $ mapps storage:remove-data [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-c
    <value>] [-f]

FLAGS
  -a, --appId=<value>            Select the app that you wish to remove account data for
  -c, --clientAccountId=<value>  Client account id (number)
  -f, --force                    Skip the confirmation step

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Completely remove all the storage data for specific customer account.

EXAMPLES
  $ mapps storage:remove-data -a APP_ID -c CLIENT_ACCOUNT_ID
```

_See code: [src/commands/storage/remove-data.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/storage/remove-data.ts)_

## `mapps storage:search`

Search keys and values stored on monday for a specific customer account.

```
USAGE
  $ mapps storage:search [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-a <value>] [-c
    <value>] [-t <value>]

FLAGS
  -a, --appId=<value>            Select the app that you wish to retrieve the key for
  -c, --clientAccountId=<value>  Client account number.
  -t, --term=<value>             Term to search for.

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Search keys and values stored on monday for a specific customer account.

EXAMPLES
  $ mapps storage:search -a APP_ID -c CLIENT_ACCOUNT_ID -t TERM
```

_See code: [src/commands/storage/search.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/storage/search.ts)_

## `mapps tunnel:create`

Create a networking tunnel to publicly expose code running on the local machine.

```
USAGE
  $ mapps tunnel:create [--verbose] [--print-command] [--profile <value>] [--ignore-profiles] [-p <value>] [-a
    <value>]

FLAGS
  -a, --appId=<value>  Specify an app id to get a unique tunnel domain for this app.
  -p, --port=<value>   [default: 8080] Port to forward tunnel traffic to.

GLOBAL FLAGS
  --ignore-profiles  Skip profile resolution and use the static access token (optional).
  --print-command    Print the command that was executed (optional).
  --profile=<value>  Use a specific profile for authentication (optional).
  --verbose          Print advanced logs (optional).

DESCRIPTION
  Create a networking tunnel to publicly expose code running on the local machine.

EXAMPLES
  $ mapps tunnel:create

  $ mapps tunnel:create -p PORT_FOR_TUNNEL

  $ mapps tunnel:create -a APP_ID_FOR_TUNNEL

  $ mapps tunnel:create -p PORT_FOR_TUNNEL -a APP_ID_FOR_TUNNEL
```

_See code: [src/commands/tunnel/create.ts](https://github.com/mondaycom/monday-apps-cli/blob/v4.10.5/src/commands/tunnel/create.ts)_

<!-- commandsstop -->

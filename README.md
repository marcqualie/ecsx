ecsx
====

Easily create, manage and deploy ECS based applications

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ecsx.svg)](https://npmjs.org/package/ecsx)
[![Downloads/week](https://img.shields.io/npm/dw/ecsx.svg)](https://npmjs.org/package/ecsx)
[![License](https://img.shields.io/npm/l/ecsx.svg)](https://github.com/marcqualie/ecsx/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ecsx
$ ecsx COMMAND
running command...
$ ecsx (--version)
ecsx/0.9.0 darwin-arm64 node-v22.17.1
$ ecsx --help [COMMAND]
USAGE
  $ ecsx COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ecsx config`](#ecsx-config)
* [`ecsx console [COMMAND]`](#ecsx-console-command)
* [`ecsx delete TASKNAME`](#ecsx-delete-taskname)
* [`ecsx deploy TASKNAME`](#ecsx-deploy-taskname)
* [`ecsx help [COMMAND]`](#ecsx-help-command)
* [`ecsx list-clusters`](#ecsx-list-clusters)
* [`ecsx ps`](#ecsx-ps)
* [`ecsx run TASKNAME`](#ecsx-run-taskname)
* [`ecsx scale TASKNAME COUNT`](#ecsx-scale-taskname-count)
* [`ecsx verify-config [CONFIGPATH]`](#ecsx-verify-config-configpath)

## `ecsx config`

Print out current configuration

```
USAGE
  $ ecsx config -c <value> [-h] [--var <value>...] [--taskName <value>]

FLAGS
  -c, --clusterKey=<value>  (required)
  -h, --help                Show CLI help.
  --taskName=<value>
      --var=<value>...      [default: ]

DESCRIPTION
  Print out current configuration
```

_See code: [src/commands/config.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/config.ts)_

## `ecsx console [COMMAND]`

Launch a temporary interactive container

```
USAGE
  $ ecsx console [COMMAND] -c <value> [-h]

ARGUMENTS
  COMMAND  [default: /bin/sh] Command to run in the console

FLAGS
  -c, --clusterKey=<value>  (required)
  -h, --help                Show CLI help.

DESCRIPTION
  Launch a temporary interactive container
```

_See code: [src/commands/console.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/console.ts)_

## `ecsx delete TASKNAME`

Remove a service/task from a cluster

```
USAGE
  $ ecsx delete TASKNAME -c <value> [-h] [--force]

ARGUMENTS
  TASKNAME  Name of the task to delete

FLAGS
  -c, --clusterKey=<value>  (required)
  -h, --help                Show CLI help.
  --force

DESCRIPTION
  Remove a service/task from a cluster
```

_See code: [src/commands/delete.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/delete.ts)_

## `ecsx deploy TASKNAME`

Create a task definition then deploy it as a service

```
USAGE
  $ ecsx deploy TASKNAME -c <value> -t <value> [-h] [--var <value>...]

ARGUMENTS
  TASKNAME  Name of the task to deploy

FLAGS
  -c, --clusterKey=<value>  (required)
  -h, --help                Show CLI help.
  -t, --dockerTag=<value>   (required)
      --var=<value>...      [default: ]

DESCRIPTION
  Create a task definition then deploy it as a service
```

_See code: [src/commands/deploy.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/deploy.ts)_

## `ecsx help [COMMAND]`

Display help for ecsx.

```
USAGE
  $ ecsx help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ecsx.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `ecsx list-clusters`

Show running services within a cluster

```
USAGE
  $ ecsx list-clusters [-h]

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  Show running services within a cluster
```

_See code: [src/commands/list-clusters.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/list-clusters.ts)_

## `ecsx ps`

Show running services within a cluster

```
USAGE
  $ ecsx ps [-h] [-c <value>] [--showTasks]

FLAGS
  -c, --clusterKey=<value>  Name of the cluster key from the config
  -h, --help                Show CLI help.
      --showTasks           Show recent tasks

DESCRIPTION
  Show running services within a cluster
```

_See code: [src/commands/ps.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/ps.ts)_

## `ecsx run TASKNAME`

Run a one off task on the cluster

```
USAGE
  $ ecsx run TASKNAME -c <value> -t <value> [-h] [--var <value>...]

ARGUMENTS
  TASKNAME  Name of the task to run

FLAGS
  -c, --clusterKey=<value>  (required)
  -h, --help                Show CLI help.
  -t, --dockerTag=<value>   (required)
      --var=<value>...      [default: ]

DESCRIPTION
  Run a one off task on the cluster
```

_See code: [src/commands/run.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/run.ts)_

## `ecsx scale TASKNAME COUNT`

Scale services up or down to the desired count

```
USAGE
  $ ecsx scale TASKNAME COUNT -c <value> [-h]

ARGUMENTS
  TASKNAME  Name of the task to scale
  COUNT     Number of instances to scale to

FLAGS
  -c, --clusterKey=<value>  (required)
  -h, --help                Show CLI help.

DESCRIPTION
  Scale services up or down to the desired count
```

_See code: [src/commands/scale.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/scale.ts)_

## `ecsx verify-config [CONFIGPATH]`

Scale services up or down to the desired count

```
USAGE
  $ ecsx verify-config [CONFIGPATH] [-h]

ARGUMENTS
  CONFIGPATH  Path to the configuration file

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  Scale services up or down to the desired count
```

_See code: [src/commands/verify-config.ts](https://github.com/marcqualie/ecsx/blob/v0.9.0/src/commands/verify-config.ts)_
<!-- commandsstop -->



## AWS Systems Session Manager

In order to use the `console` command, you need to have [AWS System Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html) installed on your local system.


### MacOS Quick Start

These commands are taken from the [full documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html#install-plugin-macos). You can find information on how to install on other platforms there as well.

```shell
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip" -o "sessionmanager-bundle.zip"
unzip sessionmanager-bundle.zip
sudo ./sessionmanager-bundle/install -i /usr/local/sessionmanagerplugin -b /usr/local/bin/session-manager-plugin
```



## Publishing

To publish to npm:

```shell
pnpm test # to verify everything works
pnpm build # to ensure the projcet builds properly and outputs
```

Then, manually bump version in `package.json`. Once the version is updated:

```shell
pnpm oclif readme # updates the readme with new version
git commit -am "release v1.2.3"
git tag v1.2.3
git push && git push --tags
npm publish
```

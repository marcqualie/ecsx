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
$ ecsx (-v|--version|version)
ecsx/0.4.4 darwin-x64 node-v14.15.5
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
* [`ecsx deploy TASKNAME`](#ecsx-deploy-taskname)
* [`ecsx help [COMMAND]`](#ecsx-help-command)
* [`ecsx run TASKNAME`](#ecsx-run-taskname)
* [`ecsx scale TASK COUNT`](#ecsx-scale-task-count)

## `ecsx config`

Print out current configuration

```
USAGE
  $ ecsx config

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  --taskName=taskName
  --var=var                      [default: ]
```

_See code: [src/commands/config.ts](https://github.com/marcqualie/ecsx/blob/v0.4.4/src/commands/config.ts)_

## `ecsx console [COMMAND]`

Launch a temporary interactive container

```
USAGE
  $ ecsx console [COMMAND]

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
```

_See code: [src/commands/console.ts](https://github.com/marcqualie/ecsx/blob/v0.4.4/src/commands/console.ts)_

## `ecsx deploy TASKNAME`

Create a task definition then deploy it as a service

```
USAGE
  $ ecsx deploy TASKNAME

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  -t, --dockerTag=dockerTag      (required)
  --var=var                      [default: ]
```

_See code: [src/commands/deploy.ts](https://github.com/marcqualie/ecsx/blob/v0.4.4/src/commands/deploy.ts)_

## `ecsx help [COMMAND]`

display help for ecsx

```
USAGE
  $ ecsx help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `ecsx run TASKNAME`

Run a one off task on the cluster

```
USAGE
  $ ecsx run TASKNAME

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  -t, --dockerTag=dockerTag      (required)
  --var=var                      [default: ]
```

_See code: [src/commands/run.ts](https://github.com/marcqualie/ecsx/blob/v0.4.4/src/commands/run.ts)_

## `ecsx scale TASK COUNT`

Scale services up or down to the desired count

```
USAGE
  $ ecsx scale TASK COUNT

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
```

_See code: [src/commands/scale.ts](https://github.com/marcqualie/ecsx/blob/v0.4.4/src/commands/scale.ts)_
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
yarn test # to verify everything works
yarn build # to ensure the projcet builds properly and outputs
```

Then, manually bump version in `package.json`. Once the version is updated:

```shell
oclif-dev readme # updates the readme with new version
git commit -am "version 1.2.3"
git tag v1.2.3
git push && git push --tags
npm publish
```

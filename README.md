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
ecsx/0.3.0 darwin-x64 node-v14.15.5
$ ecsx --help [COMMAND]
USAGE
  $ ecsx COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ecsx config`](#ecsx-config)
* [`ecsx create-service [TASK]`](#ecsx-create-service-task)
* [`ecsx deploy [TASK]`](#ecsx-deploy-task)
* [`ecsx help [COMMAND]`](#ecsx-help-command)
* [`ecsx register-task-definition [TASK]`](#ecsx-register-task-definition-task)
* [`ecsx run [TASK]`](#ecsx-run-task)
* [`ecsx scale [TASK] [COUNT]`](#ecsx-scale-task-count)
* [`ecsx task-definitions`](#ecsx-task-definitions)

## `ecsx config`

Print out current configuration

```
USAGE
  $ ecsx config

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  --var=var                      [default: ]
```

_See code: [src/commands/config.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/config.ts)_

## `ecsx create-service [TASK]`

Create a new service from a task definition

```
USAGE
  $ ecsx create-service [TASK]

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  -r, --revision=revision        [default: LATEST]
  --var=var                      [default: ]

EXAMPLE
  $ ecsx create-service [task] -e [environment] -r [revision]
```

_See code: [src/commands/create-service.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/create-service.ts)_

## `ecsx deploy [TASK]`

Create a task definition then deploy it as a service

```
USAGE
  $ ecsx deploy [TASK]

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  -t, --dockerTag=dockerTag      (required)
  --var=var                      [default: ]

EXAMPLE
  $ ecsx deploy [task] -e [environment] -t [dockerTag]
```

_See code: [src/commands/deploy.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/deploy.ts)_

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

## `ecsx register-task-definition [TASK]`

Register a new task definitions based on ecsx.yml

```
USAGE
  $ ecsx register-task-definition [TASK]

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  -t, --dockerTag=dockerTag      (required)
  --var=var                      [default: ]

EXAMPLE
  $ ecsx register-task-definition [task] -e [environment] -t [docker_tag] --var="secrets_key=rails/staging-vuBav5"
```

_See code: [src/commands/register-task-definition.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/register-task-definition.ts)_

## `ecsx run [TASK]`

Run a one off task on the cluster

```
USAGE
  $ ecsx run [TASK]

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help
  -t, --dockerTag=dockerTag      (required)
  --var=var                      [default: ]

EXAMPLE
  $ ecsx run [task] -e [environment] -t [dockerTag]
```

_See code: [src/commands/run.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/run.ts)_

## `ecsx scale [TASK] [COUNT]`

Scale services up or down to the desired count

```
USAGE
  $ ecsx scale [TASK] [COUNT]

OPTIONS
  -c, --clusterName=clusterName  (required)
  -h, --help                     show CLI help

EXAMPLE
  $ ecsx scale [task] [count] -e [environment]
```

_See code: [src/commands/scale.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/scale.ts)_

## `ecsx task-definitions`

List all task definitions

```
USAGE
  $ ecsx task-definitions

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ ecsx task-definitions
```

_See code: [src/commands/task-definitions.ts](https://github.com/marcqualie/ecsx/blob/v0.3.0/src/commands/task-definitions.ts)_
<!-- commandsstop -->

ecsy
====

Easily create, manage and deploy ECS based applications

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ecsy.svg)](https://npmjs.org/package/ecsy)
[![Downloads/week](https://img.shields.io/npm/dw/ecsy.svg)](https://npmjs.org/package/ecsy)
[![License](https://img.shields.io/npm/l/ecsy.svg)](https://github.com/marcqualie/ecsy/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ecsy
$ ecsy COMMAND
running command...
$ ecsy (-v|--version|version)
ecsy/0.1.0 darwin-x64 node-v14.15.5
$ ecsy --help [COMMAND]
USAGE
  $ ecsy COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ecsy hello [FILE]`](#ecsy-hello-file)
* [`ecsy help [COMMAND]`](#ecsy-help-command)

## `ecsy hello [FILE]`

describe the command here

```
USAGE
  $ ecsy hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ ecsy hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/marcqualie/ecsy/blob/v0.1.0/src/commands/hello.ts)_

## `ecsy help [COMMAND]`

display help for ecsy

```
USAGE
  $ ecsy help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->

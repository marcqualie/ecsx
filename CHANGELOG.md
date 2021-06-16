# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [Unreleased]

### Fixed

- envVars in task config were missed off for one off tasks (#39)



## [0.4.4] - 2021-06-16

### Changed

- Increase console timeout from 15 minutes to 56 minutes (#34)

### Fixed

- Prevent infinite hang when console fails to start (#37)



## [0.4.3] - 2021-06-11

### Added

- Task level `subnets` for per service network isolation.

### Changed

- Allow `command` to be empty. This will use the default container CMD.
- Allow `secrets` to be optional, since not every service needs them.
- Allow `cpu` + `memory` to be optional. Default values of `256` and `512` will be applied.
- Use `subnets` for services/tasks instead of private vs public groups



## [0.4.2] - 2021-06-02

### Fixed

- `envVars` weren't actually being passed through to docker containers



## [0.4.1] - 2021-06-02

NOTE: This version has a bug where `envVars` will not populate container env. Continuing to use `environment` (deprecated) will work however.

### Added

- Support for `envVars` at the cluster level and task level

### Changed

- Deprecated: `task.environment` has been replaced with `envVars`



## [0.4.0] - 2021-05-25

### Added

- Feature: Console command to launch temporary interactive containers.

### Removed

- Simplified available commands (#14)



## [0.3.1] - 2021-05-21

### Fixed

- Some commands (deploy, create-task) were not using the new cluster name for lookups
- Required task argument for deploys, it was possible to run without



## [0.3.0] - 2021-05-20

### Added

- Added json-schema to validate config files
- Project variable can be overriden at the cluster level

### Changed

- Breaking: Config is now parsed based on `clusterName` instead of `environment` for flexibility
- Internal: combined tsconfigs to simplify test config



## [0.2.0] - 2021-05-14

### Added

- Create services if they are new or inactive
- Config path can be set via `ECSX_CONFIG_PATH` environment variable
- CLI: scale command to quickly adjust cluster resources

### Fixed

- Filter load balancers to only include targeted task on deploy
- `desiredCount` will not reset back to 1 on each deploy

### Changed

- No longer require `AWS_PROFILE` environment variable to be set



## [0.1.1] - 2021-05-12

Initial Release.

### Added

- RegisterTaskDefinition
- CreateService
- Deploy (RegisterTaskDefinition + UpdateService)
- RunTask

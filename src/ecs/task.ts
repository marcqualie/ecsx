import { RunTaskCommandInput } from '@aws-sdk/client-ecs'

import { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  task: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
  alias?: string // Allow custom name, for example when running a console task using existing container
  enableExecuteCommand?: boolean
}

export const taskFromConfiguration = (params: Params): RunTaskCommandInput => {
  const { clusterName, task, revision, variables, config, alias, enableExecuteCommand = false } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[clusterName]
  const subnets = clusterConfig.publicSubnets
  const securityGroups = clusterConfig.securityGroups

  const overrides = (() => {
    if (enableExecuteCommand === false) {
      return undefined
    }

    return {
      containerOverrides: [
        {
          name: task,
          command: [
            'sleep',
            '900',
          ],
        },
      ],
    }
  })()

  return {
    cluster: clusterName,
    taskDefinition: `${project}-${task}-${environment}:${revision}`,
    count: 1,
    group: `task:${alias || task}`,
    launchType: 'FARGATE',
    enableExecuteCommand,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups,
        assignPublicIp: 'ENABLED',
      },
    },
    overrides,
  }
}

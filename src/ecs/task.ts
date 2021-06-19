import { RunTaskCommandInput } from '@aws-sdk/client-ecs'

import { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  taskName: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
  alias?: string // Allow custom name, for example when running a console task using existing container
  enableExecuteCommand?: boolean
}

export const taskFromConfiguration = (params: Params): RunTaskCommandInput => {
  const { clusterName, taskName, revision, variables, config, alias, enableExecuteCommand = false } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[clusterName]
  const taskConfig = config.tasks[taskName]
  const subnets = taskConfig.subnets || clusterConfig.subnets
  const securityGroups = clusterConfig.securityGroups
  const assignPublicIp = (clusterConfig.assignPublicIp === undefined ? taskConfig.assignPublicIp : clusterConfig.assignPublicIp) || false

  const overrides = (() => {
    if (enableExecuteCommand === false) {
      return undefined
    }

    // The sleep task keep the container alive for X amount of seconds
    // Once the sleep is finished, the container is exit gracefully and no longer be billed
    return {
      containerOverrides: [
        {
          name: taskName,
          command: [
            'sleep',
            '3360', // 56 minutes. vCPU units are billed per (partial) hour
          ],
        },
      ],
    }
  })()

  return {
    cluster: clusterName,
    taskDefinition: `${project}-${taskName}-${environment}:${revision}`,
    count: 1,
    group: `task:${alias || taskName}`,
    launchType: 'FARGATE',
    enableExecuteCommand,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups,
        assignPublicIp: assignPublicIp ? 'ENABLED' : 'DISABLED',
      },
    },
    overrides,
  }
}

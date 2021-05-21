import { RunTaskCommandInput } from '@aws-sdk/client-ecs'

import { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  task: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
}

export const taskFromConfiguration = (params: Params): RunTaskCommandInput => {
  const { clusterName, task, revision, variables, config } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[clusterName]
  const subnets = clusterConfig.publicSubnets
  const securityGroups = clusterConfig.securityGroups

  return {
    cluster: clusterName,
    taskDefinition: `${project}-${task}-${environment}:${revision}`,
    count: 1,
    group: `task:${task}`,
    launchType: 'FARGATE',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups,
        assignPublicIp: 'ENABLED',
      },
    },
  }
}

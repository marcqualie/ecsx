import { CreateServiceCommandInput } from '@aws-sdk/client-ecs'

import { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  taskName: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
  enableExecuteCommand?: boolean
}

export const serviceFromConfiguration = (params: Params): CreateServiceCommandInput => {
  const { clusterName, taskName, revision, variables, config, enableExecuteCommand = false } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[clusterName]
  const taskConfig = config.tasks[taskName]
  const targetGroups = clusterConfig.targetGroups
  const subnets = taskConfig.subnets || clusterConfig.subnets
  const securityGroups = clusterConfig.securityGroups
  const assignPublicIp = (clusterConfig.assignPublicIp === undefined ? taskConfig.assignPublicIp : clusterConfig.assignPublicIp) || false

  return {
    serviceName: taskName,
    cluster: clusterName,
    taskDefinition: `${project}-${taskName}-${environment}:${revision}`,
    desiredCount: 1,
    launchType: 'FARGATE',
    loadBalancers: targetGroups.filter(targetGroup => targetGroup.task === taskName).map(targetGroup => ({
      containerName: targetGroup.task,
      containerPort: targetGroup.port,
      targetGroupArn: targetGroup.arn,
    })),
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups,
        assignPublicIp: assignPublicIp ? 'ENABLED' : 'DISABLED',
      },
    },
    enableExecuteCommand,
  }
}

import { CreateServiceCommandInput } from '@aws-sdk/client-ecs'

import { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  taskName: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
}

export const serviceFromConfiguration = (params: Params): CreateServiceCommandInput => {
  const { clusterName, taskName, revision, variables, config } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[clusterName]
  const taskConfig = config.tasks[taskName]
  const targetGroups = clusterConfig.targetGroups
  const subnets = taskConfig.subnets || clusterConfig.subnets
  const securityGroups = clusterConfig.securityGroups

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
        assignPublicIp: 'DISABLED',
      },
    },
  }
}

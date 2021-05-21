import { CreateServiceCommandInput } from '@aws-sdk/client-ecs'

import { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  task: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
}

export const serviceFromConfiguration = (params: Params): CreateServiceCommandInput => {
  const { clusterName, task, revision, variables, config } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[clusterName]
  const targetGroups = clusterConfig.targetGroups
  const subnets = clusterConfig.publicSubnets
  const securityGroups = clusterConfig.securityGroups

  return {
    serviceName: task,
    cluster: clusterName,
    taskDefinition: `${project}-${task}-${environment}:${revision}`,
    desiredCount: 1,
    launchType: 'FARGATE',
    loadBalancers: targetGroups.filter(targetGroup => targetGroup.task === task).map(targetGroup => ({
      containerName: targetGroup.task,
      containerPort: targetGroup.port,
      targetGroupArn: targetGroup.arn,
    })),
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups,
        assignPublicIp: 'ENABLED',
      },
    },
  }
}

import { CreateServiceCommandInput } from '@aws-sdk/client-ecs'

import {Configuration, ConfiguredVariables} from '../types/configuration'

interface Params {
  task: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
}

export const serviceFromConfiguration = (params: Params): CreateServiceCommandInput => {
  const { task, revision, variables, config } = params
  const { project, environment } = variables

  const clusterConfig = config.clusters[environment]
  const targetGroups = clusterConfig.targetGroups
  const subnets = clusterConfig.publicSubnets
  const securityGroups = clusterConfig.securityGroups

  return {
    serviceName: task,
    cluster: `${project}-${environment}`,
    taskDefinition: `${project}-${task}-${environment}:${revision}`,
    desiredCount: 1,
    launchType: 'FARGATE',
    loadBalancers: targetGroups.map(targetGroup => ({
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

import { CreateServiceCommandInput } from '@aws-sdk/client-ecs'
import flatten from 'lodash/flatten'

import {Configuration, ConfigurationTaskDefinition, Variables} from '../types/configuration'

interface Params {
  family: string
  task: string
  environment: string
  revision: string
  variables: Variables
  config: Configuration
}

export const fromTaskDefinitionConfiguration = (params: Params): CreateServiceCommandInput => {
  const { family, task, environment, revision, variables, config } = params

  const clusterConfig = config.clusters[environment]
  const targetGroups = clusterConfig.targetGroups
  const subnets = clusterConfig.publicSubnets
  const securityGroups = clusterConfig.securityGroups

  return {
    serviceName: task,
    cluster: `${family}-${environment}`,
    taskDefinition: `${family}-${task}-${environment}:${revision}`,
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

import { findCluster } from '../config'

import type { CreateServiceCommandInput } from '@aws-sdk/client-ecs'
import type { Configuration, ConfiguredVariables } from '../types/configuration'

interface Params {
  clusterName: string
  taskName: string
  revision: string
  variables: ConfiguredVariables
  config: Configuration
}

export const serviceFromConfiguration = (
  params: Params,
): CreateServiceCommandInput => {
  const { clusterName, taskName, revision, variables, config } = params
  const { project, environment, region } = variables

  const clusterConfig = findCluster(config, clusterName, region)
  if (clusterConfig === undefined) {
    throw new Error('Cluster not found')
  }

  const taskConfig = config.tasks[taskName]
  const targetGroups = clusterConfig.targetGroups
  const taskSubnet = taskConfig.subnet
  const subnets = clusterConfig.subnets[taskSubnet]
  const securityGroups = clusterConfig.securityGroups
  const assignPublicIp = taskSubnet === 'public'

  return {
    serviceName: taskName,
    cluster: clusterName,
    taskDefinition: `${project}-${taskName}-${environment}:${revision}`,
    desiredCount: 1,
    launchType: 'FARGATE',
    loadBalancers: targetGroups
      .filter((targetGroup) => targetGroup.task === taskName)
      .map((targetGroup) => ({
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
  }
}

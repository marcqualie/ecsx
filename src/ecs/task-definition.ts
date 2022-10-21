import { RegisterTaskDefinitionCommandInput } from '@aws-sdk/client-ecs'
import flatten from 'lodash/flatten'
import { findCluster } from '../config'

import { Configuration, ConfigurationTaskDefinition, ConfiguredVariables, KeyValuePairs } from '../types/configuration'

const environmentFromEnvVars = (envVars: KeyValuePairs) => {
  return Object.entries(envVars).map(([key, value]) => (
    {
      name: key,
      value,
    }
  ))
}

export const secretsFromConfiguration = (task: string, clusterName: string, config: Configuration, region: string) => {
  const taskConfig = config.tasks[task]
  const clusterConfig = findCluster(config, clusterName, region)
  if (clusterConfig === undefined) {
    throw new Error('Cluster not found')
  }

  const clusterSecrets = clusterConfig.secrets || {}
  const taskSecrets = taskConfig.secrets || []
  const secretsMap: Record<string, string[]> = {}

  for (const entry of taskSecrets) {
    const secretDefinition = clusterSecrets[entry.name]
    const hasClusterKeys = typeof secretDefinition !== 'string'
    const arn = hasClusterKeys ? secretDefinition.arn : secretDefinition
    for (const key of entry.keys) {
      secretsMap[arn] = secretsMap[arn] || []
      secretsMap[arn].push(key)
    }
  }

  for (const definition of Object.values(clusterSecrets)) {
    const hasClusterKeys = typeof definition !== 'string'
    const arn = hasClusterKeys ? definition.arn : definition
    const keys = hasClusterKeys ? definition.keys : []
    for (const key of keys) {
      secretsMap[arn] = secretsMap[arn] || []
      secretsMap[arn].push(key)
    }
  }

  return flatten(Object.entries(secretsMap).map(([arn, keys]) => {
    return keys.map(key => ({
      name: key,
      valueFrom: `${arn}:${key}::`,
    }))
  })).sort((a, b) => a.name.localeCompare(b.name))
}

const portMappingsFromConfiguration = (config: ConfigurationTaskDefinition) => {
  if (config.ports) {
    return config.ports.map(port => ({
      containerPort: port,
    }))
  }
}

const logConfigurationFromConfiguration = (task: string, variables: ConfiguredVariables) => {
  return {
    logDriver: 'awslogs',
    secretOptions: [],
    options: {
      'awslogs-create-group': 'true',
      'awslogs-group': `/ecs/${variables.project}-${variables.environment}`,
      'awslogs-region': variables.region,
      'awslogs-stream-prefix': `${task}`,
    },
  }
}

interface Params {
  clusterName: string
  taskName: string
  variables: ConfiguredVariables
  config: Configuration
  envVars: KeyValuePairs
}

const containerDefinitionFromConfiguration = (params: Params, taskName: string) => {
  const { clusterName, variables, config, envVars } = params
  const { region } = variables
  const taskConfig = config.tasks[taskName]

  return {
    name: taskName,
    image: taskConfig.image,
    command: taskConfig.command,
    portMappings: portMappingsFromConfiguration(taskConfig),
    environment: environmentFromEnvVars(envVars),
    secrets: secretsFromConfiguration(taskName, clusterName, config, region),
    logConfiguration: logConfigurationFromConfiguration(taskName, variables),
    essential: true,
    readonlyRootFilesystem: false,
    dependsOn: taskConfig.dependsOn,
  }
}

export const taskDefinitionfromConfiguration = (params: Params): RegisterTaskDefinitionCommandInput => {
  const { taskName, variables, config } = params
  const { project, environment } = variables
  const taskConfig = config.tasks[taskName]

  const taskNames = taskConfig.siblingContainers ? [taskName, ...taskConfig.siblingContainers] : [taskName]
  const containerDefinitions = taskNames.map(name => containerDefinitionFromConfiguration(params, name))

  return {
    family: `${project}-${taskName}-${environment}`,
    taskRoleArn: taskConfig.taskRoleArn,
    executionRoleArn: taskConfig.executionRoleArn,
    networkMode: 'awsvpc',
    requiresCompatibilities: [
      'FARGATE',
    ],
    cpu: (taskConfig.cpu || 256).toString(),
    memory: (taskConfig.memory || 512).toString(),
    containerDefinitions,
  }
}

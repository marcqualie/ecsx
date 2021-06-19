import { RegisterTaskDefinitionCommandInput } from '@aws-sdk/client-ecs'
import flatten from 'lodash/flatten'

import { Configuration, ConfigurationTaskDefinition, ConfiguredVariables, KeyValuePairs } from '../types/configuration'

const environmentFromEnvVars = (envVars: KeyValuePairs) => {
  return Object.entries(envVars).map(([key, value]) => (
    {
      name: key,
      value,
    }
  ))
}

export const secretsFromConfiguration = (task: string, clusterName: string, config: Configuration) => {
  const taskConfig = config.tasks[task]
  const clusterConfig = config.clusters[clusterName]
  const clusterSecrets = clusterConfig.secrets || {}
  const taskSecrets = taskConfig.secrets || []
  return flatten(taskSecrets.map(entry => {
    const arn = clusterSecrets[entry.name]
    return entry.keys.map(key => {
      return {
        name: key,
        valueFrom: `${arn}:${key}::`,
      }
    })
  }))
}

const portMappingsFromConfiguration = (config: ConfigurationTaskDefinition) => {
  if (config.ports) {
    return config.ports.map(port => ({
      containerPort: port,
    }))
  }

  return undefined
}

const logConfigurationFromConfiguration = (task: string, variables: ConfiguredVariables) => {
  return {
    logDriver: 'awslogs',
    secretOptions: [],
    options: {
      'awslogs-create-group': 'true',
      'awslogs-group': `/ecs/${variables.project}/${task}`,
      'awslogs-region': variables.region,
      'awslogs-stream-prefix': `${variables.environment}`,
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

export const taskDefinitionfromConfiguration = (params: Params): RegisterTaskDefinitionCommandInput => {
  const { clusterName, taskName, variables, config, envVars } = params
  const { project, environment } = variables
  const taskConfig = config.tasks[taskName]

  // We need a config to continue
  if (taskConfig === undefined) {
    const validTaskNames = Object.keys(config.tasks).filter(task => !task.startsWith('$')).join(', ')
    throw new Error(`Could not locate task definition for ${taskName}. Try one of "${validTaskNames}"`)
  }

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
    containerDefinitions: [
      {
        name: taskName,
        image: taskConfig.image,
        command: taskConfig.command,
        portMappings: portMappingsFromConfiguration(taskConfig),
        environment: environmentFromEnvVars(envVars),
        secrets: secretsFromConfiguration(taskName, clusterName, config),
        logConfiguration: logConfigurationFromConfiguration(taskName, variables),
        essential: true,
        readonlyRootFilesystem: false,
      },
    ],
  }
}

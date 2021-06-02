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
  return flatten(taskConfig.secrets.map(entry => {
    const arn = clusterConfig.secrets[entry.name]
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
  task: string
  variables: ConfiguredVariables
  config: Configuration
  envVars: KeyValuePairs
}

export const taskDefinitionfromConfiguration = (params: Params): RegisterTaskDefinitionCommandInput => {
  const { clusterName, task, variables, config, envVars } = params
  const { project, environment } = variables
  const taskConfig = config.tasks[task]

  return {
    family: `${project}-${task}-${environment}`,
    taskRoleArn: taskConfig.taskRoleArn,
    executionRoleArn: taskConfig.executionRoleArn,
    networkMode: 'awsvpc',
    requiresCompatibilities: [
      'FARGATE',
    ],
    cpu: taskConfig.cpu.toString(),
    memory: taskConfig.memory.toString(),
    containerDefinitions: [
      {
        name: task,
        image: taskConfig.image,
        command: taskConfig.command,
        portMappings: portMappingsFromConfiguration(taskConfig),
        environment: environmentFromEnvVars(envVars),
        secrets: secretsFromConfiguration(task, clusterName, config),
        logConfiguration: logConfigurationFromConfiguration(task, variables),
        essential: true,
        readonlyRootFilesystem: false,
      },
    ],
  }
}

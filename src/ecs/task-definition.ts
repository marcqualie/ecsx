import { RegisterTaskDefinitionCommandInput } from '@aws-sdk/client-ecs'
import flatten from 'lodash/flatten'

import { Configuration, ConfigurationTaskDefinition, ConfiguredVariables } from '../types/configuration'

const environmentFromConfiguration = (config: ConfigurationTaskDefinition) => {
  return Object.entries(config.environment).map(([key, value]) => (
    {
      name: key,
      value,
    }
  ))
}

export const secretsFromConfiguration = (task: string, environment: string, config: Configuration) => {
  const taskConfig = config.tasks[task]
  const clusterConfig = config.clusters[environment]
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
  task: string
  variables: ConfiguredVariables
  config: Configuration
}

export const taskDefinitionfromConfiguration = (params: Params): RegisterTaskDefinitionCommandInput => {
  const { task, variables, config } = params
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
        environment: environmentFromConfiguration(taskConfig),
        secrets: secretsFromConfiguration(task, environment, config),
        logConfiguration: logConfigurationFromConfiguration(task, variables),
        essential: true,
      },
    ],
  }
}

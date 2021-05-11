import { RegisterTaskDefinitionCommandInput } from '@aws-sdk/client-ecs'
import flatten from 'lodash/flatten'

import {ConfigurationTaskDefinition, Variables} from '../types/configuration'

const environmentFromConfiguration = (config: ConfigurationTaskDefinition) => {
  return Object.entries(config.environment).map(([key, value]) => (
    {
      name: key,
      value,
    }
  ))
}

const secretsFromConfiguration = (config: ConfigurationTaskDefinition) => {
  return flatten(config.secrets.map(entry => {
    return entry.keys.map(key => {
      return {
        name: key,
        valueFrom: `${entry.arn}:${key}::`,
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

const logConfigurationFromConfiguration = (family: string, task: string, variables: Variables) => {
  return {
    logDriver: 'awslogs',
    secretOptions: [],
    options: {
      "awslogs-create-group": "true",
      "awslogs-group": `/ecs/${family}/${task}`,
      "awslogs-region": variables.region,
      "awslogs-stream-prefix": `${variables.environment}`,
    }
  }
}

interface Params {
  family: string
  task: string
  environment: string
  variables: Variables
  config: ConfigurationTaskDefinition
}

export const taskDefinitionfromConfiguration = (params: Params): RegisterTaskDefinitionCommandInput => {
  const { family, task, environment, variables, config } = params

  return {
    family: `${family}-${task}-${variables.environment}`,
    taskRoleArn: config.taskRoleArn,
    executionRoleArn: config.executionRoleArn,
    networkMode: 'awsvpc',
    requiresCompatibilities: [
      'FARGATE'
    ],
    cpu: config.cpu.toString(),
    memory: config.memory.toString(),
    containerDefinitions: [
      {
        name: task,
        image: config.image,
        command: config.command,
        portMappings: portMappingsFromConfiguration(config),
        environment: environmentFromConfiguration(config),
        secrets: secretsFromConfiguration(config),
        logConfiguration: logConfigurationFromConfiguration(family, task, variables),
        essential: true,
      },
    ],
  }
}
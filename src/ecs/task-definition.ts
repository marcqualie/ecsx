import { RegisterTaskDefinitionCommandInput } from '@aws-sdk/client-ecs'
import flatten from 'lodash/flatten'

import {ConfigurationTaskDefinition} from '../types/configuration'

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

export const fromTaskDefinitionConfiguration = (family: string, task: string, variables: any, config: ConfigurationTaskDefinition): RegisterTaskDefinitionCommandInput => {
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
        essential: true,
      },
    ],
  }
}

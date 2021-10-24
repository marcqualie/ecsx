import fs from 'fs'
import yaml from 'js-yaml'
import { Configuration, ConfiguredVariables, KeyValuePairs, Variables } from './types/configuration'
import { variablesFromCluster } from './utils/variables-from-cluster'
import { envVarsFromCluster, envVarsFromTask } from './utils/env-vars-from'

const { ECSX_CONFIG_PATH } = process.env

export class Config {
  path: string

  constructor(path = ECSX_CONFIG_PATH || './ecsx.yml') {
    this.path = path
  }

  parse(variables: Variables & { clusterName?: string, taskName?: string }): { config: Configuration, variables: ConfiguredVariables, envVars: KeyValuePairs } {
    let content = fs.readFileSync(this.path, 'utf-8')

    // Read config to get global variables, which can replace other variables
    let data = yaml.load(content) as any
    const defaultVariables = {
      region: data.region || 'us-east-1',
      accountId: data.accountId,
      project: data.project,
    }
    const combinedVariables: ConfiguredVariables = {
      ...defaultVariables,
      ...variables,
      ...(variables.clusterName ? variablesFromCluster(variables.clusterName, data) : {}),
    }

    // Ensure all required variables are present
    const requiredVariables = [
      'region',
      'accountId',
      'project',
    ]
    for (const key of requiredVariables) {
      const value = combinedVariables[key] || undefined
      if (value === undefined || value === '') {
        throw new Error(`Missing required variable: ${key} (Please define globally, or per cluster)`)
      }
    }

    // Replace variables in raw content before decoding to YAML
    for (const [key, value] of Object.entries(combinedVariables)) {
      if (content.includes(`{{ ${key} }}`)) {
        content = content.replace(new RegExp(`{{ ${key} }}`, 'g'), value ? value.toString() : '')
      }
    }

    // Environment variables are added to container at runtime
    let envVars = {
      ...(variables.clusterName ? envVarsFromCluster(variables.clusterName, data) : {}),
      ...envVarsFromTask(variables.taskName, data),
    }
    for (const [envKey, envValue] of Object.entries(envVars)) {
      for (const [key, value] of Object.entries(combinedVariables)) {
        if (envValue.includes(`{{ ${key} }}`)) {
          const newValue = envValue.replace(new RegExp(`{{ ${key} }}`, 'g'), value ? value.toString() : '')
          envVars = { ...envVars, [envKey]: newValue }
        }
      }
    }

    // Re-parse and apply defaults
    // TODO: Find a cleaner way of applying all defaults as pre schema.json definitions
    data = yaml.load(content)
    for (const taskName of Object.keys(data.tasks)) {
      data.tasks[taskName].subnet = data.tasks[taskName].subnet || 'public'
    }

    return {
      config: data,
      variables: combinedVariables,
      envVars,
    }
  }
}

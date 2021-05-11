import fs from 'fs'
import yaml from 'js-yaml'
import {Configuration, ConfiguredVariables, Variables} from './types/configuration'

export class Config {
  path: string

  constructor(path = './ecsy.yml') {
    this.path = path
  }

  parse(variables: Variables): { config: Configuration, variables: ConfiguredVariables } {
    let content = fs.readFileSync(this.path, 'utf-8')

    // Read config to get global variables, which can replace other variables
    let data = yaml.load(content) as any
    const defaultVariables = {
      region: data.region,
      accountId: data.accountId,
      project: data.project,
    }
    const combinedVariables: ConfiguredVariables = {
      ...defaultVariables,
      ...variables,
      environment: variables.environment || 'development',
    }

    // Ensure all required variables are present
    const requiredVariables = ['region', 'accountId', 'project']
    for (const key of requiredVariables) {
      const value = combinedVariables[key] || undefined
      if (value === undefined || value === '') {
        throw new Error(`Missing requied variable: ${key}`)
      }
    }

    // Replace variables in raw content before decoding to YAML
    for (const [key, value] of Object.entries(combinedVariables)) {
      content = content.replace(new RegExp(`{{ ${key} }}`, 'g'), value || '')
    }

    data = yaml.load(content)
    return {
      config: data,
      variables: combinedVariables,
    }
  }
}

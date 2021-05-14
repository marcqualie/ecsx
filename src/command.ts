/* eslint-disable no-warning-comments */
import Command from '@oclif/command'
import { Config } from './config'

import { client } from './ecs/client'
import { Variables } from './types/configuration'

export class AwsCommand extends Command {
  configWithVariables(variables: Variables = {}) {
    const initialVariables = {
      ...this.variables(),
      ...variables,
    }
    const configParser = new Config()
    return configParser.parse(initialVariables)
  }

  ecs_client() {
    return client
  }

  variables() {
    const { flags } = this.parse() as any
    const flagVars = flags.var || []

    const variables: { [key: string]: string } = {}
    for (const pair of flagVars) {
      const [key, value] = pair.split('=')
      variables[key] = value
    }

    return variables
  }

  async run() {
    this.log('Default AWS Command')
  }
}

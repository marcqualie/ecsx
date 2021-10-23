import Command from '@oclif/command'

import { client } from './ecs/client'
import { ClusterVariables } from './types/configuration'
import { configWithVariables } from './utils/config-with-variables'

export class AwsCommand extends Command {
  configWithVariables(variables: ClusterVariables) {
    const initialVariables = {
      ...this.variables(),
      ...variables,
    }
    return configWithVariables(initialVariables)
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

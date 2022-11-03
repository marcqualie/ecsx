import { Command } from '@oclif/core'
import { clientBuilder } from './ecs/client'

import { ClusterVariables } from './types/configuration'
import { configWithVariables } from './utils/config-with-variables'

export class AwsCommand extends Command {
  async configWithVariables(variables: ClusterVariables) {
    const initialVariables = {
      ...(await this.variables()),
      ...variables,
    }
    return configWithVariables(initialVariables)
  }

  ecsClient({ region }: { region?: string }) {
    return clientBuilder({ region: region || 'eu-central-1' })
  }

  async variables() {
    const { flags } = await this.parse()
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

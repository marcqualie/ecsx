/* eslint-disable no-warning-comments */
import Command from '@oclif/command'
import { Config } from './config'

import { client } from './ecs/client'
import { Variables } from './types/configuration'

export class AwsCommand extends Command {
  // Ensure AWS_PROFILE is set, otherwise we may connect to the wrong account
  // TODO: Figure out how to run this by default
  ensure_aws_profile() {
    const AWS_PROFILE = process.env.AWS_PROFILE || undefined
    if (AWS_PROFILE === '' || AWS_PROFILE === undefined) {
      this.error('Please ensure AWS_PROFILE environment variable is set.')
    }

    return AWS_PROFILE
  }

  configWithVariables(variables: Variables = {}) {
    const initialVariables = {
      ...this.variables(),
      ...variables,
    }
    const configParser = new Config()
    return configParser.parse(initialVariables)
  }

  ecs_client() {
    this.ensure_aws_profile()

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

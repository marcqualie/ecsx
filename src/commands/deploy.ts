import { Flags } from '@oclif/core'

import { AwsCommand } from '../command'
import { deployService } from '../ecs/deploy-service'

export default class DeployCommand extends AwsCommand {
  static description = 'Create a task definition then deploy it as a service'

  static flags = {
    help: Flags.help({ char: 'h' }),
    var: Flags.string({
      multiple: true,
      default: [],
    }),
    clusterKey: Flags.string({
      char: 'c',
      required: true,
    }),
    dockerTag: Flags.string({
      char: 't',
      required: true,
    }),
  }

  static args = [
    {
      name: 'taskName',
      type: 'string',
      required: true,
    },
  ]

  async run() {
    const { args: { taskName }, flags: { clusterKey, dockerTag } } = await this.parse(DeployCommand)
    const { config, variables, envVars } = await this.configWithVariables({
      clusterKey,
      taskName,
      dockerTag,
    })
    const { clusterName, region } = variables
    if (clusterName === undefined) {
      throw new Error('Could not detect $clusterName')
    }

    const service = await deployService({
      clusterName,
      taskName,
      variables,
      config,
      envVars,
    })

    for (const [key, value] of Object.entries(service)) {
      this.log(`> ${key}: ${value}`)
    }
  }
}

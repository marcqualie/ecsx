import { Flags } from '@oclif/core'

import { AwsCommand } from '../command'

export default class ListClustersCommand extends AwsCommand {
  static description = 'Show running services within a cluster'

  static flags = {
    help: Flags.help({
      char: 'h',
    }),
  }

  async run() {
    const { config } = await this.configWithVariables({})
    for (const [clusterName] of Object.entries(config.clusters)) {
      this.log(clusterName)
    }
  }
}

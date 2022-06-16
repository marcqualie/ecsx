import { flags } from '@oclif/command'

import { AwsCommand } from '../command'

export default class ListClustersCommand extends AwsCommand {
  static description = 'Show running services within a cluster'

  static flags = {
    help: flags.help({
      char: 'h',
    }),
  }

  async run() {
    const { config } = this.configWithVariables({})
    for (const [clusterName] of Object.entries(config.clusters)) {
      this.log(clusterName)
    }
  }
}

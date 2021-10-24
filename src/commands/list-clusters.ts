import { flags } from '@oclif/command'
import cli from 'cli-ux'
import uniq from 'lodash/uniq'

import { AwsCommand } from '../command'
import { Config } from '../config'

export default class PsCommand extends AwsCommand {
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

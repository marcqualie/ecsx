import { flags } from '@oclif/command'
import { AwsCommand } from '../command'

export default class Config extends AwsCommand {
  static description = 'Print out current configuration'

  static flags = {
    help: flags.help({ char: 'h' }),
    var: flags.string({
      multiple: true,
      default: [],
    }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
  }

  async run() {
    const { flags: { clusterName } } = this.parse(Config)
    const { config, variables } = this.configWithVariables({
      clusterName,
    })
    this.log(JSON.stringify(variables, undefined, 2))
    this.log(JSON.stringify(config, undefined, 2))
  }
}

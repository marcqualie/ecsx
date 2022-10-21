import { Flags } from '@oclif/core'
import { AwsCommand } from '../command'

export default class Config extends AwsCommand {
  static description = 'Print out current configuration'

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
    taskName: Flags.string(),
  }

  async run() {
    const { flags: { clusterKey, taskName } } = await this.parse(Config)
    const { config, variables, envVars } = await this.configWithVariables({
      clusterKey,
      taskName,
    })
    this.log('$variables', JSON.stringify(variables, undefined, 2))
    this.log('$envVars', JSON.stringify(envVars, undefined, 2))
    this.log(' ')
    this.log(JSON.stringify(config, undefined, 2))
  }
}

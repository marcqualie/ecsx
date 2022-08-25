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
    clusterKey: flags.string({
      char: 'c',
      required: true,
    }),
    taskName: flags.string(),
  }

  async run() {
    const { flags: { clusterKey, taskName } } = this.parse(Config)
    const { variables, envVars } = this.configWithVariables({
      clusterKey,
      taskName,
    })
    this.log('$variables', JSON.stringify(variables, undefined, 2))
    this.log('$envVars', JSON.stringify(envVars, undefined, 2))
    this.log(' ')
    this.log(JSON.stringify(config, undefined, 2))
  }
}

import {flags} from '@oclif/command'
import {AwsCommand} from '../command'

export default class Config extends AwsCommand {
  static description = 'Print out current configuration'

  static flags = {
    help: flags.help({char: 'h'}),
    var: flags.string({
      multiple: true,
      default: [],
    }),
  }

  async run() {
    const config = this.configuration({variables: this.variables()})
    this.log(JSON.stringify(config, undefined, 2))
  }
}

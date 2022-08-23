import { flags } from '@oclif/command'
import { AwsCommand } from '../command'
import { taskDefinitionfromConfiguration } from '../ecs/task-definition'

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
    const { config, variables, envVars } = this.configWithVariables({
      clusterKey,
      taskName,
    })
    const { clusterName } = variables

    if (clusterName === undefined || taskName === undefined) {
      throw new Error('Could not detect $clusterName and $taskName')
    }

    const taskDefinitionInput = taskDefinitionfromConfiguration({
      clusterName,
      taskName,
      variables,
      config,
      envVars,
    })

    this.log('$variables', JSON.stringify(variables, undefined, 2))
    this.log('$envVars', JSON.stringify(envVars, undefined, 2))
    this.log(' ')
    // this.log(JSON.stringify(config, undefined, 2))
    this.log(JSON.stringify(taskDefinitionInput, undefined, 2))
  }
}

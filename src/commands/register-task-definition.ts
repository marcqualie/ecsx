import {flags} from '@oclif/command'
import {AwsCommand} from '../command'
import {fromTaskDefinitionConfiguration} from '../ecs/task-definition'

export default class RegisterTaskDefinitions extends AwsCommand {
  static description = 'List all task definitions'

  static flags = {
    help: flags.help({char: 'h'}),
    var: flags.string({
      multiple: true,
      default: [],
    }),
  }

  static args = [
    {
      name: 'family',
      type: 'string',
    },
    {
      name: 'task',
      type: 'string',
    },
  ]

  async run() {
    const {args: {family, task}} = this.parse(RegisterTaskDefinitions)
    const variables = this.variables()
    const config = this.configuration({variables})
    const taskDefinitionConfig = config.taskDefinitions[task]
    const taskDefinition = fromTaskDefinitionConfiguration(family, task, variables, taskDefinitionConfig)
    this.log(JSON.stringify(taskDefinition, undefined, 2))
  }
}

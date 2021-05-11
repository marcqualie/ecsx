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

    // Generate task definition input and send request to AWS API
    const taskDefinitionInput = fromTaskDefinitionConfiguration(family, task, variables, taskDefinitionConfig)
    const response = await this.ecs_client().registerTaskDefinition(taskDefinitionInput)
    const { taskDefinition } = response
    if (taskDefinition === undefined) {
      this.error(`Could not create task definition: ${response}`)
    }

    // Handy JSON output
    this.log(JSON.stringify({
      arn: taskDefinition.taskDefinitionArn,
      family: taskDefinition.family,
      revision: taskDefinition.revision,
    }, undefined, 2))
  }
}

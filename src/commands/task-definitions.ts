import { flags } from '@oclif/command'
import { AwsCommand } from '../command'

export default class TaskDefinitionsCommand extends AwsCommand {
  static description = 'List all task definitions'

  static examples = [
    '$ ecsx task-definitions',
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const data = await this.ecs_client().listTaskDefinitions()
    const taskDefinitions = data.taskDefinitionArns || []
    for (const taskDefinition of taskDefinitions) {
      this.log(taskDefinition)
    }
  }
}

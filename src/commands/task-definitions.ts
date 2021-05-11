import {Command, flags} from '@oclif/command'
import { client, listTaskDefinitions } from '../ecs/client'
import { AwsCommand } from '../command'

export default class TaskDefinitions extends AwsCommand {
  static description = 'List all task definitions'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const data = await this.ecs_client().listTaskDefinitions()
    const taskDefinitions = data.taskDefinitionArns || []
    for (const taskDefinition of taskDefinitions) {
      this.log(taskDefinition)
    }
  }
}

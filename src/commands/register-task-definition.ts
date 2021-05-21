import { flags } from '@oclif/command'
import { AwsCommand } from '../command'
import { taskDefinitionfromConfiguration } from '../ecs/task-definition'

export default class RegisterTaskDefinitionCommand extends AwsCommand {
  static description = 'Register a new task definitions based on ecsx.yml'

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
    dockerTag: flags.string({
      char: 't',
      required: true,
    }),
  }

  static args = [
    {
      name: 'task',
      type: 'string',
      required: true,
    },
  ]

  async run() {
    const { args: { task }, flags: { clusterName, dockerTag } } = this.parse(RegisterTaskDefinitionCommand)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables({
      clusterName,
      dockerTag,
    })

    // Generate task definition input and send request to AWS API
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      clusterName,
      task,
      variables,
      config,
    })
    const response = await client.registerTaskDefinition(taskDefinitionInput)
    const { taskDefinition } = response
    if (taskDefinition === undefined) {
      this.error(`Could not create task definition: ${response}`)
    }

    // Handy JSON output
    this.log(JSON.stringify({
      arn: taskDefinition.taskDefinitionArn,
      revision: taskDefinition.revision,
    }, undefined, 2))
  }
}

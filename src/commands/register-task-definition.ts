import { flags } from '@oclif/command'
import { AwsCommand } from '../command'
import { taskDefinitionfromConfiguration } from '../ecs/task-definition'

export default class RegisterTaskDefinitionCommand extends AwsCommand {
  static description = 'Register a new task definitions based on ecsx.yml'

  static examples = [
    '$ ecsx register-task-definition [task] -e [environment] -t [docker_tag] --var="secrets_key=rails/staging-vuBav5"',
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    var: flags.string({
      multiple: true,
      default: [],
    }),
    environment: flags.string({
      char: 'e',
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
    },
  ]

  async run() {
    const { args: { task }, flags: { environment, dockerTag } } = this.parse(RegisterTaskDefinitionCommand)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables({
      dockerTag,
      environment,
    })
    const taskDefinitionConfig = config.tasks[task]

    // Generate task definition input and send request to AWS API
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      task,
      variables,
      config: taskDefinitionConfig,
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

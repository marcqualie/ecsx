import {flags} from '@oclif/command'
import {AwsCommand} from '../command'
import {taskDefinitionfromConfiguration} from '../ecs/task-definition'

export default class RegisterTaskDefinitions extends AwsCommand {
  static description = 'List all task definitions'

  static examples = [
    '$ ecsy register-task-definition [family] [task] -e [environment] -t [docker_tag] --var="secrets_key=rails/staging-vuBav5"'
  ]

  static flags = {
    help: flags.help({char: 'h'}),
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
      name: 'family',
      type: 'string',
    },
    {
      name: 'task',
      type: 'string',
    },
  ]

  async run() {
    const {args: {family, task}, flags:{environment,dockerTag}} = this.parse(RegisterTaskDefinitions)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables({
      dockerTag,
      environment,
    })
    const taskDefinitionConfig = config.tasks[task]

    // Generate task definition input and send request to AWS API
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      family,
      task,
      variables,
      environment,
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
      family: taskDefinition.family,
      revision: taskDefinition.revision,
    }, undefined, 2))
  }
}

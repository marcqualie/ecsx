import {flags} from '@oclif/command'
import {AwsCommand} from '../command'
import {taskDefinitionfromConfiguration} from '../ecs/task-definition'
import { taskFromConfiguration } from '../ecs/task'

export default class RunCommand extends AwsCommand {
  static description = "Run a one off task on the cluster"

  static examples = [
    '$ ecsx run [task] -e [environment] -t [dockerTag]'
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
      name: 'task',
      type: 'string',
    },
  ]

  async run() {
    const {args: {task}, flags: {environment,dockerTag}} = this.parse(RunCommand)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables({
      environment,
      dockerTag,
    })
    const { accountId, project, region } = variables

    // Generate Task Definition
    const taskDefinitionConfig = config.tasks[task]
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      task,
      variables,
      config: taskDefinitionConfig,
    })
    const taskDefinitionResponse = await client.registerTaskDefinition(taskDefinitionInput)
    const { taskDefinition } = taskDefinitionResponse
    if (taskDefinition === undefined) {
      this.error(`Could not create task definition: ${taskDefinitionResponse}`)
    }

    // Run task using created definition
    const taskInput = taskFromConfiguration({
      task,
      revision: taskDefinition.revision?.toString() || '',
      variables,
      config,
    })
    const runTaskResponse = await client.runTask(taskInput)
    const { tasks } = runTaskResponse
    if (tasks === undefined || tasks.length === 0) {
      this.error(`Could not create task definition: ${runTaskResponse}`)
    }

    this.log(JSON.stringify({
      arns: tasks.map(task => task.taskArn),
      urls: tasks.map(task => {
        const id = task.taskArn?.replace(`arn:aws:ecs:${region}:${accountId}:task/${project}-${environment}/`, '')
        return `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/tasks/${id}/logs?region=${region}`
      }),
    }, undefined, 2))
  }
}
import {flags} from '@oclif/command'
import {AwsCommand} from '../command'
import {taskDefinitionfromConfiguration} from '../ecs/task-definition'
import {serviceFromConfiguration} from '../ecs/service'
import { TaskDefinition } from '@aws-sdk/client-ecs'

export default class RegisterTaskDefinitions extends AwsCommand {
  static description = 'List all task definitions'

  static examples = [
    '$ ecsy deploy [family] [task] -e [environment] -t [dockerTag]'
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
    const {args: {family, task}, flags: {environment,dockerTag}} = this.parse(RegisterTaskDefinitions)
    const client = this.ecs_client()
    const variables = {
      ...this.variables(),
      environment,
      dockerTag,
    }
    const config = this.configuration({variables})
    const taskDefinitionConfig = config.tasks[task]

    // Generate Task Definition
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      family,
      task,
      environment,
      variables,
      config: taskDefinitionConfig,
    })
    const taskDefinitionResponse = await client.registerTaskDefinition(taskDefinitionInput)
    const { taskDefinition } = taskDefinitionResponse
    if (taskDefinition === undefined) {
      this.error(`Could not create task definition: ${taskDefinitionResponse}`)
    }

    // Create/Update Service
    const serviceInput = serviceFromConfiguration({
      family,
      task,
      environment,
      revision: taskDefinition.revision?.toString() || '',
      variables,
      config,
    })
    // console.log(JSON.stringify(serviceInput, undefined, 2))
    const updateServiceResponse = await client.updateService({
      service: serviceInput.serviceName,
      cluster: serviceInput.cluster,
      taskDefinition: serviceInput.taskDefinition,
      desiredCount: serviceInput.desiredCount,
    })
    const { service } = updateServiceResponse
    if (service === undefined) {
      this.error(`Could not create task definition: ${updateServiceResponse}`)
    }

    // Handy JSON output
    this.log(JSON.stringify({
      serviceArn: service.serviceArn,
      taskDefinitionArn: taskDefinition.taskDefinitionArn,
      url: `https://${client.region}.console.aws.amazon.com/ecs/v2/clusters/${family}-${environment}/services/${task}/health?region=${client.region}`,
    }, undefined, 2))
  }
}

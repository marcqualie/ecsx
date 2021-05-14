import { flags } from '@oclif/command'
import { AwsCommand } from '../command'
import { taskDefinitionfromConfiguration } from '../ecs/task-definition'
import { serviceFromConfiguration } from '../ecs/service'

export default class DeployCommand extends AwsCommand {
  static description = 'Create a task definition then deploy it as a service'

  static examples = [
    '$ ecsx deploy [task] -e [environment] -t [dockerTag]',
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
    const { args: { task }, flags: { environment, dockerTag } } = this.parse(DeployCommand)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables({
      environment,
      dockerTag,
    })
    const { project, region } = variables

    // Generate Task Definition
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      task,
      variables,
      config,
    })
    const taskDefinitionResponse = await client.registerTaskDefinition(taskDefinitionInput)
    const { taskDefinition } = taskDefinitionResponse
    if (taskDefinition === undefined) {
      this.error(`Could not create task definition: ${taskDefinitionResponse}`)
    }

    // Check if a service already exists
    // NOTE: Inactive services need to created again, rather than updated
    const serviceInput = serviceFromConfiguration({
      task,
      revision: taskDefinition.revision?.toString() || '',
      variables,
      config,
    })
    const { services: existingServices = [] } = await client.describeServices({
      cluster: serviceInput.cluster,
      services: [
        serviceInput.serviceName || '',
      ],
    })
    const serviceIsActive = existingServices.filter(service => service.status === 'ACTIVE').length > 0

    // Create a new service
    if (serviceIsActive === false) {
      const createServiceResponse = await client.createService(serviceInput)
      const { service } = createServiceResponse
      if (service === undefined) {
        this.error(`Could not create service: ${createServiceResponse}`)
      }

      // Handy JSON output
      this.log(JSON.stringify({
        serviceArn: service.serviceArn,
        taskDefinitionArn: taskDefinition.taskDefinitionArn,
        url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
      }, undefined, 2))
    // Update existing service
    } else {
      const updateServiceResponse = await client.updateService({
        service: serviceInput.serviceName,
        cluster: serviceInput.cluster,
        taskDefinition: serviceInput.taskDefinition,
      })
      const { service } = updateServiceResponse
      if (service === undefined) {
        this.error(`Could not update service: ${updateServiceResponse}`)
      }

      // Handy JSON output
      this.log(JSON.stringify({
        serviceArn: service.serviceArn,
        taskDefinitionArn: taskDefinition.taskDefinitionArn,
        url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
      }, undefined, 2))
    }
  }
}

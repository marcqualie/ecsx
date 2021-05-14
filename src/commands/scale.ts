import { flags } from '@oclif/command'
import { AwsCommand } from '../command'

export default class DeployCommand extends AwsCommand {
  static description = 'Scale services up or down to the desired count'

  static examples = [
    '$ ecsx scale [task] [count] -e [environment]',
  ]

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    environment: flags.string({
      char: 'e',
      required: true,
    }),
  }

  static args = [
    {
      name: 'task',
      type: 'string',
    },
    {
      name: 'count',
      type: 'integer',
    },
  ]

  async run() {
    const { args: { task, count }, flags: { environment } } = this.parse(DeployCommand)
    const client = this.ecs_client()
    const { variables: { project, region } } = this.configWithVariables({
      environment,
    })

    // Find running service matching task name
    const cluster = `${project}-${environment}`
    const { services: existingServices = [] } = await client.describeServices({
      cluster,
      services: [
        task,
      ],
    })
    const activeServices = existingServices.filter(service => service.status === 'ACTIVE')
    const service = activeServices[0]
    if (service === undefined) {
      this.error(`Could not find service mcatching name ${task}`)
    }

    // Set desired count to the running service
    const updateServiceResponse = await client.updateService({
      service: service.serviceName,
      cluster: service.clusterArn,
      desiredCount: parseInt(count, 10),
    })
    const { service: updatedService } = updateServiceResponse
    if (updatedService === undefined) {
      this.error(`Could not update service: ${updateServiceResponse}`)
    }

    this.log(JSON.stringify({
      serviceArn: updatedService.serviceArn,
      taskDefinitionArn: updatedService?.taskDefinition,
      desiredCount: updatedService.desiredCount,
      url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
    }, undefined, 2))
  }
}

import { Flags } from '@oclif/core'
import { AwsCommand } from '../command'

export default class DeployCommand extends AwsCommand {
  static description = 'Scale services up or down to the desired count'

  static flags = {
    help: Flags.help({
      char: 'h',
    }),
    clusterKey: Flags.string({
      char: 'c',
      required: true,
    }),
  }

  static args = [
    {
      name: 'task',
      type: 'string',
      required: true,
    },
    {
      name: 'count',
      type: 'integer',
      required: true,
    },
  ]

  async run() {
    const { args: { task, count }, flags: { clusterKey } } = await this.parse(DeployCommand)
    const { variables } = await this.configWithVariables({
      clusterKey,
    })
    const { environment, project, region } = variables
    const client = this.ecsClient({ region })

    // Find running service matching task name
    const cluster = `${project}-${environment}`
    const { services: existingServices = [] } = await client.describeServices({
      cluster,
      services: [
        task,
      ],
    })
    const activeService = existingServices.find(service => service.status === 'ACTIVE')
    const service = activeService
    if (service === undefined) {
      this.error(`Could not find service matching name ${task}`)
    }

    // Set desired count to the running service
    const updateServiceResponse = await client.updateService({
      service: service.serviceName,
      cluster: service.clusterArn,
      desiredCount: Number.parseInt(count, 10),
    })
    const { service: updatedService } = updateServiceResponse
    if (updatedService === undefined) {
      this.error(`Could not update service: ${JSON.stringify(updateServiceResponse)}`)
    }

    this.log(JSON.stringify({
      serviceArn: updatedService.serviceArn,
      taskDefinitionArn: updatedService?.taskDefinition,
      desiredCount: updatedService.desiredCount,
      url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
    }, undefined, 2))
  }
}

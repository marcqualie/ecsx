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
      name: 'taskName',
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
    const { args: { taskName, count }, flags: { clusterKey } } = await this.parse(DeployCommand)
    const { variables } = await this.configWithVariables({
      clusterKey,
      taskName,
    })
    const { clusterName, environment, project, region } = variables
    if (clusterName === undefined) {
      throw new Error('Could not detect $clusterName')
    }

    const client = this.ecsClient({ region })

    // Find running service matching task name
    const { services: existingServices = [] } = await client.describeServices({
      cluster: clusterName,
      services: [
        taskName,
      ],
    })
    const activeService = existingServices.find(service => service.status === 'ACTIVE')
    const service = activeService
    if (service === undefined) {
      this.error(`Could not find service matching name ${taskName}`)
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
      url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${taskName}/health?region=${region}`,
    }, undefined, 2))
  }
}

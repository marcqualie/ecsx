import { flags } from '@oclif/command'
import { config } from 'process'
import { AwsCommand } from '../command'

export default class PsCommand extends AwsCommand {
  static description = 'Show running services within a cluster'

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
  }

  async run() {
    const { flags: { clusterName } } = this.parse(PsCommand)
    const client = this.ecs_client()
    const { config, variables: { environment, project } } = this.configWithVariables({
      clusterName,
    })

    // Find running service matching task name
    const cluster = `${project}-${environment}`
    const { services: existingServices = [] } = await client.describeServices({
      cluster,
      services: Object.keys(config.tasks).filter(task => !task.startsWith('$')),
    })
    for (const service of existingServices) {
      const containerPort = service.loadBalancers && service.loadBalancers[0] ? `https:${service.loadBalancers[0].containerPort}` : ''
      this.log(`[${service.runningCount}/${service.desiredCount}] ${service.status} ${service.serviceName}  ${containerPort}`)
    }
  }
}

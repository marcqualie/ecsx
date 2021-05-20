import { flags } from '@oclif/command'
import { AwsCommand } from '../command'
import { serviceFromConfiguration } from '../ecs/service'

export default class CreateServiceCommand extends AwsCommand {
  static description = 'Create a new service from a task definition'

  static examples = [
    '$ ecsx create-service [task] -e [environment] -r [revision]',
  ]

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    var: flags.string({
      multiple: true,
      default: [],
    }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
    revision: flags.string({
      char: 'r',
      default: 'LATEST',
    }),
  }

  static args = [
    {
      name: 'task',
      type: 'string',
    },
  ]

  async run() {
    const { args: { task }, flags: { clusterName, revision } } = this.parse(CreateServiceCommand)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables({ clusterName })
    const { environment, project, region } = variables

    // // Generate task definition input and send request to AWS API
    const serviceInput = serviceFromConfiguration({
      task,
      revision,
      variables,
      config,
    })
    // console.log(JSON.stringify(serviceInput, undefined, 2))
    const response = await client.createService(serviceInput)
    const { service } = response
    if (service === undefined) {
      this.error(`Could not create task definition: ${response}`)
    }

    // Handy JSON output
    this.log(JSON.stringify({
      arn: service.serviceArn,
      url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
    }, undefined, 2))
  }
}

import { client } from './client'
import { Configuration, ConfiguredVariables, KeyValuePairs, Variables } from '../types/configuration'
import { taskDefinitionfromConfiguration } from './task-definition'
import { serviceFromConfiguration } from './service'

interface StartServiceInput {
  clusterName: string
  taskName: string
  variables: ConfiguredVariables
  config: Configuration
  envVars: KeyValuePairs
  commandOverride?: string[]
  enableExecuteCommand?: boolean
}

interface StartServiceResponse {
  serviceArn?: string
  taskDefinitionArn?: string
  url: string // Link to AWS console
}

// Starts a new service, or updates a running one with the pass in config
export const deployService = async (params: StartServiceInput): Promise<StartServiceResponse> => {
  const {
    clusterName,
    taskName,
    variables,
    config,
    envVars,
    commandOverride,
    enableExecuteCommand = false,
  } = params
  const {
    environment,
    project,
    region,
  } = variables

  // Generate Task Definition
  const taskDefinitionInput = taskDefinitionfromConfiguration({
    clusterName,
    taskName,
    variables,
    config,
    envVars,
    commandOverride,
  })
  const taskDefinitionResponse = await client.registerTaskDefinition(taskDefinitionInput)
  const { taskDefinition } = taskDefinitionResponse
  if (taskDefinition === undefined) {
    throw new Error(`Could not create task definition: ${taskDefinitionResponse}`)
  }

  // Check if a service already exists
  // NOTE: Inactive services need to created again, rather than updated
  const serviceInput = serviceFromConfiguration({
    clusterName,
    taskName,
    revision: taskDefinition.revision?.toString() || '',
    variables,
    config,
    enableExecuteCommand,
  })
  const { services: existingServices = [] } = await client.describeServices({
    cluster: clusterName,
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
      throw new Error(`Could not create service: ${createServiceResponse}`)
    }

    // Handy JSON output
    return {
      serviceArn: service.serviceArn,
      taskDefinitionArn: taskDefinition.taskDefinitionArn,
      url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${taskName}/health?region=${region}`,
    }
    // Update existing service
  }
  const updateServiceResponse = await client.updateService({
    service: serviceInput.serviceName,
    cluster: serviceInput.cluster,
    taskDefinition: serviceInput.taskDefinition,
    networkConfiguration: serviceInput.networkConfiguration,
  })
  const { service } = updateServiceResponse
  if (service === undefined) {
    throw new Error(`Could not update service: ${updateServiceResponse}`)
  }

  // Handy JSON output
  return {
    serviceArn: service.serviceArn,
    taskDefinitionArn: taskDefinition.taskDefinitionArn,
    url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${taskName}/health?region=${region}`,
  }
}

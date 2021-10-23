import { client } from './client'
import { Configuration, ConfiguredVariables, KeyValuePairs } from '../types/configuration'
import { taskDefinitionfromConfiguration } from './task-definition'
import { serviceFromConfiguration } from './service'

interface StartServiceInput {
  clusterName: string
  taskName: string
  variables: ConfiguredVariables
  config: Configuration
  envVars: KeyValuePairs
}

interface StartServiceResponse {
  desiredCount: number
  status: string
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
  } = params
  const {
    environment,
    project,
    region,
  } = variables

  // Prevent non-services from being deployed
  const taskConfig = config.tasks[taskName]
  if (taskConfig.service === false) {
    throw new Error('Only services can be deployed')
  }

  // Generate Task Definition
  const taskDefinitionInput = taskDefinitionfromConfiguration({
    clusterName,
    taskName,
    variables,
    config,
    envVars,
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
  })
  const { services: existingServices = [] } = await client.describeServices({
    cluster: clusterName,
    services: [
      serviceInput.serviceName || '',
    ],
  })
  const serviceIsActive = existingServices.some(service => service.status === 'ACTIVE')

  // Create a new service
  if (serviceIsActive === false) {
    const createServiceResponse = await client.createService(serviceInput)
    const { service } = createServiceResponse
    if (service === undefined) {
      throw new Error(`Could not create service: ${createServiceResponse}`)
    }

    // Handy JSON output
    return {
      desiredCount: service.desiredCount || 0,
      serviceArn: service.serviceArn,
      status: service.status || 'unknown',
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
    desiredCount: service.desiredCount || 0,
    serviceArn: service.serviceArn,
    status: service.status || 'unknown',
    taskDefinitionArn: taskDefinition.taskDefinitionArn,
    url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${taskName}/health?region=${region}`,
  }
}

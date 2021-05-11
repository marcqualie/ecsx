import { ECSClient, ListTaskDefinitionsCommand } from "@aws-sdk/client-ecs"

export const ecsClient = new ECSClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  maxAttempts: 5,
})

export const listTaskDefinitions = (params: any = {}) => {
  const command = new ListTaskDefinitionsCommand(params)
  return ecsClient.send(command)
}

export const client = {
  listTaskDefinitions,
}

export interface ConfigurationTaskDefinition {
  image: string
  command: string[]
  environment: { [key: string]: string }
  cpu: 256 | 512 | 1024
  memory: 512 | 1024 | 2048
  secrets: Array<{
    arn: string
    keys: string[]
  }>
  ports?: number[]
  taskRoleArn?: string
  executionRoleArn: string
}

export interface ConfigurationService {
  taskDefinition: string
  replicas: number
}

export interface ConfigurationTask {
  taskDefinition: string
  replicas: number
}

export interface Variables {
  [key: string]: string | undefined
}

export interface Configuration {
  version: string
  region: string
  accountId: string
  project: string
  variables: Variables
  clusters: {
    [environment: string]: {
      targetGroups: Array<{
        arn: string
        task: string
        port: number
      }>
      securityGroups: string[]
      publicSubnets: string[]
      privateSubnets: string[]
    }
  }
  tasks: {
    [name: string]: ConfigurationTaskDefinition
  }
}
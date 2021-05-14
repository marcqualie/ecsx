export interface ConfigurationTaskDefinition {
  image: string
  command: string[]
  environment: { [key: string]: string }
  cpu: 256 | 512 | 1024
  memory: 512 | 1024 | 2048
  secrets: Array<{
    name: string
    keys: string[]
  }>
  ports?: number[]
  taskRoleArn?: string
  executionRoleArn: string
}

export interface ConfigurationService {
  taskDefinition: string
}

export interface ConfigurationTask {
  taskDefinition: string
}

export interface Variables {
  [key: string]: string | undefined
}

export interface ConfiguredVariables extends Variables {
  project: string
  environment: string
  accountId: string
  region: string
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
      secrets: {
        [name: string]: string
      }
    }
  }
  tasks: {
    [name: string]: ConfigurationTaskDefinition
  }
}

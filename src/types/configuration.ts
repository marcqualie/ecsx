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
  [key: string]: string
}

export interface Configuration {
  version: string
  variables: Variables
  taskDefinitions: {
    [name: string]: ConfigurationTaskDefinition
  }
  services: {
    [name: string]: ConfigurationService
  }
  tasks?: {
    [name: string]: ConfigurationTask
  }
}

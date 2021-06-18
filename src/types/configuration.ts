export interface ConfigurationTaskDefinition {
  image: string
  command?: string[]
  environment?: KeyValuePairs // @deprecated: Please use envVars instead
  envVars?: KeyValuePairs
  cpu: 256 | 512 | 1024 | 2048 | 4096
  memory: 512 | 1024 | 2048 | 3072 | 4096 | 5120 | 6144 | 7168 | 8192 | 12288 | 16384
  secrets?: Array<{
    name: string
    keys: string[]
  }>
  ports?: number[]
  taskRoleArn?: string
  executionRoleArn: string
  subnets?: string[]
}

export interface ConfigurationClusterDefinition {
  environment: string
  project?: string
  envVars?: KeyValuePairs
  consoleTask?: string
  targetGroups: Array<{
    arn: string
    task: string
    port: number
  }>
  securityGroups: string[]
  subnets: string[]
  secrets?: {
    [name: string]: string
  }
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

export interface ClusterVariables {
  clusterName: string
  taskName?: string
  [key: string]: string | undefined
}

export interface KeyValuePairs {
  [key: string]: string
}

// This is the known output after config parsing
// We know some values will be set, because we do this in code with defaults
export interface ConfiguredVariables extends Variables {
  clusterName: string // should be passed in via CLI flags
  environment: string // defined via cluster config
  project: string
  accountId: string
  region: string
}

export interface Configuration {
  version?: string // @deprecated: We have no use for this
  region: string
  accountId: string
  project: string
  variables: Variables
  clusters: {
    [clusterName: string]: ConfigurationClusterDefinition
  }
  tasks: {
    [name: string]: ConfigurationTaskDefinition
  }
}

export interface ConfigurationTaskDefinition {
  image: string
  command?: string[]
  dependsOn?: Array<{
    containerName: string
    condition: string
  }>
  envVars?: KeyValuePairs
  cpu: 256 | 512 | 1024 | 2048 | 4096
  memory: 512 | 1024 | 2048 | 3072 | 4096 | 5120 | 6144 | 7168 | 8192 | 12_288 | 16_384
  secrets?: Array<{
    name: string
    keys: string[]
  }>
  ports?: number[]
  siblingContainers?: string[]
  taskRoleArn?: string
  executionRoleArn: string
  subnet: 'public' | 'private'
  service?: boolean
}

export interface ConfigurationClusterDefinition {
  environment: string
  project?: string
  name?: string
  region: string
  envVars?: KeyValuePairs
  targetGroups: Array<{
    arn: string
    task: string
    port: number
  }>
  securityGroups: string[]
  subnets: {
    public: string[]
    private: string[]
  }
  secrets?: {
    [name: string]: string | { arn: string, keys: string[] }
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
  clusterName?: string
  taskName?: string
  [key: string]: string | undefined
}

export interface KeyValuePairs {
  [key: string]: string
}

// This is the known output after config parsing
// We know some values will be set, because we do this in code with defaults
export interface ConfiguredVariables extends Variables {
  clusterName?: string // should be passed in via CLI flags
  environment?: string // defined via cluster config
  project?: string
  accountId?: string
  region: string
}

export interface Configuration {
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

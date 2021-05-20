import { Config } from '../config'
import { ClusterVariables } from '../types/configuration'

export const configWithVariables = (variables: ClusterVariables) => {
  const configParser = new Config()
  return configParser.parse(variables)
}

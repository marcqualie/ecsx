import fs from 'fs'
import yaml from 'js-yaml'
import {Configuration, Variables} from './types/configuration'

export class Config {
  path: string

  constructor(path = './ecsy.yml') {
    this.path = path
  }

  read({variables = {}}: { variables: Variables}): Configuration {
    let content = fs.readFileSync(this.path, 'utf-8')

    // TODO: Throw error if a required variable is missing
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{ ${key} }}`, 'g'), value)
    }

    const data = yaml.load(content)
    return data as any
  }
}

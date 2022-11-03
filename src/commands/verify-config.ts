import fs from 'node:fs'
import path from 'node:path'
import { Flags } from '@oclif/core'
import { Validator } from 'jsonschema'
import YAML from 'js-yaml'

import { AwsCommand } from '../command'

import schema from '../schema.json'

export default class VerifyConfigCommand extends AwsCommand {
  static description = 'Scale services up or down to the desired count'

  static flags = {
    help: Flags.help({
      char: 'h',
    }),
  }

  static args = [
    {
      name: 'configPath',
      type: 'string',
      required: false,
    },
  ]

  async run() {
    const { args: { configPath: configPathArg } } = await this.parse(VerifyConfigCommand)

    // Determine schema file path
    const configPath = configPathArg || './ecsx.yml'
    const configPathAbsolute = path.resolve(configPath)
    if (!fs.existsSync(configPathAbsolute)) {
      throw new Error(`Config file ${configPath} does not exist`)
    }

    // Load schema
    const config = YAML.load(fs.readFileSync(configPathAbsolute, 'utf8'))
    const validator = new Validator()
    const valid = validator.validate(config, schema)

    // Print success message or errors
    if (valid.errors.length === 0) {
      this.log('✓ Configuration is valid')
    } else {
      for (const error of valid.errors) {
        this.error(error.stack, {
          exit: false,
        })
      }

      this.exit(1)
    }
  }
}

#!/usr/bin/env node
import addresses from '@dxdao/aqua-sc/dist/addresses.json'
import { writeFile, readFile } from 'fs/promises'
const { hideBin } = require('yargs/helpers')
import { getLogger } from 'log4js'
import { render } from 'mustache'
import yargs from 'yargs'

const SUBGRAPH_TEMPLATE_FILE = './subgraph.template.yaml'
const SUBGRAPH_FILE = './subgraph.yaml'

const networks = {
  rinkeby: 4,
  xdai: 100
}

/**
 * Given a network, prepares the deployment configuration file `subgraph.yaml`
 * @param network
 */
export async function prepare(network: string) {
  // @ts-ignore
  const { aquaFactory, participantListLauncher, saleLauncher, templateLauncher } = addresses[networks[network]]
  const logger = getLogger('aqua-subgraph-prepare')
  // Get the template
  logger.info('Building subgraph manifest...')
  const subgraphYamlTemplate = await readFile(SUBGRAPH_TEMPLATE_FILE, {
    encoding: 'utf8'
  })
  const subgraphYamlOut = render(subgraphYamlTemplate, {
    startBlock: 16965430,
    network,
    contracts: {
      aquaFactory: {
        address: aquaFactory
      },
      participantListLauncher: {
        address: participantListLauncher
      },
      saleLauncher: {
        address: saleLauncher
      },
      templateLauncher: {
        address: templateLauncher
      }
    }
  })
  // Write the file
  await writeFile(SUBGRAPH_FILE, subgraphYamlOut)
  console.log(`Prepared subgraph.yaml for ${network}`)
}

if (require.main === module) {
  const cli = yargs(hideBin(process.argv)).option('network', {
    choices: ['rinkeby', 'local', 'xdai'],
    default: 'xdai'
  })

  prepare(cli.argv.network).catch(error => {
    console.error(error)
    process.exit(1)
  })
}

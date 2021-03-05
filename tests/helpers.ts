import { exec as execBase } from 'child_process'
import { writeFile, readFile } from 'fs/promises'
import { render } from 'mustache'

/**
 * Wraps `child_process.exec` in a promise
 * @param command
 */
export function execAsync(command: string) {
  return new Promise<string>((resolve, reject) => {
    return execBase(command, (err, stdut) => {
      if (err) {
        return reject(err)
      }

      return resolve(stdut)
    })
  })
}

interface BuildSubgraphYmlProps {
  address: string
  network: string | 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'local'
  startBlock: number
}

export async function buildSubgraphYaml({ address, network, startBlock }: BuildSubgraphYmlProps) {
  // Get the template
  const subgraphYamlTemplate = await readFile('./subgraph.template.yaml', {
    encoding: 'utf8'
  })

  const subgraphYamlOut = render(subgraphYamlTemplate, { address, network, startBlock })

  // Write the file
  await writeFile('./subgraph.yaml', subgraphYamlOut)

  return
}

export const wait = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// The Graph GraphQL endpoint
export const GRAPHQL_ENDPOINT = 'http://localhost:8000/subgraphs/name/adamazad/mesa'

// Ganache EVM endpoint
export const EVM_ENDPOINT = 'http://localhost:8545'

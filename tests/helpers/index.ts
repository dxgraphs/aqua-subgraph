import { BigNumber, Contract, ContractFactory, Signer, Wallet, providers, ethers } from 'ethers'
import { writeFile, readFile } from 'fs/promises'
import { exec as execBase } from 'child_process'
import { render } from 'mustache'

// Contract interfaces and classes
import { ERC20 } from './contracts'
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

interface BuildSubgraphYmlPropsContract {
  address: string
}

interface BuildSubgraphYmlProps {
  network: string | 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'local'
  startBlock: number
  contracts: {
    factory: BuildSubgraphYmlPropsContract
    templateLauncher: BuildSubgraphYmlPropsContract
    auctionLauncher: BuildSubgraphYmlPropsContract
  }
}

export async function buildSubgraphYaml(viewProps: BuildSubgraphYmlProps) {
  // Get the template
  const subgraphYamlTemplate = await readFile('./subgraph.template.yaml', {
    encoding: 'utf8'
  })

  const subgraphYamlOut = render(subgraphYamlTemplate, viewProps)

  // Write the file
  await writeFile('./subgraph.yaml', subgraphYamlOut)

  return
}

export const wait = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// The Graph GraphQL endpoint
export const GRAPHQL_ENDPOINT = 'http://localhost:8000/subgraphs/name/adamazad/mesa'

// Ganache EVM endpoint
export const EVM_ENDPOINT = 'http://localhost:8545'

export type ContractFactories =
  | 'EasyAuction'
  | 'MesaFactory'
  | 'ERC20Mintable'
  | 'AuctionLauncher'
  | 'TemplateLauncher'
  | 'FixedPriceAuction'
  | 'EasyAuctionTemplate'
/**
 * Creates and returns a `ContractFactory` from ethers
 * @param contract the contract name. See `ContractFactories`
 * @param signer the signer that deploys the contract
 */
export function getContractFactory(contract: ContractFactories, signer: Signer) {
  const contractArtifact = require(`../../artifacts/${contract}.json`)

  return new ContractFactory(contractArtifact.abi, contractArtifact.bytecode, signer)
}

/**
 *
 * @param easyAuction the easyAuction
 * @param users
 * @param hre
 * @returns
 */
export async function createTokensAndMintAndApprove(
  contractToApprovc: Contract,
  users: providers.JsonRpcSigner[],
  signer: Signer
): Promise<{ auctioningToken: ERC20; biddingToken: ERC20 }> {
  // For each yser, minte 30 AT and BT and approve the easyAuction
  const { auctioningToken, biddingToken } = await createBiddingAndAuctioningTokens(signer)

  for (const user of users) {
    await biddingToken.mint(user._address, BigNumber.from(10).pow(30))
    await biddingToken.connect(user).approve(contractToApprovc.address, BigNumber.from(10).pow(30))

    await auctioningToken.mint(user._address, BigNumber.from(10).pow(30))
    await auctioningToken.connect(user).approve(contractToApprovc.address, BigNumber.from(10).pow(30))
  }

  return {
    auctioningToken,
    biddingToken
  }
}

export async function createBiddingAndAuctioningTokens(signer: Signer) {
  // Get factories and deploy BiddingToken and AuctioningToken
  const biddingToken = (await getContractFactory('ERC20Mintable', signer).deploy('BT', 'BT')) as ERC20
  const auctioningToken = (await getContractFactory('ERC20Mintable', signer).deploy('BT', 'BT')) as ERC20

  return {
    biddingToken,
    auctioningToken
  }
}

export async function createWETH(signer: Signer) {
  // Get factories and deploy BiddingToken and AuctioningToken
  return (await getContractFactory('ERC20Mintable', signer).deploy('WETH', 'WETH')) as ERC20
}

export function encodeInitData(
  tokenOut: string,
  tokenIn: string,
  duration: string,
  tokenOutSupply: string,
  minPrice: string,
  minBuyAmount: string,
  minRaise: string
) {
  return ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'uint256', 'uint256', 'uint96', 'uint96', 'uint256'],
    [tokenOut, tokenIn, duration, tokenOutSupply, minPrice, minBuyAmount, minRaise]
  )
}

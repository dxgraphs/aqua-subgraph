// Externals
import { ContractFactory, providers } from 'ethers'
import Axios from 'axios'

// Test helpers
import { execAsync, buildSubgraphYaml, wait, GRAPHQL_ENDPOINT, EVM_ENDPOINT } from './helpers'

// Contract Artifacts
import EasyAuctionArtfacts from '../artifacts/contracts/EasyAuction.sol/EasyAuction.json'
// Interfaces
import { EasyAuction } from '../src/contracts'

describe('Auction', () => {
  // Connect to local ganache instance
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)
  let easyAuctionContract: EasyAuction
  const theGraph = Axios.create({
    baseURL: GRAPHQL_ENDPOINT,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  beforeEach(async () => {
    // Wait for everything to fire up
    await wait(10000)

    // Before each unit test, a new EasyAuction contract is deployed to ganache
    // then followed by deploying its subgraph to the Graph node

    // Create facotory for EasyAuction and deploy a new version
    const easyAuctionFactory = new ContractFactory(
      EasyAuctionArtfacts.abi,
      EasyAuctionArtfacts.bytecode,
      provider.getSigner()
    )

    easyAuctionContract = (await easyAuctionFactory.deploy()) as EasyAuction

    // Create EasyAuction's contract subgraph
    await buildSubgraphYaml({
      address: easyAuctionContract.address,
      network: 'local',
      startBlock: easyAuctionContract.deployTransaction.blockNumber as number
    })

    // Build, create and deploy the subgraph
    await execAsync('npm run build')
    await execAsync('npm run create-local')
    await execAsync('npm run deploy-local')

    // Wait for subgraph to sync
    await wait(10000)
  })

  afterEach(async () => {
    // Clean up
    await execAsync('npm run remove-local')
  })

  test('should return the an array of auctions', async () => {
    // Create a new auction
    await easyAuctionContract.emitNewAuction(
      10,
      '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      '0x7090363b7dA6d97Ed575F17900AeeE949c2B7Cf9',
      9000,
      9000,
      10000,
      10,
      150,
      9999999999
    )

    // Wait for subgraph to index the event
    await wait(10000)

    const { data, status } = await theGraph.post(GRAPHQL_ENDPOINT, {
      query: `{
          auctions {
            id
            createdAt
            updatedAt
            deletedAt
            status
            startTime
            endTime
            gracePeriod
            tokenAmount
          }
        }
          `
    })

    expect(status).toBe(200)
    expect(data.data.auctions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: expect.any(String),
          startTime: expect.any(Number),
          endTime: expect.any(Number),
          gracePeriod: expect.any(Number),
          tokenAmount: expect.any(Number)
        })
      ])
    )
  })

  test('should return the an array of auction bids', async () => {
    // Create a new auction
    await easyAuctionContract.emitNewAuction(
      10,
      '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      '0x7090363b7dA6d97Ed575F17900AeeE949c2B7Cf9',
      9000,
      9000,
      10000,
      10,
      150,
      9999999999
    )

    // Create a bid
    await easyAuctionContract.emitNewSellOrder(10, 1, 100, 100)

    // Wait for subgraph to index the event
    await wait(10000)

    const { data, status } = await theGraph.post(GRAPHQL_ENDPOINT, {
      query: `{
          auctionBids {
            id
            createdAt
            updatedAt
            deletedAt
            status
          }
        }
          `
    })

    expect(status).toBe(200)
    expect(data.data.auctionBids).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: expect.any(String)
        })
      ])
    )
  })
})

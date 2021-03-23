# Mesa Subgraph

Mesa Subgraph is the main provider for Mesa Interface data.

# Explore

You can explore the subgraph at [The Graph Explorer](https://thegraph.com/explorer/subgraph/adamazad/mesa).

# Architecture

The subgraph listens for events from three fixed contracts:

## `MesaFactory`

### `TemplateLaunched`

Emitted when `MesaFactory.launchTemplate` is called. Returns:

```typescript
interface TemplateLaunchedParams {
  // Address of the new Auction: EasyAuction or FixedPriceAuction
  auction: string
  // The template ID of the auction type: EasyAuction or FixedPriceAuction
  templateId: string
}
```

`templateId` is used to determine GraphQL schema -- either `EasyAuction` or `FixedPriceAuction` -- to create. `auction` address is the address of the newly deploed auction contract.

## `AuctionLauncher`

WIP

## `TemplateLauncher`

WIP

## `EasyAuction` and `FixedPriceAuction`

These contracts are deployed from the factory. Their address is resolved from `Event.address` and compared against `MesaFactory.allAuctions` array. If the address does not belong to Mesa's auction, the handler does an early exit.

# Installation

Install dependencies using `yarn`

```bash
$ yarn
```

# Deployment

## Set up config file

Each network deployment requires setting up a JSON configuration file in `config/<NetworkName>.json`. For instance, for Rinkeby, the file

## Prepare `subgraph.yaml`

`subgraph.yaml` is built from `subgraph.template.yaml` using configuration defined in previous section. To do so, run

```bash
$ npm run prepare:<NetworkName>
```

Current available networks are Mainnet and Rinkeby.

## Deploy to The Graph

Read documentations for [installing The Graph CLI](https://thegraph.com/docs/quick-start#3.-initialize-a-new-subgraph), then run

```bash
$ npm run deploy
```

# Build ABIs

ABIs for main contracts are not included in the repo. Instead, they are extracted from the smart contract repo ([cryptonative-ch/mesa-smartcontracts](https://github.com/cryptonative-ch/mesa-smartcontracts)). To build the ABIs, run:

```bash
$ ./build-abis.sh
```

Note that it requires [`jq`](https://stedolan.github.io/jq/) tool.

Schema is available in [`schema.graphql`](schema.graphql)

# Tests

Tests require [Docker](http://docker.com/) installed. To run tests, run

```bash
$ yarn tests
```

# Scripts

This projects comes with a set of predefined scripts in `package.json`

| Script            | Description                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test`            | Runs Jest tests                                                                                                                                                                                   |
| `docker-up`       | Runs Docker services defined in `docker-compose.yaml`                                                                                                                                             |
| `prepare:mainnet` | Bulds `subgraph.yaml` for the mainnet                                                                                                                                                             |
| `prepare:testnet` | Bulds `subgraph.yaml` for the Rinkeby testnet                                                                                                                                                     |
| `codegen`         | Generates AssemblyScript types for smart contract ABIs and the subgraph schema.                                                                                                                   |
| `build`           | Runs `graph build` to compile a subgraph to WebAssembly.                                                                                                                                          |
| `deploy`          | Deploys the subgraph build to a The Graph Node. Requires a valid access token from the dashbaord. See [`graph auth`](https://github.com/graphprotocol/graph-cli#the-graph-command-line-interface) |
| `typechain-build` | Create typed-contracts classes.                                                                                                                                                                   |

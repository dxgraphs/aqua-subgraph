# Aqua Subgraph

Aqua Subgraph is the main provider for Aqua Interface data.

# Explore

You can explore Aqua's xDai subgraph at [The Graph Explorer](https://thegraph.com/legacy-explorer/subgraph/adamazad/aqua-xdai-next).

## Local

If you wish to deploy a local explorer, run:

```bash
$ npm run explore-local
```

This snippet requires Docker. After deployment, a local version of the graph, with a web front-end, is available at http://localhost:8000/subgraphs/name/adamazad/aqua

# Architecture

## Data Sources

### Fixed Contracts

The subgraph listens for events from three fixed contracts; they are deployed once:

1. `AquaFactory`
2. `SaleLauncher`
3. `TemplateLauncher`
4. `ParticipantListLauncher`

### Dynamic Contracts (Templates)

These contracted deployed from the contracts above

1. `FairSale` from `SaleLauncher`
2. `FairSaleTemplate` from `TemplateLauncher`
3. `FixedPriceSale` from `SaleLauncher`
4. `FixedPriceSaleTemplate` from `TemplateLauncher`
5. `ParticipantList` from `ParticipantListLauncher`

## GraphQL Entities

The following entities are available in the subgraph. Rest is available in [`schema.graphql`](schema.graphql)

### AquaFactory

Stores and tracks information about the `AquaFactory` contract.

### SaleTemplate

Stores all sale templates added to `TemplateLauncher`, including the contract address, ID, and name. A template is essentially a sale mechanism.

### LaunchedSaleTemplate

Every time a new Sale Template is created - cloned - from the list of `SaleTemplate`s, the launched version with additional data is also stored. The launched sale template also stores IPFS metadata hash for sale.

### ParticipantList

Sales can have a white-labeled list of addresses. This entity tracks the contract, the contract managers, and the list of participants.

### FixedPriceSale

Stores all information about the `FixedPriceSale`s. This includes total commitments, withdrawals, sale status, and other sale information.

### FixedPriceSaleUser

Each address participating in a `FixedPriceSale` has a unique ID. The ID is in the following format:

```
<saleAddress>/users/<userAddress>
```

### FixedPriceSaleCommitment

A commitment is a pledge that the investor wishes to buy a certain amount of tokens in a `FixedPriceSale` should the sale reach the threshold. Each commitment has a status - `SUBMITTED`, `RELEASED`, and/or `CLAIMED`. Commitments ID are formatted in

```
<saleAddress>/commitments/<userAddress>/<commitmentIndex>
```

### FixedPriceSaleWithdrawal

Tracks sale withdrawals. This entity is available when a sale has successfully concluded — reached the minimum raise threshold. Unlike `FixedPriceSaleCommitment`, `FixedPriceSaleWithdrawal` is aggregated per withdrawal event.

```
<saleAddress>/withdrawals/<userAddress>
```

### Token

Stores information about ERC20 tokens that have been used as bidding or auctioning tokens in sales. These include symbol, decimals name and address.

# FAQs

**How to get the factory information?**

The `AquaFactory` tracks all information

```graphql
aquaFactory (id: "AquaFactory") {
  id
  saleCount
  address
  feeManager
  feeTo
  templateManager
  templateLauncher
  saleFee
  feeNumerator
  templateFee
}
```

**How to get list of registered sale templates (mechanisms)?**

The `SaleTemplate` stores such information

```graphql
saleTemplates {
  id
  address
  name
  verified
}
```

**How to get the total number of sales?**

The `AquaFactory` tracks the number of sales using `saleCount`

```graphql
aquaFactory (id: "AquaFactory") {
  saleCount
}
```

**How to access the IPFS hash from a sale?**

The IPFS hash is stored on the `LaunchedSaleTemplate` entity. Reference it in your sales query

```graphql
fixedPriceSales {
  launchedSaleTemplate {
    metadataContentHash
  }
}
```

# Deployment

## Set up config file

Each network deployment requires setting up a JSON configuration file in `config/<NetworkName>.json`.

## Prepare `subgraph.yaml`

`subgraph.yaml` is built from `subgraph.template.yaml` using configuration defined in previous section. To do so, run

```bash
$ npm run prepare-<NetworkName>
```

xDAI and Rinkeby networks are supported.

## Deploy to The Graph

Read documentations for [installing The Graph CLI](https://thegraph.com/docs/quick-start#3.-initialize-a-new-subgraph), then run

```bash
$ npm run deploy
```

# Extract ABIs from Artifacts

ABIs for main contracts are not included in the repo. Instead, they are extracted from the smart contract repo ([cryptonative-ch/mesa-smartcontracts](https://github.com/cryptonative-ch/mesa-smartcontracts)). To build the ABIs, run:

```bash
$ ./build-abis.sh
```

Note that it requires [`jq`](https://stedolan.github.io/jq/) tool.

# Tests

Tests require [Docker](http://docker.com/) installed. To run tests, run

```bash
$ yarn tests
```

# Scripts

This projects comes with a set of predefined scripts in `package.json`

| Script             | Description                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| `test`             | Runs Jest tests.                                                                |
| `docker-up`        | Runs Docker services defined in `docker-compose.yaml`.                          |
| `docker-clean`     | reset docker kill & rm. Use if subgraph is not working with `explore-local`.    |
| `prepare-subgraph` | Builds `subgraph.yaml` for either mainnet or rinkeby.                           |
| `prepare-rinkeby`  | Builds `subgraph.yaml` for the Rinkeby testnet (deprecated).                    |
| `prepare-xdai`     | Builds `subgraph.yaml` for the xDai network (deprecated).                       |
| `codegen`          | Generates AssemblyScript types for smart contract ABIs and the subgraph schema. |
| `build`            | Runs `graph build` to compile a subgraph to WebAssembly.                        |
| `deploy-xdai`      | Deploys the subgraph build to The Graph on the xDai network.                    |
| `deploy-rinkeby`   | Deploys the subgraph build to The Graph on the Rinkeby testnet.                 |
| `typechain`        | Creates typed-contracts classes.                                                |
| `build-abis`       | Extracts contract ABIs from artifacts in `artifacts` directory.                 |
| `deploy-local`     | Deploys the graph build to local graph-node.                                    |
| `create-local`     | Creates the graph build in local graph-node.                                    |
| `remove-local`     | Removes the graph build from local graph-node.                                  |
| `explore-local`    | Starts local graph explorer.                                                    |

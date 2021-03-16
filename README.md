# Mesa Subgraph

Mesa Subgraph is the main provider for Mesa Interface data.

# Explore

You can explore the subgraph at [The Graph Explorer](https://thegraph.com/explorer/subgraph/adamazad/mesa).

# Installation

Clone this repo and run

```
$ cd mesa-subgraph
```

Install dependencies using `yarn`

```
$ yarn
```

# Build ABIs

ABIs are not included in the repo. Instead, they are extracted from the smart contract repo ([cryptonative-ch/mesa-smartcontracts](https://github.com/cryptonative-ch/mesa-smartcontracts)). To build the ABIs, run:

```bash
$ ./build-abis.sh`

```

Note that it requires [`jq`](https://stedolan.github.io/jq/) tool.

Schema is available in [`schema.graphql`](schema.graphql)

# Scripts

This projects comes with a set of predefined scripts in `package.json`

| Script            | Description                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codegen`         | Generates AssemblyScript types for smart contract ABIs and the subgraph schema.                                                                                                                   |
| `build`           | Runs `graph build` to compile a subgraph to WebAssembly.                                                                                                                                          |
| `deploy`          | Deploys the subgraph build to a The Graph Node. Requires a valid access token from the dashbaord. See [`graph auth`](https://github.com/graphprotocol/graph-cli#the-graph-command-line-interface) |
| `typechain-build` | Create typed-contracts classes.                                                                                                                                                                   |

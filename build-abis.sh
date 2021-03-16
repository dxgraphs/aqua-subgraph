#!/bin/bash

Cyan='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Git URl
MESA_SMART_CONTRACT_REPO='https://github.com/cryptonative-ch/mesa-smartcontracts'
# Artifacts path
ARTIFACT_PATHS=("MesaFactory.sol/MesaFactory.json" "auctions/AuctionLauncher.sol/AuctionLauncher.json" "auctions/FixedPriceAuction.sol/FixedPriceAuction.json" "auctions/EasyAuction.sol/EasyAuction.json" "templates/TemplateLauncher.sol/TemplateLauncher.json" "templates/EasyAuctionTemplate.sol/EasyAuctionTemplate.json")
ARTIFACT_ABI_PATHS=("MesaFactory.json" "AuctionLauncher.json" "FixedPriceAuction.json" "EasyAuction.json" "TemplateLauncher.json" "EasyAuctionTemplate.json")

# Clean up
rm -rf mesa-smartcontracts

# Start cloning
printf "Cloning ${Cyan}mesa-smartcontracts${NC} from ${Cyan}${MESA_SMART_CONTRACT_REPO}${NC}\r\n\r\n"
git clone --single-branch --branch develop $MESA_SMART_CONTRACT_REPO -q

# Extracting the ABIs
printf "Extracting the ABIs\r\n\r\n"

for i in ${!ARTIFACT_PATHS[@]};
do

  artifactPath="mesa-smartcontracts/artifacts/contracts/${ARTIFACT_PATHS[$i]}"
  artifactAbiPath="abis/${ARTIFACT_ABI_PATHS[$i]}"

  printf "Extracting the ABI from ${Cyan}${artifactPath}${NC} to ${Cyan}${artifactAbiPath} ${NC}\r\n";
  jq '.abi' $artifactPath > $artifactAbiPath;

done


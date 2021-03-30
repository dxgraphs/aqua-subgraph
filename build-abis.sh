#!/bin/bash

Cyan='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Git URl
MESA_SMART_CONTRACT_REPO='https://github.com/cryptonative-ch/mesa-smartcontracts'
# Artifacts path
ARTIFACT_PATHS=("MesaFactory.sol/MesaFactory.json" "auctions/AuctionLauncher.sol/AuctionLauncher.json" "auctions/FixedPriceAuction.sol/FixedPriceAuction.json" "auctions/EasyAuction.sol/EasyAuction.json" "templates/TemplateLauncher.sol/TemplateLauncher.json" "templates/EasyAuctionTemplate.sol/EasyAuctionTemplate.json" "test/ERC20Mintable.sol/ERC20Mintable.json")
ARTIFACT_NAMES=("MesaFactory.json" "AuctionLauncher.json" "FixedPriceAuction.json" "EasyAuction.json" "TemplateLauncher.json" "EasyAuctionTemplate.json" "ERC20Mintable.json")

# Clean up
rm -rf mesa-smartcontracts

# Start cloning
printf "Cloning ${Cyan}mesa-smartcontracts${NC} from ${Cyan}${MESA_SMART_CONTRACT_REPO}${NC}\r\n\r\n"
git clone --single-branch --branch develop $MESA_SMART_CONTRACT_REPO -q

# Create artifacts & abis directory if missing
mkdir -p artifacts
mkdir -p abis

# Extract artifacts
printf "Extracting artifacts and ABIs\r\n\r\n"
for i in ${!ARTIFACT_PATHS[@]};
do

  # source
  artifactName=${ARTIFACT_NAMES[$i]}
  artifactSourcePath="mesa-smartcontracts/artifacts/contracts/${ARTIFACT_PATHS[$i]}"
  artifactOutputPath="artifacts/${ARTIFACT_NAMES[$i]}"
  artifactABIPath="abis/${ARTIFACT_NAMES[$i]}"

  # Copy the artifact
  printf "Copying ${Cyan}${artifactSourcePath}${NC} to ${Cyan}${artifactOutputPath} ${NC}\r\n";
  cp $artifactSourcePath $artifactOutputPath

  # Extract the ABIs from the ABI
  printf "Extracting ${Cyan}${artifactName}${NC} ABIs to ${Cyan}${artifactABIPath} ${NC}\r\n";
  jq '.abi' $artifactSourcePath > $artifactABIPath;

done

# Clean up
rm -rf mesa-smartcontracts

printf "\r\n\r\nDone, happy graphing!"
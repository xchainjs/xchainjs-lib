#!/bin/bash

# This script updates THORChain Protobuf bindings for MsgDeposit and MsgSend
set -e # Exit on any error

MSG_COMPILED_OUTPUTFILE=src/types/proto/MsgCompiled.js
MSG_COMPILED_TYPES_OUTPUTFILE=src/types/proto/MsgCompiled.d.ts

# Using local minimal proto files - no need to clone thornode repository

# Download cosmos/base/v1beta1/coin.proto from cosmossdk
COSMOS_COIN_PROTO="proto/cosmos/base/v1beta1/coin.proto"
if [ ! -f "$COSMOS_COIN_PROTO" ]; then
  tput setaf 2
  echo "Downloading cosmos/base/v1beta1/coin.proto from cosmossdk"
  tput sgr0
  mkdir -p "proto/cosmos/base/v1beta1"
  if ! curl -f -o "$COSMOS_COIN_PROTO" \
    "https://raw.githubusercontent.com/cosmos/cosmos-sdk/main/proto/cosmos/base/v1beta1/coin.proto"; then
    echo "Error: Failed to download cosmos coin.proto"
    exit 1
  fi
  echo "✓ Downloaded cosmos coin.proto"
else
  echo "✓ cosmos coin.proto already exists"
fi

# Verify our minimal proto files exist
tput setaf 2
echo "Checking minimal proto files"
tput sgr0
MISSING_FILES=0
for proto_file in \
  "proto/common/minimal_common.proto" \
  "proto/types/minimal_msg_deposit.proto" \
  "proto/types/minimal_msg_send.proto" \
  "$COSMOS_COIN_PROTO"; do
  if [ ! -f "$proto_file" ]; then
    echo "Error: $(basename "$proto_file") missing"
    MISSING_FILES=1
  else
    echo "✓ $(basename "$proto_file") found"
  fi
done

if [ $MISSING_FILES -eq 1 ]; then
  echo "Error: Required proto files are missing"
  exit 1
fi

# Generate Protobuf JS bindings using minimal proto files to prevent over-inclusion
tput setaf 2
echo "Generating $MSG_COMPILED_OUTPUTFILE"
tput sgr0
if ! yarn pbjs -w commonjs -t static-module \
  -p proto \
  "proto/common/minimal_common.proto" \
  "proto/types/minimal_msg_deposit.proto" \
  "proto/types/minimal_msg_send.proto" \
  "$COSMOS_COIN_PROTO" \
  -o "$MSG_COMPILED_OUTPUTFILE" 2>pbjs_errors.txt; then
  echo "Error: Failed to generate JavaScript bindings"
  cat pbjs_errors.txt
  exit 1
fi

# Fix import to be ESM-compatible (no omitted file extension)
sed -i -E 's|"(protobufjs/minimal)"|"\1.js"|' "$MSG_COMPILED_OUTPUTFILE"

# Generate TypeScript definitions with explicit namespace
tput setaf 2
echo "Generating $MSG_COMPILED_TYPES_OUTPUTFILE"
tput sgr0
if ! yarn pbts --name types "$MSG_COMPILED_OUTPUTFILE" -o "$MSG_COMPILED_TYPES_OUTPUTFILE" 2>pbts_errors.txt; then
  echo "Error: Failed to generate TypeScript definitions"
  cat pbts_errors.txt
  exit 1
fi

# Verify generated files
if [ ! -f "$MSG_COMPILED_OUTPUTFILE" ] || [ ! -s "$MSG_COMPILED_OUTPUTFILE" ]; then
  echo "Error: Generated JavaScript file is missing or empty"
  exit 1
fi

if [ ! -f "$MSG_COMPILED_TYPES_OUTPUTFILE" ] || [ ! -s "$MSG_COMPILED_TYPES_OUTPUTFILE" ]; then
  echo "Error: Generated TypeScript definitions file is missing or empty"
  exit 1
fi

# Clean up error files if they're empty
[ ! -s pbjs_errors.txt ] && rm -f pbjs_errors.txt
[ ! -s pbts_errors.txt ] && rm -f pbts_errors.txt

tput setaf 2
echo "✓ Successfully generated protobuf bindings"
tput sgr0

#!/bin/bash

# This script updates THORChain Protobuf bindings for MsgDeposit and MsgSend
set -euo pipefail # Exit on error, undefined variables, and pipe failures

# Check for required tools
for tool in yarn git curl sed; do
  if ! command -v "$tool" &>/dev/null; then
    echo "Error: Required tool '$tool' is not installed"
    exit 1
  fi
done

MSG_COMPILED_OUTPUTFILE=src/types/proto/MsgCompiled.js
MSG_COMPILED_TYPES_OUTPUTFILE=src/types/proto/MsgCompiled.d.ts

# Ensure output directory exists
mkdir -p "$(dirname "$MSG_COMPILED_OUTPUTFILE")"

TMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
  if [ -d "$TMP_DIR" ]; then
    tput setaf 2
    echo "Cleaning up $TMP_DIR"
    tput sgr0
    rm -rf "$TMP_DIR"
  fi
}
trap cleanup EXIT

tput setaf 2
echo "Checking out https://gitlab.com/thorchain/thornode to $TMP_DIR"
tput sgr0
if ! (cd "$TMP_DIR" && git clone --depth 1 --single-branch --branch develop https://gitlab.com/thorchain/thornode); then
  echo "Error: Failed to clone thornode repository"
  exit 1
fi

# Verify proto files exist
tput setaf 2
echo "Checking proto files"
tput sgr0
MISSING_FILES=0
for proto_file in \
  "$TMP_DIR/thornode/proto/thorchain/v1/common/common.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_deposit.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_send.proto"; do
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

# Download cosmos/base/v1beta1/coin.proto from cosmossdk if not exists
COSMOS_COIN_PROTO="$TMP_DIR/thornode/third_party/proto/cosmos/base/v1beta1/coin.proto"
if [ ! -f "$COSMOS_COIN_PROTO" ]; then
  tput setaf 2
  echo "Downloading cosmos/base/v1beta1/coin.proto from cosmossdk"
  tput sgr0
  mkdir -p "$TMP_DIR/thornode/third_party/proto/cosmos/base/v1beta1"
  if ! curl -fSL --retry 3 --retry-delay 2 -o "$COSMOS_COIN_PROTO" \
    "https://raw.githubusercontent.com/cosmos/cosmos-sdk/main/proto/cosmos/base/v1beta1/coin.proto"; then
    echo "Error: Failed to download cosmos coin.proto"
    exit 1
  fi
  echo "✓ Downloaded cosmos coin.proto"
else
  echo "✓ cosmos coin.proto already exists"
fi

# Generate Protobuf JS bindings using sparse mode to only include referenced types
tput setaf 2
echo "Generating $MSG_COMPILED_OUTPUTFILE (using sparse mode to avoid bloat)"
tput sgr0
if ! yarn pbjs -w commonjs -t static-module --sparse \
  -p "$TMP_DIR/thornode/proto" \
  -p "$TMP_DIR/thornode/third_party/proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/common/common.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_deposit.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_send.proto" \
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

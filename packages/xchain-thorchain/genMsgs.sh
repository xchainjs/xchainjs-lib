#!/bin/bash

# This script updates THORChain Protobuf bindings for MsgDeposit and MsgSend

MSG_COMPILED_OUTPUTFILE=src/types/proto/MsgCompiled.js
MSG_COMPILED_TYPES_OUTPUTFILE=src/types/proto/MsgCompiled.d.ts

TMP_DIR=$(mktemp -d)

tput setaf 2
echo "Checking out https://gitlab.com/thorchain/thornode to $TMP_DIR"
tput sgr0
(cd "$TMP_DIR" && git clone --branch develop https://gitlab.com/thorchain/thornode)

# Verify proto files exist
tput setaf 2
echo "Checking proto files"
tput sgr0
ls "$TMP_DIR/thornode/proto/thorchain/v1/common/common.proto" || echo "common.proto missing"
ls "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_deposit.proto" || echo "msg_deposit.proto missing"
ls "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_send.proto" || echo "msg_send.proto missing"

# Download cosmos/base/v1beta1/coin.proto from cosmossdk
tput setaf 2
echo "Downloading cosmos/base/v1beta1/coin.proto from cosmossdk"
tput sgr0
mkdir -p "$TMP_DIR/thornode/third_party/proto/cosmos/base/v1beta1"
curl -o "$TMP_DIR/thornode/third_party/proto/cosmos/base/v1beta1/coin.proto" \
  "https://raw.githubusercontent.com/cosmos/cosmos-sdk/main/proto/cosmos/base/v1beta1/coin.proto"

# Generate Protobuf JS bindings with include path
tput setaf 2
echo "Generating $MSG_COMPILED_OUTPUTFILE"
tput sgr0
yarn pbjs -w commonjs -t static-module \
  -p "$TMP_DIR/thornode/proto" \
  -p "$TMP_DIR/thornode/third_party/proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/common/common.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_deposit.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/types/msg_send.proto" \
  "$TMP_DIR/thornode/third_party/proto/cosmos/base/v1beta1/coin.proto" \
  -o "$MSG_COMPILED_OUTPUTFILE" 2>pbjs_errors.txt

# Generate TypeScript definitions with explicit namespace
tput setaf 2
echo "Generating $MSG_COMPILED_TYPES_OUTPUTFILE"
tput sgr0
yarn pbts --name types "$MSG_COMPILED_OUTPUTFILE" -o "$MSG_COMPILED_TYPES_OUTPUTFILE" 2>pbts_errors.txt

tput setaf 2
echo "Removing $TMP_DIR/thornode"
tput sgr0
rm -rf "$TMP_DIR"

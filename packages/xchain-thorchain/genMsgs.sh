#!/bin/bash

# This script updates THORChain Protobuf bindings for MsgDeposit and MsgSend in @xchainjs/xchain-thorchain

MSG_COMPILED_OUTPUTFILE=src/types/proto/MsgCompiled.js
MSG_COMPILED_TYPES_OUTPUTFILE=src/types/proto/MsgCompiled.d.ts

TMP_DIR=$(mktemp -d)

tput setaf 2; echo "Checking out https://gitlab.com/thorchain/thornode to $TMP_DIR"; tput sgr0
(cd "$TMP_DIR" && git clone --branch develop https://gitlab.com/thorchain/thornode)

# Generate Protobuf JS bindings with include path
tput setaf 2; echo "Generating $MSG_COMPILED_OUTPUTFILE"; tput sgr0
yarn pbjs -w commonjs -t static-module \
  -p "$TMP_DIR/thornode/proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/common/common.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto" \
  "$TMP_DIR/thornode/proto/thorchain/v1/x/thorchain/types/msg_send.proto" \
  -o "$MSG_COMPILED_OUTPUTFILE" 2> pbjs_errors.txt

# Generate TypeScript definitions
tput setaf 2; echo "Generating $MSG_COMPILED_TYPES_OUTPUTFILE"; tput sgr0
yarn pbts "$MSG_COMPILED_OUTPUTFILE" -o "$MSG_COMPILED_TYPES_OUTPUTFILE"

tput setaf 2; echo "Removing $TMP_DIR/thornode"; tput sgr0
rm -rf "$TMP_DIR"

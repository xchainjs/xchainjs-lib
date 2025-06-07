#!/bin/bash

# this script checks out mayanode master and generates the proto3 typescript buindings for MsgDeposit and MsgSend

MSG_COMPILED_OUTPUTFILE=src/types/proto/MsgCompiled.js
MSG_COMPILED_TYPES_OUTPUTFILE=src/types/proto/MsgCompiled.d.ts

TMP_DIR=$(mktemp -d)

tput setaf 2
echo "Checking out https://gitlab.com/mayachain/mayanode  to $TMP_DIR"
tput sgr0
(cd $TMP_DIR && git clone https://gitlab.com/mayachain/mayanode)

# Generate msgs
tput setaf 2
echo "Generating $MSG_COMPILED_OUTPUTFILE"
tput sgr0
yarn run pbjs -w commonjs -t static-module $TMP_DIR/mayanode/proto/mayachain/v1/common/common.proto $TMP_DIR/mayanode/proto/mayachain/v1/x/mayachain/types/msg_deposit.proto $TMP_DIR/mayanode/proto/mayachain/v1/x/mayachain/types/msg_send.proto $TMP_DIR/mayanode/third_party/proto/cosmos/base/v1beta1/coin.proto -o $MSG_COMPILED_OUTPUTFILE

tput setaf 2
echo "Generating $MSG_COMPILED_TYPES_OUTPUTFILE"
tput sgr0
yarn run pbts $MSG_COMPILED_OUTPUTFILE -o $MSG_COMPILED_TYPES_OUTPUTFILE

tput setaf 2
echo "Removing $TMP_DIR/mayanode"
tput sgr0
rm -rf $TMP_DIR

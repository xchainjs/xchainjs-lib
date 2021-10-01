#!/bin/bash

# this script checks out thornode master and generates the proto3 typescript buindings for MsgDeposit

MSG_DEPOSIT_OUTPUTFILE=src/types/proto/MsgDeposit.js
MSG_DEPOSIT_TYPES_OUTPUTFILE=src/types/proto/MsgDeposit.d.ts

TMP_DIR=$(mktemp -d)


tput setaf 2; echo "Checking out https://gitlab.com/thorchain/thornode  to $TMP_DIR";tput sgr0
(cd $TMP_DIR && git clone https://gitlab.com/thorchain/thornode)

tput setaf 2; echo "Generating $MSG_DEPOSIT_OUTPUTFILE";tput sgr0
yarn run pbjs -w commonjs  -t static-module $TMP_DIR/thornode/proto/thorchain/v1/common/common.proto $TMP_DIR/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto -o $MSG_DEPOSIT_OUTPUTFILE

tput setaf 2; echo "Generating $MSG_DEPOSIT_TYPES_OUTPUTFILE";tput sgr0
yarn run pbts  $MSG_DEPOSIT_OUTPUTFILE -o $MSG_DEPOSIT_TYPES_OUTPUTFILE

tput setaf 2; echo "Removing $TMP_DIR/thornode";tput sgr0
rm -rf $TMP_DIR

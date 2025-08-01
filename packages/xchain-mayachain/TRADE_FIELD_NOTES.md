# Trade Field in MayaChain Protobuf

## Current Status

✅ **RESOLVED**: The MayaChain protobuf definitions have been updated upstream to include the `trade` field. The `genMsgs.sh` script was run and successfully generated the updated TypeScript definitions with the trade field support.

The `parseAssetToMayanodeAsset` function has been updated to include the `trade` field to match THORChain's implementation.

## How MsgCompiled Files Are Generated

1. **Script Location**: `genMsgs.sh` in the package root
2. **Command**: `yarn generate:MayachainMsgs`
3. **Process**:
   - Clones the MayaNode repository from GitLab
   - Uses `pbjs` to generate JavaScript bindings from `.proto` files
   - Uses `pbts` to generate TypeScript definitions
   - Source files: `common.proto`, `msg_deposit.proto`, `msg_send.proto`

## Current Issue

Maya's protobuf Asset definition (in `common.proto`) only includes:
- chain
- symbol
- ticker
- synth

THORChain's Asset definition includes:
- chain
- symbol
- ticker
- synth
- **trade** (missing in Maya)
- **secured** (missing in Maya)

## What Was Done

Updated `parseAssetToMayanodeAsset` in `src/utils.ts` to include the `trade` field:

```typescript
export const parseAssetToMayanodeAsset = (
  asset: CompatibleAsset,
): {
  chain: string
  symbol: string
  ticker: string
  synth: boolean
  trade: boolean  // Added this field
} => {
  return {
    chain: asset.chain,
    symbol: asset.symbol,
    ticker: asset.ticker,
    synth: asset.type === AssetType.SYNTH,
    trade: asset.type === AssetType.TRADE,  // Added this mapping
  }
}
```

## What Was Completed

1. **Protobuf Generation**: Ran `./genMsgs.sh` which successfully pulled the latest protobuf definitions from MayaNode
2. **Trade Field Added**: The generated files now include the `trade` boolean field in the Asset interface
3. **TypeScript Implementation**: Updated `parseAssetToMayanodeAsset` to properly map the trade asset type
4. **Tests Added**: Created unit tests to verify trade asset parsing works correctly

## Trade Asset Support

Trade assets are now fully supported in the MayaChain package:
- The protobuf layer includes the `trade` field
- The `parseAssetToMayanodeAsset` function correctly maps `AssetType.TRADE` to the trade boolean
- Trade asset deposits should work correctly with the updated implementation
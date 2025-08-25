# Trade Account Operations Guide

## Important: Wallet Initialization for Trade Operations

When performing trade operations that require broadcasting transactions (addToTradeAccount, withdrawFromTradeAccount), you MUST initialize the wallet with a mnemonic phrase. Without a phrase, the client cannot sign transactions and will throw the error: "No clients available. Can not sign and broadcast deposit transaction".

### Correct Initialization for Trade Operations

```typescript
import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Wallet } from '@xchainjs/xchain-wallet'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import {
  assetToBase,
  assetAmount,
  assetFromStringEx,
  AssetCryptoAmount,
} from '@xchainjs/xchain-util'
// Your mnemonic phrase (keep this secure!)
const phrase = 'your twelve word mnemonic phrase here ...'

// Initialize MayaChain query
const mayachainQuery = new MayachainQuery()

// Initialize wallet with clients that have the phrase
const wallet = new Wallet({
  ETH: new EthClient({ 
    ...defaultEthParams, 
    phrase,  // IMPORTANT: Include phrase for signing
    network: Network.Mainnet 
  }),
  MAYA: new MayaClient({ 
    phrase,  // IMPORTANT: Include phrase for signing
    network: Network.Mainnet 
  }),
  // Add other clients as needed with their phrases
})

// Initialize MayachainAMM
const mayachainAmm = new MayachainAMM(mayachainQuery, wallet)

// Now you can perform trade operations
async function addToTradeAccount() {
  try {
    const result = await mayachainAmm.addToTradeAccount({
      amount: new AssetCryptoAmount(
        assetToBase(assetAmount('0.1')), 
        assetFromStringEx('ETH.ETH')
      ),
      address: 'maya1...', // Your Maya address
    })
    console.log('Transaction hash:', result.hash)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### Read-Only Operations (No Phrase Required)

For read-only operations like estimating trades, you can use the default initialization:

```typescript
const mayachainAmm = new MayachainAMM()

// Estimate operations work without a phrase
const estimate = await mayachainAmm.estimateAddToTradeAccount({
  amount: new AssetCryptoAmount(
    assetToBase(assetAmount('0.1')), 
    assetFromStringEx('ETH.ETH')
  ),
  address: 'maya1...',
})
```

## Common Issues

1. **"No clients available" Error**: This occurs when trying to broadcast a transaction without providing a mnemonic phrase to the client.

2. **Network Mismatch**: Ensure all clients are initialized with the same network (Mainnet, Stagenet, etc.)

3. **Missing Client**: Make sure the wallet has a client for the chain you're trying to trade (e.g., ETH client for ETH trades)

## Best Practices

1. Never hardcode your mnemonic phrase in production code
2. Use environment variables or secure key management systems
3. Always validate addresses before performing operations
4. Check operation estimates before executing trades
5. Handle errors gracefully and provide meaningful feedback to users

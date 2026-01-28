# Manual Deposit Transaction Example

This example shows how to create a deposit transaction manually using the `@xchainjs/xchain-mayachain` package directly.

## Example Code

```typescript
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount, baseAmount } from '@xchainjs/xchain-util'

async function createManualDepositTx() {
  // Initialize Maya client with phrase
  const phrase = 'your twelve word mnemonic phrase here'
  
  const mayaClient = new MayaClient({
    phrase,
    network: Network.Mainnet,
    // Optional: specify custom RPC endpoints if needed
    // clientUrls: {
    //   [Network.Mainnet]: ['https://tendermint.mayachain.info']
    // }
  })

  try {
    // Get your Maya address
    const address = await mayaClient.getAddressAsync()
    console.log('Your Maya address:', address)

    // Create deposit parameters
    const depositParams = {
      walletIndex: 0,
      asset: assetFromStringEx('ETH.ETH'), // The asset you're depositing
      amount: assetToBase(assetAmount('0.1', 8)), // Amount in base units
      memo: 'TRADE+:maya1youraddress', // Your trade memo
    }

    // Make the deposit transaction
    const txHash = await mayaClient.deposit(depositParams)
    console.log('Transaction hash:', txHash)
    
    // Get transaction URL
    const txUrl = await mayaClient.getExplorerTxUrl(txHash)
    console.log('Transaction URL:', txUrl)

  } catch (error) {
    console.error('Error creating deposit:', error)
  }
}

// Alternative: Using transfer method directly
async function createManualTransferTx() {
  const phrase = 'your twelve word mnemonic phrase here'
  
  const mayaClient = new MayaClient({
    phrase,
    network: Network.Mainnet,
  })

  try {
    const address = await mayaClient.getAddressAsync()
    
    // For TRADE+ operations, you typically send to the same address with a memo
    const txParams = {
      walletIndex: 0,
      asset: assetFromStringEx('MAYA.CACAO'), // Native asset
      amount: assetToBase(assetAmount('1', 10)), // 1 CACAO (10 decimals)
      recipient: address, // Send to yourself for trade operations
      memo: 'TRADE+:maya1youraddress', // Trade memo
    }

    const txHash = await mayaClient.transfer(txParams)
    console.log('Transaction hash:', txHash)
    
  } catch (error) {
    console.error('Error creating transfer:', error)
  }
}

// For checking balances before operation
async function checkBalance() {
  const mayaClient = new MayaClient({
    network: Network.Mainnet,
    // No phrase needed for read-only operations
  })

  const address = 'maya1youraddress'
  const balances = await mayaClient.getBalance(address)
  
  balances.forEach(balance => {
    console.log(`${balance.asset.symbol}: ${balance.amount.amount().toString()}`)
  })
}
```

## Important Notes

1. **Mnemonic Phrase**: The client MUST be initialized with a mnemonic phrase to sign transactions. Without it, you'll get "No clients available" error.

2. **Network**: Make sure the network matches your intended target (Mainnet, Stagenet).

3. **Memo Format**: For trade operations:
   - Add to trade: `TRADE+:address`
   - Withdraw from trade: `TRADE-:address`

4. **Asset Format**: Use the correct asset format:
   - Native: `MAYA.CACAO`
   - Trade assets: `ETH~ETH`, `BTC~BTC`, etc.

5. **Error Handling**: The client will throw errors if:
   - No RPC endpoints are available
   - Invalid memo format
   - Insufficient balance
   - Network issues

## Debugging Connection Issues

If you're getting "No clients available" errors:

```typescript
// Test connection to RPC endpoints
async function testConnection() {
  const mayaClient = new MayaClient({
    phrase: 'your phrase',
    network: Network.Mainnet,
  })

  try {
    // Try to get network info
    const network = mayaClient.getNetwork()
    console.log('Network:', network)
    
    // Try to get address (requires working client)
    const address = await mayaClient.getAddressAsync()
    console.log('Address:', address)
    
    // Try to get balance (requires RPC connection)
    const balances = await mayaClient.getBalance(address)
    console.log('Balance check successful')
    
  } catch (error) {
    console.error('Connection test failed:', error)
  }
}
```

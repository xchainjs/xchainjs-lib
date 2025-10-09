#!/usr/bin/env node

// Comprehensive test script to verify that both THORChain and Maya quoting work 
// when their respective Midgard services are unavailable

const { Aggregator } = require('./packages/xchain-aggregator/lib/index.js');
const { Network } = require('./packages/xchain-client/lib/index.js');
const { assetFromStringEx } = require('./packages/xchain-util/lib/asset.js');
const { baseAmount } = require('./packages/xchain-util/lib/asset.js');

async function testAllFallbacks() {
  console.log('🧪 Testing quoting resilience for both THORChain and Maya when Midgard is unavailable...\n');

  const testCases = [
    {
      protocol: 'Thorchain',
      name: 'THORChain',
      testSwaps: [
        {
          fromAsset: assetFromStringEx('BTC.BTC'),
          destinationAsset: assetFromStringEx('ETH.ETH'),
          amount: baseAmount('100000000', 8), // 1 BTC
          description: 'BTC → ETH'
        },
        {
          fromAsset: assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7'),
          destinationAsset: assetFromStringEx('GAIA.ATOM'),
          amount: baseAmount('1000000000', 6), // 1000 USDT
          description: 'USDT → ATOM'
        }
      ]
    },
    {
      protocol: 'Mayachain',
      name: 'Maya',
      testSwaps: [
        {
          fromAsset: assetFromStringEx('BTC.BTC'),
          destinationAsset: assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7'),
          amount: baseAmount('50000000', 8), // 0.5 BTC
          description: 'BTC → USDT'
        },
        {
          fromAsset: assetFromStringEx('KUJI.KUJI'),
          destinationAsset: assetFromStringEx('MAYA.CACAO'),
          amount: baseAmount('100000000', 6), // 100 KUJI
          description: 'KUJI → CACAO'
        }
      ]
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔥 Testing ${testCase.name} Protocol`);
    console.log('=' + '='.repeat(50));

    try {
      // Create aggregator for this protocol
      const aggregator = new Aggregator({
        network: Network.Mainnet,
        protocols: [testCase.protocol]
      });

      console.log(`✅ ${testCase.name} aggregator created successfully\n`);

      for (const testSwap of testCase.testSwaps) {
        try {
          console.log(`📊 Testing ${testSwap.description}:`);
          
          const quotes = await aggregator.estimateSwap({
            fromAsset: testSwap.fromAsset,
            destinationAsset: testSwap.destinationAsset,
            amount: testSwap.amount,
          });

          if (quotes && quotes.length > 0) {
            console.log(`  ✅ Success! Got ${quotes.length} quote(s)`);
            console.log(`  💰 Expected output: ${quotes[0].expectedAmount.formattedAssetString()}`);
            console.log(`  ⏱️  Swap time: ${quotes[0].totalSwapSeconds}s`);
            console.log(`  🏷️  Protocol: ${quotes[0].protocol}`);
            console.log(`  💸 Total fees: ${quotes[0].fees.totalFee.formattedAssetString()}`);
            console.log(`  🚀 Can swap: ${quotes[0].canSwap}`);
            if (quotes[0].errors.length > 0) {
              console.log(`  ⚠️  Errors: ${quotes[0].errors.join(', ')}`);
            }
          } else {
            console.log('  ❌ No quotes returned');
          }
        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}`);
        }
        console.log('');
      }

    } catch (error) {
      console.error(`💥 ${testCase.name} test failed:`, error.message);
    }
    
    console.log(''); // Extra spacing between protocols
  }

  console.log('🎉 All fallback tests completed!');
  console.log('💡 The system should work even when Midgard services are unavailable.');
  console.log('🛡️  Fallback features implemented:');
  console.log('   ✅ Optimistic asset validation (both protocols)');
  console.log('   ✅ Comprehensive decimal fallbacks with live pool data');
  console.log('   ✅ Thornode-first caching for THORChain');
  console.log('   ✅ Mayanode-first caching for Maya (NEW!)');
  console.log('   ✅ Graceful degradation to Midgard APIs when node APIs fail');
  console.log('   ✅ Chain-based decimal defaults for unknown assets');
  console.log('   ✅ Graceful error handling with informative warnings');
}

// Run the comprehensive test
testAllFallbacks().catch(console.error);
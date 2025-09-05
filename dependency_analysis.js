#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Read all package.json files
const packagesDir = '/Users/dev/Documents/xchainjs-lib/packages'
const packages = fs.readdirSync(packagesDir).filter((dir) => fs.statSync(path.join(packagesDir, dir)).isDirectory())

const packageData = []
const allDeps = new Map()

const externalDeps = new Map()

// Process each package
packages.forEach((pkgName) => {
  const pkgPath = path.join(packagesDir, pkgName, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

    const deps = Object.keys(pkg.dependencies || {})
    const devDeps = Object.keys(pkg.devDependencies || {})

    // Separate internal vs external dependencies
    const internalDeps = deps.filter((dep) => dep.startsWith('@xchainjs/'))
    const externalProductionDeps = deps.filter((dep) => !dep.startsWith('@xchainjs/') && dep !== 'workspace:*')

    packageData.push({
      name: pkg.name,
      version: pkg.version,
      totalDeps: deps.length,
      internalDeps: internalDeps.length,
      externalDeps: externalProductionDeps.length,
      devDeps: devDeps.length,
      deps,
      devDeps,
      internalDeps,
      externalProductionDeps,
    })

    // Track all dependencies
    deps.forEach((dep) => {
      if (!dep.startsWith('@xchainjs/') && dep !== 'workspace:*') {
        externalDeps.set(dep, (externalDeps.get(dep) || 0) + 1)
      }
      allDeps.set(dep, (allDeps.get(dep) || 0) + 1)
    })
  }
})

// Sort by usage count
const sortedExternalDeps = Array.from(externalDeps.entries()).sort((a, b) => b[1] - a[1])
const sortedAllDeps = Array.from(allDeps.entries()).sort((a, b) => b[1] - a[1])

console.log('=== DEPENDENCY ANALYSIS ===\n')

console.log('📊 PACKAGE SUMMARY:')
console.log(`Total packages: ${packageData.length}`)
console.log(`Total unique external dependencies: ${externalDeps.size}`)
console.log(`Total unique internal dependencies: ${allDeps.size - externalDeps.size}`)

console.log('\n🔗 MOST COMMON EXTERNAL DEPENDENCIES:')
sortedExternalDeps.slice(0, 15).forEach(([dep, count]) => {
  console.log(`  ${dep}: ${count} packages`)
})

console.log('\n🏗️ MOST COMMON INTERNAL DEPENDENCIES:')
sortedAllDeps
  .filter(([dep]) => dep.startsWith('@xchainjs/'))
  .slice(0, 10)
  .forEach(([dep, count]) => {
    console.log(`  ${dep}: ${count} packages`)
  })

console.log('\n📦 PACKAGES WITH MOST DEPENDENCIES:')
packageData
  .sort((a, b) => b.totalDeps - a.totalDeps)
  .slice(0, 10)
  .forEach((pkg) => {
    console.log(`  ${pkg.name}: ${pkg.totalDeps} deps (${pkg.externalDeps} external, ${pkg.internalDeps} internal)`)
  })

console.log('\n🎯 HEAVY EXTERNAL DEPENDENCIES (common & likely large):')
const heavyDeps = [
  'ethers',
  'axios',
  'bignumber.js',
  '@cosmjs/stargate',
  '@cosmjs/proto-signing',
  'protobufjs',
  'bitcoinjs-lib',
  '@scure/bip32',
  '@bitcoin-js/tiny-secp256k1-asmjs',
]

heavyDeps.forEach((dep) => {
  const count = externalDeps.get(dep) || 0
  if (count > 0) {
    console.log(`  ${dep}: ${count} packages`)
  }
})

console.log('\n🔍 PACKAGES WITH UNIQUE/HEAVY DEPENDENCIES:')
packageData.forEach((pkg) => {
  const uniqueHeavyDeps = pkg.externalProductionDeps.filter((dep) => {
    return (
      (externalDeps.get(dep) || 0) <= 2 ||
      [
        '@emurgo/cardano-serialization-lib-browser',
        '@radixdlt/babylon-gateway-api-sdk',
        '@chainflip/sdk',
        '@metaplex-foundation/mpl-token-metadata',
        '@solana/web3.js',
      ].includes(dep)
    )
  })

  if (uniqueHeavyDeps.length > 0) {
    console.log(`  ${pkg.name}: ${uniqueHeavyDeps.join(', ')}`)
  }
})

console.log('\n🔄 DEPENDENCY DUPLICATION ANALYSIS:')
console.log('Dependencies used by 5+ packages (opportunity for optimization):')
sortedExternalDeps
  .filter(([, count]) => count >= 5)
  .forEach(([dep, count]) => {
    console.log(`  ${dep}: ${count} packages`)
  })

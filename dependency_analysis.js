#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Parse CLI arguments for packagesDir
function parsePackagesDir() {
  const args = process.argv.slice(2)
  let packagesDir = null

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log('📊 Dependency Analysis Script')
    console.log('')
    console.log('Usage: node dependency_analysis.js [options]')
    console.log('')
    console.log('Options:')
    console.log('  --packagesDir <path>    Path to packages directory')
    console.log('  --packagesDir=<path>    Path to packages directory (alternative syntax)')
    console.log('  --help, -h              Show this help message')
    console.log('')
    console.log('Examples:')
    console.log('  node dependency_analysis.js')
    console.log('  node dependency_analysis.js --packagesDir ./packages')
    console.log('  node dependency_analysis.js --packagesDir=/path/to/packages')
    process.exit(0)
  }

  // Look for --packagesDir argument
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--packagesDir' && i + 1 < args.length) {
      packagesDir = args[i + 1]
      break
    }
    if (args[i].startsWith('--packagesDir=')) {
      packagesDir = args[i].split('=')[1]
      break
    }
  }

  // Use sensible defaults if not provided
  if (!packagesDir) {
    // Try common locations
    const candidates = [
      path.join(process.cwd(), 'packages'),
      path.resolve(__dirname, '..', 'packages'),
      path.resolve(__dirname, 'packages'),
    ]

    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        packagesDir = candidate
        break
      }
    }
  }

  // Validate the packages directory
  if (!packagesDir) {
    console.error('❌ Error: Could not find packages directory.')
    console.error('   Please specify with --packagesDir <path>')
    console.error('   Example: node dependency_analysis.js --packagesDir ./packages')
    process.exit(1)
  }

  const resolvedPath = path.resolve(packagesDir)

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Error: Packages directory does not exist: ${resolvedPath}`)
    console.error('   Please specify a valid directory with --packagesDir <path>')
    process.exit(1)
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    console.error(`❌ Error: Packages path is not a directory: ${resolvedPath}`)
    console.error('   Please specify a valid directory with --packagesDir <path>')
    process.exit(1)
  }

  console.log(`📦 Using packages directory: ${resolvedPath}`)
  return resolvedPath
}

// Read all package.json files
const packagesDir = parsePackagesDir()
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
    const externalProductionDeps = deps.filter((dep) => {
      // Exclude internal @xchainjs packages
      if (dep.startsWith('@xchainjs/')) return false

      // Exclude workspace dependencies by checking their version
      const version = pkg.dependencies[dep]
      return version && !version.startsWith('workspace:')
    })

    packageData.push({
      name: pkg.name,
      version: pkg.version,
      totalDeps: deps.length,
      internalDepsCount: internalDeps.length,
      externalDeps: externalProductionDeps.length,
      devDepsCount: devDeps.length,
      deps,
      devDeps,
      internalDeps,
      externalProductionDeps,
    })

    // Track all dependencies
    deps.forEach((dep) => {
      const version = pkg.dependencies[dep]

      // Track external dependencies (exclude internal packages and workspace deps)
      if (!dep.startsWith('@xchainjs/') && version && !version.startsWith('workspace:')) {
        externalDeps.set(dep, (externalDeps.get(dep) || 0) + 1)
      }

      // Track all dependencies (including internal, but excluding workspace deps)
      if (version && !version.startsWith('workspace:')) {
        allDeps.set(dep, (allDeps.get(dep) || 0) + 1)
      }
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
    console.log(
      `  ${pkg.name}: ${pkg.totalDeps} deps (${pkg.externalDeps} external, ${pkg.internalDepsCount} internal)`,
    )
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

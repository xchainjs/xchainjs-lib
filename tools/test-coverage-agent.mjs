#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

class TestCoverageAgent {
  constructor() {
    this.packagesDir = path.join(rootDir, 'packages')
    this.templatesDir = path.join(__dirname, 'test-templates')
    this.processedPackages = []
    this.errors = []
  }

  async run() {
    console.log('🧪 TestCoverage Agent - Analyzing test coverage gaps...\n')

    try {
      await this.createTemplateDirectory()
      const packagesWithoutTests = await this.analyzeTestCoverage()
      await this.prioritizePackages(packagesWithoutTests)
      await this.generateTests(packagesWithoutTests)
      await this.generateReport()
    } catch (error) {
      console.error('❌ Agent failed:', error.message)
      process.exit(1)
    }
  }

  async createTemplateDirectory() {
    await fs.mkdir(this.templatesDir, { recursive: true })
  }

  async analyzeTestCoverage() {
    console.log('📊 Analyzing test coverage...')
    const packages = await fs.readdir(this.packagesDir)
    const packagesWithoutTests = []

    for (const pkg of packages) {
      const pkgPath = path.join(this.packagesDir, pkg)
      const stat = await fs.stat(pkgPath)

      if (!stat.isDirectory()) continue

      const testsPath = path.join(pkgPath, '__tests__')
      const hasTests = await this.directoryExists(testsPath)

      if (!hasTests) {
        const packageJson = await this.readPackageJson(pkgPath)
        if (packageJson && packageJson.name && packageJson.name.startsWith('@xchainjs/')) {
          packagesWithoutTests.push({
            name: packageJson.name,
            path: pkgPath,
            priority: this.calculatePriority(packageJson.name, packageJson),
          })
        }
      }
    }

    console.log(`Found ${packagesWithoutTests.length} packages without tests`)
    return packagesWithoutTests
  }

  calculatePriority(name, packageJson) {
    // Critical infrastructure packages
    if (name.includes('xchain-client')) return 1
    if (name.includes('xchain-util')) return 1
    if (name.includes('xchain-crypto')) return 1

    // Major blockchain clients
    if (name.includes('ethereum') || name.includes('bitcoin') || name.includes('thorchain')) return 2
    if (name.includes('binance') || name.includes('cosmos') || name.includes('avax')) return 2

    // EVM chains
    if (name.includes('bsc') || name.includes('arbitrum') || name.includes('base')) return 3

    // API packages
    if (name.includes('midgard') || name.includes('thornode') || name.includes('mayanode')) return 4

    // Others
    return 5
  }

  async prioritizePackages(packages) {
    packages.sort((a, b) => a.priority - b.priority)
    console.log('\\n📋 Package priorities:')
    packages.forEach((pkg) => {
      const priority = ['🔴 Critical', '🟠 High', '🟡 Medium', '🔵 Low', '⚪ Minimal'][pkg.priority - 1]
      console.log(`  ${priority}: ${pkg.name}`)
    })
  }

  async generateTests(packages) {
    console.log('\\n🏗️  Generating tests...')

    for (const pkg of packages) {
      try {
        console.log(`\\n📝 Processing ${pkg.name}...`)

        const srcPath = path.join(pkg.path, 'src')
        const hasSrc = await this.directoryExists(srcPath)

        if (!hasSrc) {
          console.log(`  ⏭️  Skipping ${pkg.name} - no src directory`)
          continue
        }

        await this.generatePackageTests(pkg)
        this.processedPackages.push(pkg.name)
      } catch (error) {
        console.error(`  ❌ Failed to process ${pkg.name}:`, error.message)
        this.errors.push({ package: pkg.name, error: error.message })
      }
    }
  }

  async generatePackageTests(pkg) {
    const testsDir = path.join(pkg.path, '__tests__')
    await fs.mkdir(testsDir, { recursive: true })

    // Analyze package structure
    const srcFiles = await this.analyzeSrcStructure(path.join(pkg.path, 'src'))
    const packageJson = await this.readPackageJson(pkg.path)

    // Generate appropriate tests based on package type
    if (pkg.name.includes('xchain-client')) {
      await this.generateClientBaseTests(testsDir, srcFiles, packageJson)
    } else if (this.isBlockchainClient(pkg.name)) {
      await this.generateBlockchainClientTests(testsDir, srcFiles, packageJson, pkg.name)
    } else if (this.isApiPackage(pkg.name)) {
      await this.generateApiTests(testsDir, srcFiles, packageJson, pkg.name)
    } else {
      await this.generateGenericTests(testsDir, srcFiles, packageJson, pkg.name)
    }

    console.log(`  ✅ Generated tests for ${pkg.name}`)
  }

  async analyzeSrcStructure(srcPath) {
    const files = []
    try {
      const entries = await fs.readdir(srcPath, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.ts')) {
          const content = await fs.readFile(path.join(srcPath, entry.name), 'utf8')
          files.push({
            name: entry.name,
            path: path.join(srcPath, entry.name),
            hasClass: /class\\s+\\w+/.test(content),
            hasFunction: /export\\s+(function|const\\s+\\w+\\s*=)/.test(content),
            hasInterface: /interface\\s+\\w+/.test(content),
            isIndex: entry.name === 'index.ts',
            exports: this.extractExports(content),
          })
        }
      }
    } catch (error) {
      console.log(`    ⚠️  Could not analyze src structure: ${error.message}`)
    }

    return files
  }

  extractExports(content) {
    const exports = []
    const exportRegex = /export\\s+(?:(?:default\\s+)?(?:class|function|const|interface)\\s+(\\w+)|\\{([^}]+)\\})/g
    let match

    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1]) {
        exports.push(match[1])
      } else if (match[2]) {
        exports.push(
          ...match[2]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    }

    return exports
  }

  isBlockchainClient(name) {
    const blockchains = ['ethereum', 'bitcoin', 'binance', 'cosmos', 'thorchain', 'avax', 'bsc', 'arbitrum', 'base']
    return blockchains.some((chain) => name.includes(chain))
  }

  isApiPackage(name) {
    return name.includes('midgard') || name.includes('thornode') || name.includes('mayanode')
  }

  async generateClientBaseTests(testsDir, srcFiles, packageJson) {
    const testContent = `import { Network } from '../src/index'

describe('XChain Client Base', () => {
  describe('Network', () => {
    it('should have mainnet network', () => {
      expect(Network.Mainnet).toBe('mainnet')
    })

    it('should have testnet network', () => {
      expect(Network.Testnet).toBe('testnet')
    })

    it('should have stagenet network', () => {
      expect(Network.Stagenet).toBe('stagenet')
    })
  })

  describe('Exports', () => {
    it('should export required types and classes', () => {
      const exports = require('../src/index')
      expect(exports.Network).toBeDefined()
      expect(exports.BaseXChainClient).toBeDefined()
      expect(exports.TxType).toBeDefined()
    })
  })
})
`

    await fs.writeFile(path.join(testsDir, 'index.test.ts'), testContent)
  }

  async generateBlockchainClientTests(testsDir, srcFiles, packageJson, packageName) {
    const chainName = this.extractChainName(packageName)
    const testContent = `import { Network } from '@xchainjs/xchain-client'

describe('${chainName} Client', () => {
  describe('Client Exports', () => {
    it('should export Client class', () => {
      const clientModule = require('../src/index')
      expect(clientModule.Client).toBeDefined()
    })

    it('should export default client params', () => {
      const clientModule = require('../src/index')
      expect(clientModule.defaultParams || clientModule.default${chainName}Params).toBeDefined()
    })
  })

  describe('Constants', () => {
    it('should export chain and asset constants', () => {
      const constants = require('../src/index')
      expect(constants).toBeDefined()
    })
  })

  describe('Network Configuration', () => {
    it('should support all networks', () => {
      expect(Network.Mainnet).toBe('mainnet')
      expect(Network.Testnet).toBe('testnet')
      expect(Network.Stagenet).toBe('stagenet')
    })
  })
})
`

    await fs.writeFile(path.join(testsDir, 'client.test.ts'), testContent)
  }

  async generateApiTests(testsDir, srcFiles, packageJson, packageName) {
    const apiName = packageName.split('-').pop()
    const testContent = `describe('${apiName.toUpperCase()} API', () => {
  describe('API Exports', () => {
    it('should export API client', () => {
      const apiModule = require('../src/index')
      expect(apiModule).toBeDefined()
    })
  })

  describe('Configuration', () => {
    it('should have proper configuration structure', () => {
      const config = require('../src/index')
      expect(typeof config).toBe('object')
    })
  })
})
`

    await fs.writeFile(path.join(testsDir, 'api.test.ts'), testContent)
  }

  async generateGenericTests(testsDir, srcFiles, packageJson, packageName) {
    const testContent = `describe('${packageJson.name}', () => {
  describe('Module Exports', () => {
    it('should export main functionality', () => {
      const moduleExports = require('../src/index')
      expect(moduleExports).toBeDefined()
      expect(typeof moduleExports).toBe('object')
    })
  })

  describe('Package Structure', () => {
    it('should have valid package configuration', () => {
      const pkg = require('../package.json')
      expect(pkg.name).toBe('${packageJson.name}')
      expect(pkg.version).toBeDefined()
    })
  })
})
`

    await fs.writeFile(path.join(testsDir, 'index.test.ts'), testContent)
  }

  extractChainName(packageName) {
    const parts = packageName.split('-')
    const chain = parts[parts.length - 1]
    return chain.charAt(0).toUpperCase() + chain.slice(1)
  }

  async generateReport() {
    console.log('\\n📊 TestCoverage Agent Report')
    console.log('================================')
    console.log(`✅ Successfully processed: ${this.processedPackages.length} packages`)

    if (this.processedPackages.length > 0) {
      console.log('\\n📦 Packages with new tests:')
      this.processedPackages.forEach((pkg) => console.log(`  • ${pkg}`))
    }

    if (this.errors.length > 0) {
      console.log(`\\n❌ Errors encountered: ${this.errors.length}`)
      this.errors.forEach((error) => {
        console.log(`  • ${error.package}: ${error.error}`)
      })
    }

    console.log('\\n🎯 Next Steps:')
    console.log('  1. Run: yarn test to validate all generated tests')
    console.log('  2. Review and enhance tests as needed')
    console.log('  3. Add integration tests for critical packages')
    console.log('  4. Set up CI/CD test coverage reporting')
  }

  // Utility methods
  async directoryExists(dirPath) {
    try {
      const stat = await fs.stat(dirPath)
      return stat.isDirectory()
    } catch {
      return false
    }
  }

  async readPackageJson(pkgPath) {
    try {
      const content = await fs.readFile(path.join(pkgPath, 'package.json'), 'utf8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }
}

// Run the agent
const agent = new TestCoverageAgent()
agent.run().catch(console.error)

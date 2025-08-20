#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

class EnhancedTestCoverageAgent {
  constructor() {
    this.packagesDir = path.join(rootDir, 'packages')
    this.templatesDir = path.join(__dirname, 'test-templates')
    this.processedPackages = []
    this.errors = []
    this.exportAnalysis = new Map()
  }

  async run() {
    console.log('🧪 Enhanced TestCoverage Agent - Analyzing actual exports...\n')

    try {
      await this.createTemplateDirectory()
      const packagesWithoutTests = await this.analyzeTestCoverage()
      await this.analyzeExports(packagesWithoutTests)
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

  async analyzeExports(packages) {
    console.log('\\n🔍 Analyzing actual exports...')

    for (const pkg of packages) {
      try {
        console.log(`  📋 Analyzing ${pkg.name}...`)
        const analysis = await this.analyzePackageExports(pkg.path)
        this.exportAnalysis.set(pkg.name, analysis)

        console.log(
          `    Found: ${analysis.namedExports.length} named exports, ${
            analysis.defaultExport ? '1' : '0'
          } default export`,
        )
        if (analysis.namedExports.length > 0) {
          console.log(
            `    Exports: ${analysis.namedExports.slice(0, 5).join(', ')}${
              analysis.namedExports.length > 5 ? '...' : ''
            }`,
          )
        }
      } catch (error) {
        console.log(`    ⚠️  Could not analyze exports for ${pkg.name}: ${error.message}`)
        this.exportAnalysis.set(pkg.name, {
          namedExports: [],
          defaultExport: null,
          types: [],
          hasClient: false,
          patterns: [],
        })
      }
    }
  }

  async analyzePackageExports(pkgPath) {
    const indexPath = path.join(pkgPath, 'src', 'index.ts')
    const analysis = {
      namedExports: [],
      defaultExport: null,
      types: [],
      hasClient: false,
      hasDefaultParams: false,
      clientTypes: [],
      constants: [],
      utilities: [],
      patterns: [],
    }

    try {
      const content = await fs.readFile(indexPath, 'utf8')

      // Analyze export patterns
      analysis.patterns = this.identifyExportPatterns(content)

      // Extract named exports
      const namedExportMatches = content.matchAll(/export\s*\{([^}]+)\}/g)
      for (const match of namedExportMatches) {
        const exports = match[1]
          .split(',')
          .map((e) => e.trim().split(' as ')[0].trim())
          .filter(Boolean)
        analysis.namedExports.push(...exports)
      }

      // Extract direct exports
      const directExportMatches = content.matchAll(/export\s+(?:const|class|interface|type|function)\s+(\w+)/g)
      for (const match of directExportMatches) {
        analysis.namedExports.push(match[1])
      }

      // Extract re-exports (simplified)
      if (content.includes('export * from')) {
        const lines = content.split('\n')
        for (const line of lines) {
          if (line.includes('export * from') && line.includes('./')) {
            // Simple extraction of file path
            const match = line.match(/export\s*\*\s*from\s*['"]\.\/([^'"]+)['"]/)
            if (match) {
              const filePath = path.join(pkgPath, 'src', match[1] + '.ts')
              try {
                const fileContent = await fs.readFile(filePath, 'utf8')
                const fileExports = this.extractExportsFromContent(fileContent)
                analysis.namedExports.push(...fileExports.namedExports)
                if (fileExports.defaultExport) analysis.defaultExport = fileExports.defaultExport
              } catch {
                // File might not exist or be accessible
              }
            }
          }
        }
      }

      // Check for default export
      const defaultExportMatch = content.match(/export\s+default\s+(\w+)/)
      if (defaultExportMatch) {
        analysis.defaultExport = defaultExportMatch[1]
      }

      // Categorize exports
      this.categorizeExports(analysis)

      // Remove duplicates
      analysis.namedExports = [...new Set(analysis.namedExports)]
    } catch (error) {
      console.log(`    ⚠️  Could not read index.ts: ${error.message}`)
    }

    return analysis
  }

  identifyExportPatterns(content) {
    const patterns = []

    if (/export\\s*\\*\\s*from/.test(content)) patterns.push('re-export-all')
    if (/export\\s*\\{[^}]*\\}\\s*from/.test(content)) patterns.push('re-export-named')
    if (/export\\s+(?:const|class)\\s+\\w+Client/i.test(content)) patterns.push('client-class')
    if (/export\\s+default\\s+\\w+Client/i.test(content)) patterns.push('default-client')
    if (/export.*default.*[Pp]arams/.test(content)) patterns.push('default-params')
    if (/export.*\\w+Utils?\\b/.test(content)) patterns.push('utilities')
    if (/export.*\\w+Constants?\\b/.test(content)) patterns.push('constants')

    return patterns
  }

  extractExportsFromContent(content) {
    const exports = { namedExports: [], defaultExport: null }

    // Named exports
    const namedMatches = content.matchAll(/export\\s+(?:const|class|interface|type|function)\\s+(\\w+)/g)
    for (const match of namedMatches) {
      exports.namedExports.push(match[1])
    }

    // Default export
    const defaultMatch = content.match(/export\\s+default\\s+(\\w+)/)
    if (defaultMatch) {
      exports.defaultExport = defaultMatch[1]
    }

    return exports
  }

  categorizeExports(analysis) {
    analysis.namedExports.forEach((exportName) => {
      const name = exportName.toLowerCase()

      if (name.includes('client')) {
        analysis.hasClient = true
        analysis.clientTypes.push(exportName)
      }
      if (name.includes('params') && name.includes('default')) {
        analysis.hasDefaultParams = true
      }
      if (name.includes('utils') || name.includes('util')) {
        analysis.utilities.push(exportName)
      }
      if (name.includes('const') || name.includes('chain') || name.includes('asset')) {
        analysis.constants.push(exportName)
      }
      if (name.endsWith('type') || name.startsWith('type')) {
        analysis.types.push(exportName)
      }
    })
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
    console.log('\\n🏗️  Generating accurate tests...')

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

    const analysis = this.exportAnalysis.get(pkg.name)
    const packageJson = await this.readPackageJson(pkg.path)

    // Generate tests based on actual exports analysis
    await this.generateExportBasedTests(testsDir, analysis, packageJson, pkg.name)

    console.log(`  ✅ Generated accurate tests for ${pkg.name}`)
  }

  async generateExportBasedTests(testsDir, analysis, packageJson, packageName) {
    const chainName = this.extractChainName(packageName)
    const testFileName = this.isApiPackage(packageName)
      ? 'api.test.ts'
      : this.isBlockchainClient(packageName)
      ? 'client.test.ts'
      : 'index.test.ts'

    let testContent = `describe('${packageName}', () => {
  describe('Module Exports', () => {
    let moduleExports: any

    beforeAll(() => {
      moduleExports = require('../src/index')
    })
`

    // Test named exports
    if (analysis.namedExports.length > 0) {
      testContent += `
    describe('Named Exports', () => {`

      analysis.namedExports.forEach((exportName) => {
        testContent += `
      it('should export ${exportName}', () => {
        expect(moduleExports.${exportName}).toBeDefined()
      })`
      })

      testContent += `
    })`
    }

    // Test client exports specifically
    if (analysis.hasClient) {
      testContent += `
    describe('Client Exports', () => {`

      analysis.clientTypes.forEach((clientType) => {
        testContent += `
      it('should export ${clientType} class', () => {
        expect(moduleExports.${clientType}).toBeDefined()
        expect(typeof moduleExports.${clientType}).toBe('function')
      })`
      })

      testContent += `
    })`
    }

    // Test utilities
    if (analysis.utilities.length > 0) {
      testContent += `
    describe('Utility Functions', () => {`

      analysis.utilities.forEach((util) => {
        testContent += `
      it('should export ${util}', () => {
        expect(moduleExports.${util}).toBeDefined()
        expect(typeof moduleExports.${util}).toBe('function')
      })`
      })

      testContent += `
    })`
    }

    // Test constants
    if (analysis.constants.length > 0) {
      testContent += `
    describe('Constants', () => {`

      analysis.constants.forEach((constant) => {
        testContent += `
      it('should export ${constant}', () => {
        expect(moduleExports.${constant}).toBeDefined()
      })`
      })

      testContent += `
    })`
    }

    // Test default export
    if (analysis.defaultExport) {
      testContent += `
    describe('Default Export', () => {
      it('should export default ${analysis.defaultExport}', () => {
        expect(moduleExports.default).toBeDefined()
      })
    })`
    }

    // Add network tests for blockchain clients
    if (this.isBlockchainClient(packageName)) {
      testContent += `
    describe('Network Configuration', () => {
      it('should support standard networks', () => {
        const { Network } = require('@xchainjs/xchain-client')
        expect(Network.Mainnet).toBe('mainnet')
        expect(Network.Testnet).toBe('testnet')
        expect(Network.Stagenet).toBe('stagenet')
      })
    })`
    }

    // Add package structure test
    testContent += `
    describe('Package Structure', () => {
      it('should have valid package configuration', () => {
        const pkg = require('../package.json')
        expect(pkg.name).toBe('${packageJson.name}')
        expect(pkg.version).toBeDefined()
      })
    })`

    testContent += `
  })
})
`

    await fs.writeFile(path.join(testsDir, testFileName), testContent)
  }

  isBlockchainClient(name) {
    const blockchains = ['ethereum', 'bitcoin', 'binance', 'cosmos', 'thorchain', 'avax', 'bsc', 'arbitrum', 'base']
    return blockchains.some((chain) => name.includes(chain)) && !name.includes('sdk')
  }

  isApiPackage(name) {
    return name.includes('midgard') || name.includes('thornode') || name.includes('mayanode')
  }

  extractChainName(packageName) {
    const parts = packageName.split('-')
    const chain = parts[parts.length - 1]
    return chain.charAt(0).toUpperCase() + chain.slice(1)
  }

  async generateReport() {
    console.log('\\n📊 Enhanced TestCoverage Agent Report')
    console.log('==========================================')
    console.log(`✅ Successfully processed: ${this.processedPackages.length} packages`)

    if (this.processedPackages.length > 0) {
      console.log('\\n📦 Packages with accurate tests:')
      this.processedPackages.forEach((pkg) => {
        const analysis = this.exportAnalysis.get(pkg)
        const exportCount = analysis ? analysis.namedExports.length : 0
        console.log(`  • ${pkg} (${exportCount} exports validated)`)
      })
    }

    if (this.errors.length > 0) {
      console.log(`\\n❌ Errors encountered: ${this.errors.length}`)
      this.errors.forEach((error) => {
        console.log(`  • ${error.package}: ${error.error}`)
      })
    }

    console.log('\\n🎯 Next Steps:')
    console.log('  1. Run: yarn test to validate all accurate tests')
    console.log('  2. Tests now validate actual exports instead of assumptions')
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

// Run the enhanced agent
const agent = new EnhancedTestCoverageAgent()
agent.run().catch(console.error)

#!/usr/bin/env node
/**
 * ConfigSync Agent - Standardizes configuration files across XChainJS packages
 *
 * This agent ensures consistent configuration across all packages in the monorepo:
 * - Rollup configurations
 * - Jest configurations (unit and e2e)
 * - TypeScript configurations
 * - Package.json scripts standardization
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPO_ROOT = path.resolve(__dirname, '..')
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages')
const TEMPLATES_DIR = path.join(__dirname, 'config-templates')

// Configuration templates
const CONFIG_TEMPLATES = {
  'rollup.config.js': 'rollup.config.base.js',
  'jest.config.mjs': 'jest.config.base.mjs',
  'jest.config.e2e.mjs': 'jest.config.e2e.base.mjs',
  'tsconfig.json': 'tsconfig.base.json',
}

// Standard package.json scripts that should be consistent
const STANDARD_SCRIPTS = {
  clean: 'rm -rf .turbo && rm -rf lib',
  build: 'yarn clean && rollup -c --bundleConfigAsCjs',
  'build:release':
    'yarn exec rm -rf release && yarn pack && yarn exec "mkdir release && tar zxvf package.tgz --directory release && rm package.tgz"',
  test: 'jest',
  lint: 'eslint "{src,__tests__}/**/*.ts" --fix --max-warnings 0',
}

class ConfigSyncAgent {
  constructor() {
    this.packagesProcessed = 0
    this.filesUpdated = 0
    this.errors = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async getPackageDirectories() {
    try {
      const entries = await fs.promises.readdir(PACKAGES_DIR, { withFileTypes: true })
      return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(PACKAGES_DIR, entry.name))
    } catch (error) {
      this.log(`Failed to read packages directory: ${error.message}`, 'error')
      return []
    }
  }

  async copyTemplate(templateName, targetPath) {
    try {
      const templatePath = path.join(TEMPLATES_DIR, templateName)
      const templateContent = await fs.promises.readFile(templatePath, 'utf8')

      // Check if target file exists and if content is different
      let needsUpdate = true
      try {
        const existingContent = await fs.promises.readFile(targetPath, 'utf8')
        needsUpdate = existingContent.trim() !== templateContent.trim()
      } catch {
        // File doesn't exist, needs creation
      }

      if (needsUpdate) {
        await fs.promises.writeFile(targetPath, templateContent)
        this.filesUpdated++
        return true
      }
      return false
    } catch (error) {
      this.log(`Failed to copy template ${templateName} to ${targetPath}: ${error.message}`, 'error')
      this.errors.push(`Template copy failed: ${templateName} -> ${targetPath}`)
      return false
    }
  }

  async updatePackageJsonScripts(packagePath) {
    const packageJsonPath = path.join(packagePath, 'package.json')

    try {
      const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf8')
      const packageJson = JSON.parse(packageJsonContent)

      let updated = false
      if (!packageJson.scripts) {
        packageJson.scripts = {}
      }

      // Update standard scripts
      for (const [scriptName, scriptCommand] of Object.entries(STANDARD_SCRIPTS)) {
        if (packageJson.scripts[scriptName] !== scriptCommand) {
          packageJson.scripts[scriptName] = scriptCommand
          updated = true
        }
      }

      // Add e2e script if __e2e__ directory exists
      const e2eDir = path.join(packagePath, '__e2e__')
      if (fs.existsSync(e2eDir) && !packageJson.scripts['e2e']) {
        packageJson.scripts['e2e'] = 'jest --config jest.config.e2e.mjs'
        updated = true
      }

      if (updated) {
        await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
        this.filesUpdated++
        return true
      }
      return false
    } catch (error) {
      this.log(`Failed to update package.json in ${packagePath}: ${error.message}`, 'error')
      this.errors.push(`Package.json update failed: ${packagePath}`)
      return false
    }
  }

  async syncPackageConfigs(packagePath) {
    const packageName = path.basename(packagePath)
    this.log(`Syncing configurations for ${packageName}`)

    let updatedFiles = []

    // Copy configuration templates
    for (const [targetFile, templateFile] of Object.entries(CONFIG_TEMPLATES)) {
      const targetPath = path.join(packagePath, targetFile)

      // Skip if package doesn't need this config (e.g., no __e2e__ dir for e2e config)
      if (targetFile === 'jest.config.e2e.mjs' && !fs.existsSync(path.join(packagePath, '__e2e__'))) {
        continue
      }

      const wasUpdated = await this.copyTemplate(templateFile, targetPath)
      if (wasUpdated) {
        updatedFiles.push(targetFile)
      }
    }

    // Handle special case for TypeScript config with tests
    const hasTests = fs.existsSync(path.join(packagePath, '__tests__'))
    if (hasTests) {
      const tsConfigPath = path.join(packagePath, 'tsconfig.json')
      const wasUpdated = await this.copyTemplate('tsconfig.with-tests.json', tsConfigPath)
      if (wasUpdated) {
        updatedFiles.push('tsconfig.json (with tests)')
      }
    }

    // Update package.json scripts
    const scriptsUpdated = await this.updatePackageJsonScripts(packagePath)
    if (scriptsUpdated) {
      updatedFiles.push('package.json scripts')
    }

    if (updatedFiles.length > 0) {
      this.log(`Updated ${packageName}: ${updatedFiles.join(', ')}`)
    } else {
      this.log(`${packageName}: No updates needed`)
    }

    this.packagesProcessed++
  }

  async validateTemplates() {
    this.log('Validating configuration templates...')

    for (const templateFile of Object.values(CONFIG_TEMPLATES)) {
      const templatePath = path.join(TEMPLATES_DIR, templateFile)
      if (!fs.existsSync(templatePath)) {
        this.log(`Template not found: ${templatePath}`, 'error')
        this.errors.push(`Missing template: ${templateFile}`)
      }
    }

    if (this.errors.length > 0) {
      this.log('Template validation failed. Please ensure all templates exist.', 'error')
      return false
    }

    this.log('All templates validated successfully')
    return true
  }

  async run(options = {}) {
    const { dryRun = false, packages = [] } = options

    this.log('🚀 Starting ConfigSync Agent')

    if (dryRun) {
      this.log('Running in DRY RUN mode - no files will be modified', 'warn')
    }

    // Validate templates first
    if (!(await this.validateTemplates())) {
      process.exit(1)
    }

    // Get package directories
    let packageDirs = await this.getPackageDirectories()

    // Filter packages if specific ones requested
    if (packages.length > 0) {
      packageDirs = packageDirs.filter((dir) => packages.some((pkg) => path.basename(dir) === pkg))
    }

    this.log(`Found ${packageDirs.length} packages to process`)

    // Process each package
    for (const packageDir of packageDirs) {
      if (!dryRun) {
        await this.syncPackageConfigs(packageDir)
      } else {
        this.log(`[DRY RUN] Would sync: ${path.basename(packageDir)}`)
      }
    }

    // Report results
    this.log('📊 ConfigSync Agent Results:')
    this.log(`Packages processed: ${this.packagesProcessed}`)
    this.log(`Files updated: ${this.filesUpdated}`)

    if (this.errors.length > 0) {
      this.log(`Errors encountered: ${this.errors.length}`, 'warn')
      this.errors.forEach((error) => this.log(`  - ${error}`, 'error'))
    }

    this.log('✨ ConfigSync Agent completed')
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    packages: [],
  }

  // Parse package names
  const packagesIndex = args.indexOf('--packages')
  if (packagesIndex !== -1 && args[packagesIndex + 1]) {
    options.packages = args[packagesIndex + 1].split(',')
  }

  if (args.includes('--help')) {
    console.log(`
ConfigSync Agent - Standardize configuration files across XChainJS packages

Usage:
  node config-sync-agent.js [options]

Options:
  --dry-run                   Show what would be changed without making changes
  --packages pkg1,pkg2,pkg3   Only process specific packages (comma-separated)
  --help                      Show this help message

Examples:
  node config-sync-agent.js --dry-run
  node config-sync-agent.js --packages xchain-bitcoin,xchain-ethereum
  node config-sync-agent.js
    `)
    process.exit(0)
  }

  const agent = new ConfigSyncAgent()
  await agent.run(options)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ ConfigSync Agent failed:', error)
    process.exit(1)
  })
}

export default ConfigSyncAgent

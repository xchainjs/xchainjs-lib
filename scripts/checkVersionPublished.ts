const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

interface SimplePackageJson {
  name: string
  version: string
}

function getLatestVersion(packageName: string): string {
  try {
    return execSync(`npm show ${packageName} version`, { encoding: 'utf-8' }).trim()
  } catch (e) {
    return 'unavailable'
  }
}

const publishCommands: string[] = []

function compareVersions(packagePath: string, packageName: string, currentVersion: string): void {
  const latestVersion = getLatestVersion(packageName)
  if (latestVersion === 'unavailable') {
    console.log(`Unable to fetch latest version for ${packageName}.`)
    return
  }

  if (currentVersion !== latestVersion) {
    const relativePath = path.relative(process.cwd(), packagePath)
    const publishCommand = `(cd ${relativePath} && npm publish)`

    console.log(
      `Publish new version for ${packageName} in ${packagePath} from npm version ${latestVersion}  to ${currentVersion}`,
    )
    publishCommands.push(publishCommand)
  }
}
function checkPackageJson(packagePath: string): void {
  const packageJsonPath = path.join(packagePath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as SimplePackageJson

  const { name, version } = packageJson
  compareVersions(packagePath, name, version)
}

function getPackagePaths(directoryPath: string): string[] {
  const files = fs.readdirSync(directoryPath)
  const packagePaths: string[] = []

  for (const file of files) {
    const filePath = path.join(directoryPath, file)
    const fileStat = fs.statSync(filePath)
    if (fileStat.isDirectory() && fs.existsSync(path.join(filePath, 'package.json'))) {
      packagePaths.push(filePath)
    } else if (fileStat.isDirectory()) {
      packagePaths.push(...getPackagePaths(filePath))
    }
  }

  return packagePaths
}

function main(): void {
  const packagesPath = path.join(__dirname, '..', 'packages')
  const packagePaths = getPackagePaths(packagesPath)

  for (const packagePath of packagePaths) {
    checkPackageJson(packagePath)
  }
  if (publishCommands.length > 0) {
    console.log('\nPublish Commands:')
    console.log(publishCommands.join('\n'))
  }
}

main()

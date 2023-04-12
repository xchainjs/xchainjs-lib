const fs = require('fs')
const path = require('path')

interface PackageJson {
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

function updatePackageJson(packagePath: string, packageName: string, version: string): void {
  const packageJsonPath = path.join(packagePath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson

  if (packageJson.devDependencies && packageJson.devDependencies[packageName]) {
    const depVersion = packageJson.devDependencies[packageName]
    if (/^(\^|\~|\d)/.test(depVersion)) {
      const newVersion = `^${version}`
      if (depVersion === newVersion) {
        console.log(`${packageName} is already up to date.`)
      } else {
        console.log(`Updating ${packageName} from ${depVersion} to ${newVersion}`)
        packageJson.devDependencies[packageName] = newVersion
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      }
    } else {
      console.log(`${packageName} is not using a compatible version specifier.`)
    }
  } else {
    console.log(`${packageName} is not devDependency ${packageJsonPath}.`)
  }
  if (packageJson.peerDependencies && packageJson.peerDependencies[packageName]) {
    const depVersion = packageJson.peerDependencies[packageName]
    if (/^(\^|\~|\d)/.test(depVersion)) {
      const newVersion = `^${version}`
      if (depVersion === newVersion) {
        console.log(`${packageName} is already up to date.`)
      } else {
        console.log(`Updating ${packageName} from ${depVersion} to ${newVersion}`)
        packageJson.peerDependencies[packageName] = newVersion
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      }
    } else {
      console.log(`${packageName} is not using a compatible version specifier.`)
    }
  } else {
    console.log(`${packageName} is not peerDependency ${packageJsonPath}.`)
  }
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
function updatePackage(packageName: string, version: string): void {
  const packagesPath = path.join(__dirname, '..', 'packages')
  const packagePaths = getPackagePaths(packagesPath)

  for (const packagePath of packagePaths) {
    updatePackageJson(packagePath, `@xchainjs/xchain-${packageName}`, version)
  }
}

function main(): void {
  const [_, __, packageName, version] = process.argv
  if (!packageName || !version) {
    console.error('Usage: node update-package.ts <package-name> <version>')
    process.exit(1)
  }
  updatePackage(packageName, version)
}

main()

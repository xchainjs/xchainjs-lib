const fs = require('fs')
const path = require('path')

interface PackageJson {
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

function updatePackageJson(
  packagePath: string,
  packageName: string,
  version: string,
  useFullPackageName = false,
): void {
  const packageJsonPath = path.join(packagePath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson

  const fullPackageName = useFullPackageName ? packageName : `@xchainjs/xchain-${packageName}`

  if (packageJson.devDependencies && packageJson.devDependencies[fullPackageName]) {
    const depVersion = packageJson.devDependencies[fullPackageName]
    if (/^(\^|\~|\d)/.test(depVersion)) {
      const newVersion = `^${version}`
      if (depVersion === newVersion) {
        console.log(`${fullPackageName} is already up to date.`)
      } else {
        console.log(`Updating ${fullPackageName} from ${depVersion} to ${newVersion}`)
        packageJson.devDependencies[fullPackageName] = newVersion
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      }
    } else {
      console.log(`${fullPackageName} is not using a compatible version specifier.`)
    }
  } else {
    console.log(`${fullPackageName} is not a devDependency in ${packageJsonPath}.`)
  }
  if (packageJson.peerDependencies && packageJson.peerDependencies[fullPackageName]) {
    const depVersion = packageJson.peerDependencies[fullPackageName]
    if (/^(\^|\~|\d)/.test(depVersion)) {
      const newVersion = `^${version}`
      if (depVersion === newVersion) {
        console.log(`${fullPackageName} is already up to date.`)
      } else {
        console.log(`Updating ${fullPackageName} from ${depVersion} to ${newVersion}`)
        packageJson.peerDependencies[fullPackageName] = newVersion
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      }
    } else {
      console.log(`${fullPackageName} is not using a compatible version specifier.`)
    }
  } else {
    console.log(`${fullPackageName} is not a peerDependency in ${packageJsonPath}.`)
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

function updatePackage(packageName: string, version: string, useFullPackageName = false): void {
  const packagesPath = path.join(__dirname, '..', 'packages')
  const packagePaths = getPackagePaths(packagesPath)

  for (const packagePath of packagePaths) {
    updatePackageJson(packagePath, packageName, version, useFullPackageName)
  }
}

function main(): void {
  const [_, __, packageName, version, useFullPackageNameArg] = process.argv
  const useFullPackageName = useFullPackageNameArg === 'true'
  updatePackage(packageName, version, useFullPackageName)
}

main()

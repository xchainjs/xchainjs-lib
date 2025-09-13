const fs = require('fs')

// Lista de versiones comprometidas conocidas (ejemplos, actualiza cuando salga la lista oficial)
const compromised = {
  chalk: ['5.3.0', '5.3.1'],
  debug: ['4.3.5', '4.3.6'],
  'ansi-styles': ['6.2.1'],
  'strip-ansi': ['7.1.1'],
  'color-convert': ['2.1.2'],
}

function checkYarnLock(file) {
  const content = fs.readFileSync(file, 'utf8')
  const results = []

  for (const [pkg, versions] of Object.entries(compromised)) {
    versions.forEach((ver) => {
      // Yarn.lock tiene entradas tipo: chalk@^5.0.0:
      const regex = new RegExp(`\\n${pkg}@[^:]+:\\n[\\s\\S]*?version "\\s*${ver}\\s*"`, 'g')
      if (regex.test(content)) {
        results.push({ name: pkg, version: ver })
      }
    })
  }

  return results
}

const file = 'yarn.lock'
if (!fs.existsSync(file)) {
  console.error(`No se encontró ${file}`)
  process.exit(1)
}

const bad = checkYarnLock(file)

if (bad.length === 0) {
  console.log('✅ No se encontraron dependencias comprometidas.')
} else {
  console.log('⚠️ Se encontraron dependencias comprometidas:')
  console.table(bad)
}

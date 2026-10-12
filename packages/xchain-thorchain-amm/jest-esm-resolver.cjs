const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

const esbuild = require('esbuild')

// Jest's transform hook never sees .mjs (pirates cannot hijack ESM). @mysten/sui 2
// publishes only .mjs, and the built Sui client require()s those entrypoints.
// Bundle each resolved file to CJS once, then let Jest load the bundle.
const cacheDir = path.join(os.tmpdir(), 'xchain-thorchain-amm-jest-esm')

const bundleMjs = (resolved) => {
  const stat = fs.statSync(resolved)
  const key = crypto.createHash('sha1').update(resolved).update(String(stat.mtimeMs)).update(String(stat.size)).digest('hex')
  const outfile = path.join(cacheDir, `${key}.js`)
  if (!fs.existsSync(outfile)) {
    fs.mkdirSync(cacheDir, { recursive: true })
    const temporary = `${outfile}.${process.pid}.tmp`
    esbuild.buildSync({
      entryPoints: [resolved],
      bundle: true,
      format: 'cjs',
      platform: 'node',
      outfile: temporary,
      logLevel: 'silent',
    })
    fs.renameSync(temporary, outfile)
  }
  return outfile
}

module.exports = (request, options) => {
  const resolved = options.defaultResolver(request, options)
  const isMystenMjs =
    resolved.endsWith('.mjs') && resolved.includes(`${path.sep}@mysten${path.sep}sui${path.sep}`)
  return isMystenMjs ? bundleMjs(resolved) : resolved
}

const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

const esbuild = require('esbuild')

// Jest's transform hook never sees .mjs (pirates cannot hijack ESM). @mysten/sui 2
// publishes only .mjs, and the built Sui client require()s those entrypoints.
// Bundle each resolved file to CJS once, then let Jest load the bundle.
const cacheDir = path.join(os.tmpdir(), 'xchain-thorchain-amm-jest-esm')

const fileSignature = (filePath) => {
  const stat = fs.statSync(filePath)
  return `${stat.size}:${Math.round(stat.mtimeMs)}`
}

const inputsAreCurrent = (stampPath) => {
  try {
    const stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8'))
    const entries = Object.entries(stamp)
    return entries.length > 0 && entries.every(([filePath, signature]) => fileSignature(filePath) === signature)
  } catch {
    return false
  }
}

const bundleMjs = (resolved) => {
  const key = crypto.createHash('sha1').update(resolved).update(fileSignature(resolved)).digest('hex')
  const outfile = path.join(cacheDir, `${key}.js`)
  const stampPath = `${outfile}.inputs.json`
  if (fs.existsSync(outfile) && inputsAreCurrent(stampPath)) return outfile

  fs.mkdirSync(cacheDir, { recursive: true })
  const workingDir = path.dirname(resolved)
  const temporary = `${outfile}.${process.pid}.tmp`
  const result = esbuild.buildSync({
    absWorkingDir: workingDir,
    entryPoints: [path.basename(resolved)],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile: temporary,
    metafile: true,
    logLevel: 'silent',
  })
  const stamp = {}
  for (const inputPath of Object.keys(result.metafile.inputs)) {
    const absolute = path.resolve(workingDir, inputPath)
    stamp[absolute] = fileSignature(absolute)
  }
  const stampTemporary = `${stampPath}.${process.pid}.tmp`
  fs.writeFileSync(stampTemporary, JSON.stringify(stamp))
  fs.renameSync(temporary, outfile)
  fs.renameSync(stampTemporary, stampPath)
  return outfile
}

module.exports = (request, options) => {
  const resolved = options.defaultResolver(request, options)
  const isMystenMjs =
    resolved.endsWith('.mjs') && resolved.includes(`${path.sep}@mysten${path.sep}sui${path.sep}`)
  return isMystenMjs ? bundleMjs(resolved) : resolved
}

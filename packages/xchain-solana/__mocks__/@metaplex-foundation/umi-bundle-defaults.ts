const umiBundleDefaultsRealPackage = jest.requireActual('@metaplex-foundation/umi-bundle-defaults')

class Umi {
  public use(): Umi {
    return new Umi()
  }
}
const createUmi = (): Umi => {
  return new Umi()
}

const umiBundleDefaultsMockPackage = {
  ...umiBundleDefaultsRealPackage,
  createUmi,
}

module.exports = umiBundleDefaultsMockPackage

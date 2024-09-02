// import { Context, PublicKey, RpcGetAccountsOptions } from '@metaplex-foundation/umi'

const mplTtokenMetadataRealPackage = jest.requireActual('@metaplex-foundation/mpl-token-metadata')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchAllDigitalAsset = async (_umi: any, pks: string[]) => {
  return [
    {
      publicKey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      mint: {
        publicKey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        header: {
          executable: false,
          owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          lamports: {
            basisPoints: 87661392404,
            identifier: 'SOL',
            decimals: 9,
          },
          rentEpoch: 18446744073709551616,
          exists: true,
        },
        mintAuthority: {
          __option: 'Some',
          value: 'Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi',
        },
        supply: 1889938175280062,
        decimals: 6,
        isInitialized: true,
        freezeAuthority: {
          __option: 'Some',
          value: 'Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi',
        },
      },
      metadata: {
        publicKey: '8c3zk1t1qt3RU43ckuvPkCS7HLbjJqq3J3Me8ov4aHrp',
        header: {
          executable: false,
          owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
          lamports: {
            basisPoints: 5616720,
            identifier: 'SOL',
            decimals: 9,
          },
          rentEpoch: 18446744073709551616,
          exists: true,
        },
        key: 4,
        updateAuthority: 'Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi',
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'USDT',
        symbol: 'USDT',
        uri: '',
        sellerFeeBasisPoints: 0,
        creators: {
          __option: 'None',
        },
        primarySaleHappened: false,
        isMutable: true,
        editionNonce: {
          __option: 'Some',
          value: 255,
        },
        tokenStandard: {
          __option: 'None',
        },
        collection: {
          __option: 'None',
        },
        uses: {
          __option: 'None',
        },
        collectionDetails: {
          __option: 'None',
        },
        programmableConfig: {
          __option: 'None',
        },
      },
    },
    {
      publicKey: '8zMTcsEFiB12NKrM5QXWL5pw1QMNJrAhH6Kh278YWFRY',
      mint: {
        publicKey: '8zMTcsEFiB12NKrM5QXWL5pw1QMNJrAhH6Kh278YWFRY',
        header: {
          executable: false,
          owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          lamports: {
            basisPoints: 1461600,
            identifier: 'SOL',
            decimals: 9,
          },
          rentEpoch: 18446744073709551616,
          exists: true,
        },
        mintAuthority: {
          __option: 'None',
        },
        supply: 999771614895221,
        decimals: 6,
        isInitialized: true,
        freezeAuthority: {
          __option: 'None',
        },
      },
      metadata: {
        publicKey: 'EsDwUDmbeGAASS4HXd8v289fgVXDK182wsLnwLmkKLfD',
        header: {
          executable: false,
          owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
          lamports: {
            basisPoints: 5616720,
            identifier: 'SOL',
            decimals: 9,
          },
          rentEpoch: 18446744073709551616,
          exists: true,
        },
        key: 4,
        updateAuthority: 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM',
        mint: '8zMTcsEFiB12NKrM5QXWL5pw1QMNJrAhH6Kh278YWFRY',
        name: 'KYOTO',
        symbol: 'KYOTO',
        uri: 'https://ipfs.io/ipfs/QmUzVaz4YH8sGpcPre2mgfwvXzT16gf6J6inYv2Z9Yn7f6',
        sellerFeeBasisPoints: 0,
        creators: {
          __option: 'None',
        },
        primarySaleHappened: false,
        isMutable: false,
        editionNonce: {
          __option: 'Some',
          value: 255,
        },
        tokenStandard: {
          __option: 'Some',
          value: 2,
        },
        collection: {
          __option: 'None',
        },
        uses: {
          __option: 'None',
        },
        collectionDetails: {
          __option: 'None',
        },
        programmableConfig: {
          __option: 'None',
        },
      },
    },
  ].filter((dg) => pks.findIndex((pk) => pk === dg.publicKey) !== -1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchDigitalAsset = async (_umi: any, pk: string) => {
  if (pk === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') {
    return {
      publicKey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      mint: {
        publicKey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        header: {
          executable: false,
          owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          lamports: {
            basisPoints: 87661392404,
            identifier: 'SOL',
            decimals: 9,
          },
          rentEpoch: 18446744073709551616,
          exists: true,
        },
        mintAuthority: {
          __option: 'Some',
          value: 'Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi',
        },
        supply: 1889938175280062,
        decimals: 6,
        isInitialized: true,
        freezeAuthority: {
          __option: 'Some',
          value: 'Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi',
        },
      },
      metadata: {
        publicKey: '8c3zk1t1qt3RU43ckuvPkCS7HLbjJqq3J3Me8ov4aHrp',
        header: {
          executable: false,
          owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
          lamports: {
            basisPoints: 5616720,
            identifier: 'SOL',
            decimals: 9,
          },
          rentEpoch: 18446744073709551616,
          exists: true,
        },
        key: 4,
        updateAuthority: 'Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi',
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'USDT',
        symbol: 'USDT',
        uri: '',
        sellerFeeBasisPoints: 0,
        creators: {
          __option: 'None',
        },
        primarySaleHappened: false,
        isMutable: true,
        editionNonce: {
          __option: 'Some',
          value: 255,
        },
        tokenStandard: {
          __option: 'None',
        },
        collection: {
          __option: 'None',
        },
        uses: {
          __option: 'None',
        },
        collectionDetails: {
          __option: 'None',
        },
        programmableConfig: {
          __option: 'None',
        },
      },
    }
  }

  throw new Error('Can not find asset')
}

const mplTtokenMetadataPackage = {
  ...mplTtokenMetadataRealPackage,
  fetchAllDigitalAsset,
  fetchDigitalAsset,
}

module.exports = mplTtokenMetadataPackage

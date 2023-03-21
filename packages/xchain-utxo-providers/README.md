# XChainJS API providers Interface

A specification for a generalised interface for api providers, to be used by XChainJS implementations. The providers should not have any functionality to generate a key, instead, the `asgardex-crypto` library should be used to ensure cross-chain compatible keystores are handled. The providers is only ever passed a master BIP39 phrase, from which a temporary key and address is decoded.

## Documentation

### [`xchain providers`](http://docs.xchainjs.org/xchain-xchain-utxo-providers/)

[`Overview of xchain-providers`](http://docs.xchainjs.org/xchain-utxo-providers/overview.html)\
[`Interface of xchain-providers`](http://docs.xchainjs.org/xchain-utxo-providers/interface.html)

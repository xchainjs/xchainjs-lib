# XChainJS Wallet Client Interface

A specification for a generalised interface for crypto wallets clients, to be used by XChainJS implementations. The client should not have any functionality to generate a key, instead, the `asgardex-crypto` library should be used to ensure cross-chain compatible keystores are handled. The client is only ever passed a master BIP39 phrase, from which a temporary key and address is decoded.

## Documentation

### [`xchain client`](http://docs.xchainjs.org/xchain-client/)
[`Overview of xchain-client`](http://docs.xchainjs.org/xchain-client/overview.html)\
[`Interface of xchain-client`](http://docs.xchainjs.org/xchain-client/interface.html)

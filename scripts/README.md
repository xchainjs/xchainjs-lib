## Update Deps

- This is a script to enter every folder inside `packages` and look for the file `package.json` and update
  devDependencies and peerDependencies.

- only need to specify the package name as this `@xchainjs/xchain-` is appended in the script.

### Examples

yarn updateDeps <packageName> <packageVersion>

```
yarn updateDeps client 0.13.7
```

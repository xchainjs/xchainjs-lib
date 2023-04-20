## Update Deps

- This is a script to enter every folder inside `packages` and look for the file `package.json` and update
  devDependencies and peerDependencies.

- only need to specify the package name as this `@xchainjs/xchain-` is appended in the script.

### Examples

// for xchainjs packages
yarn updateDeps <packageName> <packageVersion>

```
yarn updateDeps client 0.13.7
```

### For other packages

- So it can find the full package name

yarn updateDeps <fullpackageName> <packageVersion> true

```
yarn updateDeps @psf/bitcoincashjs-lib 4.0.3 true
```

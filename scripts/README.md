## Update Deps

- This is a script to enter every folder inside `packages` and look for the file `package.json` and update
  devDependencies and peerDependencies.

- only need to specify the package name as this `@xchainjs/xchain-` is appended in the script.

### Examples


### Using python scripting update package version Minor or Patch

It will only bump version number by 1. i.e for patch > 0.1.1 -> 0.1.2 for Minor > 0.1.1 -> 0.2.0 

For the whole library.

yarn updatePackages <versionControl> <ChangelogHeading> <ChangelogMessage>

```
yarn updatePackages patch Update "update rollup config and axios to the latest"
```

For just one package.

```
yarn updatePackages minor Update "update rollup config and axios to the latest" avax
```


## Using Typescript to update package dependencies in other library packages. 

// For xchainjs packages, will search the library for matching args and update
yarn updateDeps <packageName> <packageVersion>

```
yarn updateDeps client 0.13.7
```

### For other packages

For all other package deps flag <true> last arg for script to search for non xchainjs packages 

yarn updateDeps <fullpackageName> <packageVersion> <boolean>

```
yarn updateDeps @psf/bitcoincashjs-lib 4.0.3 true
```



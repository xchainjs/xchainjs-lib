#!/bin/bash

# Build packages using lerna
npx lerna bootstrap
npx lerna run build

# Start local NPM registry
npx verdaccio >> "local_registry.log" &
sleep 10 # probably not needed

# Configure sample user
npx npm-cli-login -u "${NPM_USERNAME}" -p "${NPM_PASSWORD}" -e "${NPM_EMAIL}" -r "${local_registry_url}"

# Execute publish in dry-run
npx lerna publish from-package \
    --registry "http://localhost:4873" \
    --no-git-tag-version --no-push --yes \
    --loglevel verbose

#!/bin/bash
LOCAL_REGISTRY_URL="http://localhost:4873"

# Build packages using lerna
npx lerna bootstrap
npx lerna run build

# Start local NPM registry
npx verdaccio >>"local_registry.log" &
sleep 10 # probably not needed

# Configure sample user
npx npm-cli-login -u "${NPM_USERNAME}" -p "${NPM_PASSWORD}" -e "${NPM_EMAIL}" -r "${LOCAL_REGISTRY_URL}"

# Execute publish in dry-run
npx lerna publish from-package \
  --registry $LOCAL_REGISTRY_URL \
  --no-git-tag-version --no-push --yes \
  --loglevel verbose

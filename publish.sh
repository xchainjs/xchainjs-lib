#!/bin/bash

# Build packages using lerna
npx lerna bootstrap
npx lerna run build

# Configure sample user
npx npm-cli-login -u "${NPM_USERNAME}" -p "${NPM_PASSWORD}" -e "${NPM_EMAIL}"

# Execute publish
npx lerna publish from-package \
    --no-git-tag-version --no-push --yes \
    --loglevel verbose

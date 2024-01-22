# Token Migration Tool


## Required VSCode extensions

- https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
- https://marketplace.visualstudio.com/items?itemName=rohit-gohri.format-code-action
- https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker
- https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits

## Commit convention

We are using conventional commit messages to keep everything clean.
Please follow the commit message pattern as described here:

https://www.conventionalcommits.org/en/v1.0.0/

## Husky pre commit validation

Resolve path issue (`.husky/commit-msg: line 4: npx: command not found`) in SourceTree as described here: https://github.com/typicode/husky/issues/904

```
echo "export PATH="$(dirname $(which node)):$PATH"" > ~/.huskyrc
```

## Local development setup

In order to setup your development environment, follow the following steps:

1. We require [docker](https://www.docker.com/get-started) to be installed on your system.
2. The currently supported versions of node is defined in the .nvmrc file. We recommend to install [NVM](https://github.com/nvm-sh/nvm#installing-and-updating) and then install the correct node version via `nvm install`.
3. Install project dependencies by executing the following commands in the root directory of the project:

   ```bash
   nvm use
   npm install
   ```

   **Please note:** Running `npm install` will automatically run initialization scripts for setting up the development environment. For example, the UID and GID of the own user is written into the file ".env" in the root directory. This is necessary so that files are not written by the CMS with the wrong permissions. If the .env file already exists, the script may ask if it is allowed to overwrite it. In case of problems the script can also be executed manually via `npm run init`.

   You may need to refresh your Google credentials file to ensure the Bucket access is working properly on your dev system: `gcloud auth application-default login`

4. Create and start docker containers:

   ```sh
   docker-compose up
   ```

UI: http://localhost:3001

## Run docker containers in production mode

```
docker-compose -f docker-compose.yml up
```

### Deployment

For the test server deployment, the following commands needs to be executed in the projects root folder.
Replace `<BRANCH_TO_DEPLOY>` with the branch name you want to deploy, it will be most likely the `main` branch.

```bash
git checkout test
git reset --hard <BRANCH_TO_DEPLOY>
git push --force origin test
```

## Production server

@TODO: URLs needs to be defined

&nbsp;

## Contracts

&nbsp;

### Ropsten (Test)

- **TokenV1:** 0x8B4F33ddFFB73A71174be03d4b42837e1980327A
- **TokenV2:** 0x4270C8B79a385Bc1dc9E4434fBC9Ddf5524bC62A
- **SwapEngine:** 0x6637dDecfe1dDC407beE0552f66eFD842495Fc29

&nbsp;

### Mainnet

- **TokenV1:**
- **TokenV2:**
- **SwapEngine:**

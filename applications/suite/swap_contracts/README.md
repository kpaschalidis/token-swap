# Token Upgrade (Swap)

This folder contains the smart contract of the v2 token as well as the engine that swaps the V1 to V2.

## Installation

### Node and packages

`nvm use`
`npm install`

### Environment variables

Create a `.env` file under the project folder that includes the deployer's private key and some other API keys. An example is shown as below.

    INFURA_API_KEY=
    FROM_PRIVATE_KEY=
    MAINNET_PRIVATE_KEY=
    ETHERSCAN_API_KEY=

### Compile

```
npm run build
```

### Test

    npm run test

### Check unit test coverage

    npm run coverage

### Deploy

- Ropsten testnet
  ```
  OWNER=<new token owner address> npm run deploy-token-ropsten
  ```
- Mainnet
  ```
  OWNER=<new token owner address> npm run deploy-token-main
  ```

### Verify source code on EtherScan

```
TOKEN=<deployed token contract> OWNER=<token owner addresss> npm run verify-contract-token
```

## Specifications

###  v1

Small modifications on the naming of the contracts were made to avoid overwriting files with the same name when compiling:

- Change `contract Ownable {` to `contract V1Ownable {`
- Change `contract ERC20 {` to `contract V1ERC20 {`
- Change `contract MiniMeToken is ERC20, Ownable {` to `contract MiniMeToken is V1ERC20, V1Ownable {`
- Change `contract Token is MiniMeToken {` to `contract V1Token is MiniMeToken {`
- Commented change: new function that facilitates test: able to call approve as a non-token holder. This function was only used to test the maximum number of accounts per batch.

###  v2

- Token standard: ERC-20.
- Decimals: 18.
- Total supply: 370 million tokens.
- Ownable: owner account with basic authorization to control certain functions such as reclaim tokens. Includes the option to transfer the ownership of the token contract to different accounts when needed.
- Mintable: the swap of tokens will be done through minting. Callable by the minter only. During the initial swapping phase, the “swap smart contract” is the only minter. After all the v1 tokens are swapped, the minter will renounce itself, leaving no minter for v2 token.
- Burnable: the token owner can burn a specific amount of tokens.
- Reclaim tokens: allows to recover any ERC20 tokens accidentally sent to this contract. The tokens to be recovered will be sent to the owner of the token contract. The owner account can then send those tokens to the account claiming them. Functionality controlled by the token owner only.
- Whitelisted: Allow only whitelisted accounts to be able to Vote in the ecosystem. This whitelist is managed by the WhitelistManagers. Accounts can be added or removed individually or in batches by the manager. This whitelist is not used in token transfer, but only for indentifying eligible voters.
- ConnectUpgradeEngine: Connect the upgrade token swap engine so that this new token can be minted for old token holders. Only owner can set the engineAddress. This action is one-time only.
- RemoveUpgradeEngine: Disconnect the upgrade token swap engine and mint the remaining tokens to the liquidity pool. Only owner can disconnect the engine. This action is one-time only.

### Swap Engine

It takes the v1 token and mint the same amount (after converting to the 18 decimals from 8 decimals) of v2 token for v1 token holders.
This engine will be used by both v1 token holders to upgrade their tokens individually and by the engine owner to upgrade tokens in batches.

- Variables
  - oldToken: address of the v1 token.
  - newToken: address of the v2 token.
  - owner: the only address that can perform “swapAllTokenInBatch” and “reclaimToken”.
  - conversionRate: the conversion of balance due to the change in decimals.
  - convertedBalanceOf: balance of the token converted of an account.
  - totalConverted: the amount of v1 tokens being swapped by the contract.
- Functions
  - swapToken: transfer v1 tokens of a given token holder to the Swap contract and update the “totalSwapped” value. It then mints the identical amount of v2 token to the same token holder.
  - swapAllToken: transfer all the v1 tokens of a given token holder to the Swap contract and update the “totalSwapped” value. It then mints the identical amount of v2 token to the same token holder. This function can be called either by the engine owner or by tokenholders for themselves.
  - swapAllTokenInBatch: perform the swapAllToken functionality but for an array of token holders.
    completeUpgrade: renounce the “minter” role of the Swap contract in v2.
  - reclaimTokens: recover ERC20 tokens that accidentally sent to the swap contract to the “owner” account. The owner account can then send the recovered token to the claiming account. If the ERC20 token is v1, it transfers the difference between the actual balance and the totalConverted to the owner account.

## Deployment

### For production

1. Deploy the `Token` contract by providing the address of the new token owner as the constructor argument.
2. Deploy the `SwapEngine` contract by providing the address of the new engine owner, the v1 token address, and the recently deployed v2 token address as constructor arguments.
3. v2 token owner calls `connectUpgradeEngine` on the v2 token contract with the engine contract address, to connect the swap engine.

### For development and test

Deployment process for development

    deploy-and-setup-for-test

to deploy contracts with deployer's address as the owner of v2 contract and swap engine contract. Otherwise, specify owners' address as follwing.

    V2OWNER=<v2 token owner addresss> OWNER=<swap engine owner addresss> npm run deploy-and-setup-for-test

The script essentially does the following steps:

- Deploy v1
- Owner of v1 calls "mint()" and "finishMinting"
- Deploy v2
- Deploy Swap engine
- Connect Swap engine with v2

Noted that to use the above script, the `v2 token owner wallet` and the `swap engine owner wallet` should be unlocked.

## User guide

Followed by the [deployment on Ethereum mainnet](#For-production), v1 token holders can start exchanging their v1 tokens to v2. To upgrade their v1 tokens for v2, they need to:

1. Call `approve` function on the v1 token contract to allow the swap engine address to transfer their tokens.
2. Call `swapToken` or `swapAllToken` to give back their v1 tokens and receive v2 tokens.

The second step can be replaced by the engine owner calling `swapAllTokenInBatch` with a list of v1 token holders who have approved the engine to swap all their v1 balances.

Token swap will be open for a period of time for v1 token holders and the engine owner. When no more token swap is foreseen by the v2 token owner, this owner can close the swap by calling `removeUpgradeEngine` on the v2 contract. No more swaps can be done. All the remaining v2 tokens (difference between the total supply and the cap at call time) will be minted to the pool address provided in the call.

## Cheat Seat - Buidler Console

V2OWNER=<v1-token-address> OWNER=<v1-token-address> npm run deploy-and-setup-for-test-ropsten

```node
# init
let v1Factory = await ethers.getContractFactory('Token');
let v1Instance = v1Factory.attach('<v1-token-address>');
let v2Factory = await ethers.getContractFactory('TokenV2');
let v2Instance = v2Factory.attach('<v2-token-address>');
let swapEngineFactory = await ethers.getContractFactory('SwapEngine');
let swapEngineInstance = swapEngineFactory.attach('<swap-contract-address>');

# increase allowance of the  swap engine
await v1Instance.approve('<swap-contract-address>', ethers.utils.parseEther('100'));

# migrate
await v1Instance.migrate(ethers.utils.parseEther('10'));

# allowance
await v1Instance.approve('<swap-contract-address>', ethers.utils.parseEther('100'));

ethers.utils.formatEther(await v1Instance.allowance('<v1-token-address>', '<swap-contract-address>'));


# swap all @require owner == msgSenser || tokenHolder == msgSenser
await swapEngineInstance.swapAllToken('<v1-token-address>');

# swap
await swapEngineInstance.swapToken(ethers.utils.parseEther('10'));


ethers.utils.formatEther(await v1Instance.allowance('<v1-token-address>', '<swap-contract-address>'));


ethers.utils.formatEther(await v1Instance.balanceOf('<v1-token-address>'));
ethers.utils.formatEther(await v2Instance.balanceOf('<v1-token-address>'));
```

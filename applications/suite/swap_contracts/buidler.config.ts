import { BuidlerConfig, task, usePlugin } from "@nomiclabs/buidler/config";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import configuration from "./tools/config/env-config";
import { logResult } from "./tools/log/log-deploy-result";

usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-web3");
usePlugin("@nomiclabs/buidler-ethers");
usePlugin("buidler-typechain");
usePlugin("solidity-coverage");
usePlugin("@nomiclabs/buidler-etherscan");

/**
 * example: OWNER=0x3cFddDf82eeF46f6436C214E849942460EB13C08 npm run deploy-token
 */
task("deploy-old-token", "Deploy the new token")
  .addParam("owner", "New owner address")
  .setAction(
    async (taskArg: { owner: string }, bre: BuidlerRuntimeEnvironment) => {
      // get deployer information
      const deployer = (await bre.ethers.getSigners())[0];
      const deployerAddress = await deployer.getAddress();
      console.log("Deployer is ", deployerAddress);

      const name = "TokenV1";

      const contractArtifact = await bre.ethers.getContractFactory(name);
      const contract = await contractArtifact.deploy(
        !bre.ethers.utils.isAddress(taskArg.owner)
          ? deployerAddress
          : taskArg.owner
      );

      await contract.deployed();

      logResult(
        "DEPLOY",
        name,
        contract.address,
        contract.deployTransaction.hash
      );
    }
  );

/**
 * example: OWNER=0x3cFddDf82eeF46f6436C214E849942460EB13C08 npm run deploy-token
 */
task("deploy-new-token", "Deploy the new token")
  .addParam("owner", "New owner address")
  .setAction(
    async (taskArg: { owner: string }, bre: BuidlerRuntimeEnvironment) => {
      const name = "TokenV2";

      const contractArtifact = await bre.ethers.getContractFactory(name);
      const contract = await contractArtifact.deploy(taskArg.owner);

      await contract.deployed();

      logResult(
        "DEPLOY",
        name,
        contract.address,
        contract.deployTransaction.hash
      );
    }
  );

/**
 * example: OWNER=0x3cFddDf82eeF46f6436C214E849942460EB13C08 OLDTOKEN=0x660E78E77B0a4eeF978eF198C7229259f0Eff8ac NEWTOKEN=0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F npm run deploy-swap-engine
 */
task("deploy-swap-engine", "Deploy the swap engine")
  .addParam("owner", "Owner address")
  .addParam("oldtoken", "Old token address")
  .addParam("newtoken", "New token address")
  .setAction(
    async (
      taskArg: { owner: string; oldtoken: string; newtoken: string },
      bre: BuidlerRuntimeEnvironment
    ) => {
      const name = "SwapEngine";

      const contractArtifact = await bre.ethers.getContractFactory(name);
      const contract = await contractArtifact.deploy(
        taskArg.owner,
        taskArg.oldtoken,
        taskArg.newtoken
      );

      await contract.deployed();

      logResult(
        "DEPLOY",
        name,
        contract.address,
        contract.deployTransaction.hash
      );
    }
  );

/**
 * example: V2OWNER=0x3cFddDf82eeF46f6436C214E849942460EB13C08 OWNER=0x3cFddDf82eeF46f6436C214E849942460EB13C08 npm run deploy-and-setup-for-test
 */
task("deploy-and-setup-for-test", "Deploy the swap engine")
  .addOptionalParam("v2owner", "Owner address of the STON v2 token")
  .addOptionalParam("owner", "Owner address of the swap engine")
  .setAction(
    async (
      taskArg: { v2owner: string; owner: string },
      bre: BuidlerRuntimeEnvironment
    ) => {
      // get deployer information
      const deployer = (await bre.ethers.getSigners())[0];
      const deployerAddress = await deployer.getAddress();
      console.log("Deployer is ", deployerAddress);

      console.log(`Deploying 'TokenV1'...`);

      const v1Name = "TokenV1";
      const v1Artifact = await bre.ethers.getContractFactory(v1Name);
      const v1Contract = await v1Artifact.deploy(deployerAddress);
      await v1Contract.deployed();

      logResult(
        "DEPLOY",
        v1Name,
        v1Contract.address,
        v1Contract.deployTransaction.hash
      );

      // mint all the tokens to the deployer and finishMinting
      const mintTx = await v1Contract.mint(
        deployerAddress,
        bre.ethers.utils.parseEther("10000000")
      );

      await mintTx.wait(1);

      logResult(
        "MINT",
        v1Name,
        v1Contract.address,
        v1Contract.deployTransaction.hash
      );

      // await v1Contract.finishMinting({
      //   gasPrice: 25000000000,
      //   gasLimit: 8000000
      // });

      // deploy QjiibeeToken v2
      console.log(`Deploying 'TokenV2'...`);
      const v2Name = "TokenV2";
      const v2Artifact = await bre.ethers.getContractFactory(v2Name);
      const v2Contract = await v2Artifact.deploy(deployerAddress);
      await v2Contract.deployed();

      logResult(
        "DEPLOY",
        v2Name,
        v2Contract.address,
        v2Contract.deployTransaction.hash
      );

      // deploy swap engine
      console.log(`Deploying 'SwapEngine'...`);

      const engineName = "SwapEngine";
      const engineArtifact = await bre.ethers.getContractFactory(engineName);
      const engineContract = await engineArtifact.deploy(
        !bre.ethers.utils.isAddress(taskArg.v2owner)
          ? deployerAddress
          : taskArg.owner,
        v1Contract.address,
        v2Contract.address
      );
      await engineContract.deployed();
      logResult(
        "DEPLOY",
        engineName,
        engineContract.address,
        engineContract.deployTransaction.hash
      );

      // connect the engine to the v2 token
      console.log(`Connecting upgrade engine...`);

      await v1Contract.setMigrationAgent(engineContract.address);
      await v2Contract.connectUpgradeEngine(engineContract.address);
    }
  );

const configBase: BuidlerConfig = {
  defaultNetwork: "buidlerevm",
  solc: {
    version: "0.6.10"
  },
  paths: {
    sources: "./contracts/6",
    artifacts: "./build"
  },
  networks: {
    buidlerevm: {
      gas: 8000000,
      blockGasLimit: 8000000 //999999999
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${configuration.INFURA_API_KEY}`,
      accounts: [configuration.FROM_PRIVATE_KEY]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${configuration.INFURA_API_KEY}`,
      accounts: [configuration.FROM_PRIVATE_KEY]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${configuration.INFURA_API_KEY}`,
      accounts: [configuration.MAINNET_PRIVATE_KEY]
    },
    coverage: {
      url: "http://localhost:8555" // Coverage launches its own ganache-cli client
    }
  },
  etherscan: {
    url: "https://api-ropsten.etherscan.io/api",
    apiKey: configuration.ETHERSCAN_API_KEY
  },
  typechain: {
    outDir: "typechain",
    target: "truffle"
  }
};

export default configBase;

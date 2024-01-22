import { artifacts, web3 } from "@nomiclabs/buidler";
import Web3 from "web3";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import BN from "bn.js"
import { V1TokenInstance as V1Token, TokenInstance as V2Token } from "../typechain";
import cnfContract from "../config/contract-token.json";
import revertReason from "../tools/test/revert-reason.json";
import {
	constants,    // Common constants, like the zero address and largest integers
	expectEvent,  // Assertions for emitted events
  } from "@openzeppelin/test-helpers";

chai.use(solidity).use(require('chai-bn')(BN));

const { expect } = chai;
const { utils } = Web3;

const V1TokenArtifact = artifacts.require("V1Token");
const V2TokenArtifact = artifacts.require("V2Token");

const totalSupply = utils.toWei(cnfContract.TOTAL_SUPPLY); //  370 million tokens of 18 decimal
const whitelistManagerRole = utils.keccak256(utils.asciiToHex(cnfContract.WHITELIST_MANAGER));
const whitelistedRole = utils.keccak256(utils.asciiToHex(cnfContract.WHITELISTED));
const defaultAdminRole = utils.numberToHex(0);
const twentyTokens = utils.toWei("20");
const oneToken = utils.toWei("1");

describe("V2Token", () => {
    let accounts: string[];
    let deployer: string;
    let owner: string;
    let minter: string;
    let whitelistManager: string;
    let voter1: string;
    let voter2: string;
    let tokenHolder1: string;
    let tokenHolder2: string;
    let randomAccount: string;
    let liquidityPool: string;
    let v2Token: V2Token;

    beforeEach(async () => {
        // account setup
        accounts = await web3.eth.getAccounts();
        [
            deployer,
            owner,
            minter,
            whitelistManager,
            voter1,
            voter2,
            tokenHolder1,
            tokenHolder2,
            randomAccount,
            liquidityPool,
        ] = accounts;
        v2Token = await V2TokenArtifact.new(owner);
    });

    describe("validate fresh instantiated state", () => {
        context("value", () => {
            it("should have the proper name", async () => {
                const name = await v2Token.name();
                expect(name).to.eq(cnfContract.NAME);
            });

            it("should have the proper symbol", async () => {
                const symbol = await v2Token.symbol();
                expect(symbol).to.eq(cnfContract.SYMBOL);
            });

            it("should have the proper decimals", async () => {
                const decimals = await v2Token.decimals();
                expect(decimals.toString()).to.be.equal(cnfContract.DECIMALS.toString());
            });

            it("token supply should be zero", async () => {
                const result = await v2Token.totalSupply();
                expect(result.toString()).to.eq('0');
            });

            it("balances should be 0", async () => {
                expect((await v2Token.balanceOf(owner)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(minter)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(whitelistManager)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(voter1)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(voter2)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(tokenHolder1)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(tokenHolder2)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(randomAccount)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(liquidityPool)).toString()).to.eq('0');
            });
            it("has no upgrade engine", async () => {
                expect(await v2Token.upgradeEngine()).to.eq(constants.ZERO_ADDRESS);
                });
                it("has upgrade started", async () => {
                    expect(await v2Token.upgradeStarted()).to.be.false;
                });
        });
        context("roles", () => {
            context("value", () => {
                it("print out the value of whitelistManagerRole", async () => {
                    console.log(whitelistManagerRole);
                });
                it("print out the value of whitelistedRole", async () => {
                    console.log(whitelistedRole);
                });
                it("print out the value of defaultAdminRole", async () => {
                    console.log(defaultAdminRole);
                });
            });
            context("number", () => {
                it("has one default owner", async () => {
                    expect((await v2Token.getRoleMemberCount(defaultAdminRole)).toString()).to.eq('1');
                });
                it("has one whitelist manager", async () => {
                    expect((await v2Token.getRoleMemberCount(whitelistManagerRole)).toString()).to.eq('1');
                });
                it("has no whitelisted account", async () => {
                    expect((await v2Token.getRoleMemberCount(whitelistedRole)).toString()).to.eq('0');
                });
            });
            context("deployer", () => {
                it("is not owner", async () => {
                    expect(await v2Token.owner()).to.not.eq(deployer);
                });
                it("is not whitelist manager", async () => {
                    expect(await v2Token.hasRole(whitelistManagerRole, deployer)).to.be.false;
                });
                it("is not whitelisted", async () => {
                    expect(await v2Token.hasRole(whitelistedRole, deployer)).to.be.false;
                });
                it("is not a default admin", async () => {
                    expect(await v2Token.hasRole(defaultAdminRole, deployer)).to.be.false;
                });
            });
            context("owner", () => {
                it("is an owner", async () => {
                    expect(await v2Token.owner()).to.eq(owner);
                });
                it("is whitelist manager", async () => {
                    expect(await v2Token.hasRole(whitelistManagerRole, owner)).to.be.true;
                });
                it("is not whitelisted", async () => {
                    expect(await v2Token.hasRole(whitelistedRole, owner)).to.be.false;
                });
                it("is a default admin", async () => {
                    expect(await v2Token.hasRole(defaultAdminRole, owner)).to.be.true;
                });
                it("fails to renounce the ownership", async () => {
                    await expect(v2Token.renounceOwnership({from: owner})).to.be.revertedWith(revertReason.strictOwnership);
                });
                it("fails to renounce the ownership by other accounts", async () => {
                    await expect(v2Token.renounceOwnership({from: deployer})).to.be.revertedWith(revertReason.strictOwnership);
                });
                it("fails to renounce the default manager role", async () => {
                    await expect(v2Token.renounceRole(defaultAdminRole, owner, {from: owner})).to.be.revertedWith(revertReason.strictDefaultManager);
                });
                it("can renounce the whitelist manager role", async () => {
                    const receipt = await v2Token.renounceRole(whitelistManagerRole, owner, {from: owner});
                    await expectEvent(
                        receipt, 'RoleRevoked', {role: whitelistManagerRole, account: owner, sender: owner}
                    );
                });
                it("fails to transfer the ownership to another account by a non-owner", async () => {
                    await expect(v2Token.transferOwnership(deployer, {from: randomAccount})).to.be.revertedWith(revertReason.onlyOwner);
                });
                it("can to transfer the ownership to another account by the current owner", async () => {
                    const receipt = await v2Token.transferOwnership(deployer, {from: owner});
                    await expectEvent(
                        receipt, 'OwnershipTransferred', {previousOwner: owner, newOwner: deployer}
                    );
                });
            });
            context("whitelist manager", () => {
                it("is an owner", async () => {
                    expect(await v2Token.owner()).to.not.eq(whitelistManager);
                });
                it("is not yet a whitelist manager", async () => {
                    expect(await v2Token.hasRole(whitelistManagerRole, whitelistManager)).to.be.false;
                });
                it("is not whitelisted", async () => {
                    expect(await v2Token.hasRole(whitelistedRole, whitelistManager)).to.be.false;
                });
                it("is not a default admin", async () => {
                    expect(await v2Token.hasRole(defaultAdminRole, whitelistManager)).to.be.false;
                });
            });
        });
    });

	describe("mint tokens", () => {
        context("avoid connection to swap engine and mint token", () => {
            it("fails to directly mint token by owner", async () => {
                await expect(
                    v2Token.mint(voter1, twentyTokens, {from: owner})
                ).to.be.revertedWith(revertReason.onlyEngine);
            });

            it("fails to skip the connection to upgrade engine and mint directly", async () => {
                await expect(
                    v2Token.removeUpgradeEngine(liquidityPool, {from: owner})
                ).to.be.revertedWith(revertReason.engineNotStart);
            });
        });

        context("connect to swap engine", () => {
            it("fails to connect by a non-owner", async () => {
                await expect(v2Token.connectUpgradeEngine(minter, {from: deployer})).to.be.revertedWith(revertReason.onlyOwner);
            });
            it("is connected by an owner", async () => {
                const receipt = await v2Token.connectUpgradeEngine(minter, {from: owner});
                await expectEvent(
                    receipt, 'SwapEngineConnected', {engineConnected: true, upgradeEngine: minter}
                );
            });
            context("connect swap engine by owner", () => {
                beforeEach(async () => {
                    await v2Token.connectUpgradeEngine(minter, {from: owner});
                });
                it("fails to connect the engine for more than once", async () => {
                    await expect(v2Token.connectUpgradeEngine(minter, {from: owner})).to.be.revertedWith(revertReason.engineStart);
                });
                it("has upgrade engine", async () => {
                    expect(await v2Token.upgradeEngine()).to.eq(minter);
                });
                it("has upgrade started", async () => {
                    expect(await v2Token.upgradeStarted()).to.be.true;
                });
            });
	    });

        context("mint tokens from the swap engine", () => {
            beforeEach(async () => {
                await v2Token.connectUpgradeEngine(minter, {from: owner});
            });
            it("fails to mint token by wallets other than engine", async () => {
                await expect(v2Token.mint(tokenHolder1, twentyTokens, {from: owner})).to.be.revertedWith(revertReason.onlyEngine);
            });
            it("mints token by the minter", async () => {
                const receipt = await v2Token.mint(tokenHolder1, twentyTokens, {from: minter});
                await expectEvent(
                    receipt, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder1, value: twentyTokens}
                );
            });
            it("mints zero token by the minter", async () => {
                const receipt = await v2Token.mint(tokenHolder1, '0', {from: minter});
                await expectEvent(
                    receipt, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder1, value: '0'}
                );
            });
        });
        context("disconnect the swap engine", () => {
            beforeEach(async () => {
                await v2Token.connectUpgradeEngine(minter, {from: owner});
            });
            it("cannot be closed by a non-owner ", async () => {
                await expect(v2Token.removeUpgradeEngine(liquidityPool, {from: tokenHolder1})).to.be.revertedWith(revertReason.onlyOwner);
            });
            it("can be closed by an owner", async () => {
                const receipt = await v2Token.removeUpgradeEngine(liquidityPool, {from: owner});
                await expectEvent(
                    receipt, 'SwapEngineConnected', {engineConnected: false, upgradeEngine: constants.ZERO_ADDRESS}
                );
            });
            it("cannot mint more than the cap ", async () => {
                await expect(v2Token.mint(tokenHolder1, utils.toBN(totalSupply).add(utils.toBN(oneToken)).toString(), {from: minter})).to.be.revertedWith(revertReason.capExceeded);
            });
            context("mint less than the cap and disconnect", () => {
                let receipt: any;
                beforeEach(async () => {
                    await v2Token.mint(tokenHolder1, twentyTokens, {from: minter});
                    receipt = await v2Token.removeUpgradeEngine(liquidityPool, {from: owner});
                });
                it("can be closed by an owner after engine mints some tokens", async () => {
                    await expectEvent(
                        receipt, 'SwapEngineConnected', {engineConnected: false, upgradeEngine: constants.ZERO_ADDRESS}
                    );
                });
                it("has no upgradeEngine", async () => {
                    expect(await v2Token.upgradeEngine()).to.eq(constants.ZERO_ADDRESS);
                });
                it("has upgrade started", async () => {
                    expect(await v2Token.upgradeStarted()).to.be.true;
                });
                it("fails to mint token after engine is disconnected", async () => {
                    await expect(v2Token.mint(tokenHolder1, twentyTokens, {from: owner})).to.be.revertedWith(revertReason.onlyEngine);
                });
            });
            context("mint to the cap and disconnect", () => {
                beforeEach(async () => {
                    await v2Token.mint(tokenHolder1, totalSupply, {from: minter});

                });
                it("can be closed by an owner after engine mints some tokens", async () => {
                    const receipt = await v2Token.removeUpgradeEngine(liquidityPool, {from: owner});
                    await expectEvent(
                        receipt, 'SwapEngineConnected', {engineConnected: false, upgradeEngine: constants.ZERO_ADDRESS}
                    );
                });
            });
        });
    });
    describe("transfer tokens", () => {
        beforeEach(async () => {
            await v2Token.connectUpgradeEngine(minter, {from: owner});
            await v2Token.mint(tokenHolder1, twentyTokens, {from: minter});
            await v2Token.mint(owner, twentyTokens, {from: minter});
            await v2Token.removeUpgradeEngine(liquidityPool, {from: owner});
        });
        it("can transfer tokens right afterwards", async () => {
            const receipt = await v2Token.transfer(tokenHolder2, oneToken, {from: tokenHolder1});
            await expectEvent(
                receipt, 'Transfer', {from: tokenHolder1, to: tokenHolder2, value: oneToken}
            );
        });
    });

    describe("burn tokens", () => {
        beforeEach(async () => {
            await v2Token.connectUpgradeEngine(minter, {from: owner});
            await v2Token.mint(tokenHolder1, twentyTokens, {from: minter});
            await v2Token.mint(owner, twentyTokens, {from: minter});
            await v2Token.removeUpgradeEngine(liquidityPool, {from: owner});
        });

        context("no approve is made", () => {
            it("fails to burn tokens by a non-owner", async () => {
                await expect(
                    v2Token.burn(twentyTokens, {from: tokenHolder1})
                ).to.be.revertedWith(revertReason.onlyOwner);
            });
            it("can burn tokens by an owner", async () => {
                const receipt = await v2Token.burn(oneToken, {from: owner});
                await expectEvent(
                    receipt, 'Transfer', {from: owner, to: constants.ZERO_ADDRESS, value: oneToken}
                );
            });
        });

        context("approval is made", () => {
            beforeEach(async () => {
                await v2Token.approve(owner, oneToken, {from: tokenHolder1});
                await v2Token.approve(tokenHolder2, oneToken, {from: tokenHolder1});
            });
            it("fails to burn tokens by a non-owner", async () => {
                await expect(
                    v2Token.burn(twentyTokens, {from: tokenHolder1})
                ).to.be.revertedWith(revertReason.onlyOwner);
            });
            it("fails to burn tokens by another non-owner", async () => {
                await expect(
                    v2Token.burnFrom(tokenHolder1, oneToken, {from: tokenHolder2})
                ).to.be.revertedWith(revertReason.onlyOwner);
            });
            it("can burn tokens by an owner", async () => {
                const receipt = await v2Token.burnFrom(tokenHolder1, oneToken, {from: owner});
                await expectEvent(
                    receipt, 'Transfer', {from: tokenHolder1, to: constants.ZERO_ADDRESS, value: oneToken}
                );
            });
        });
    });

    describe("whitelist", () => {
        beforeEach(async () => {
            await v2Token.grantRole(whitelistManagerRole, whitelistManager, {from: owner});
        });
        it("is whitelist manager", async () => {
            expect(await v2Token.hasRole(whitelistManagerRole, whitelistManager)).to.be.true;
        });
        it("has a whitelisted role in the contract", async () => {
            const role = await v2Token.WHITELISTED_ROLE();
            expect(await v2Token.WHITELISTED_ROLE()).to.eq(whitelistedRole);
        });
        it("can add an account to whitelist by a whitelist manager", async () => {
            const receipt = await v2Token.grantRole(whitelistedRole, voter1, {from: whitelistManager});
            await expectEvent(
                receipt, 'RoleGranted', {role: whitelistedRole, account: voter1, sender: whitelistManager}
            );
        });
        it("fails to add an account to whitelist by a non-whitelist manager", async () => {
            await expect(
                v2Token.grantRole(whitelistedRole, voter2, {from: tokenHolder1})
            ).to.be.revertedWith(revertReason.onlyRoleManager);
        });
        it("fails to add accounts to whitelist by a non-whitelist manager", async () => {
            await expect(
                v2Token.addAccountsToWhitelist([voter1, voter2], {from: tokenHolder1})
            ).to.be.revertedWith(revertReason.onlyRoleManager);
        });
        it("can add several accounts to whitelist by a whitelist manager", async () => {
            const receipt = await v2Token.addAccountsToWhitelist([voter1, voter2], {from: whitelistManager});
            await expectEvent(
                receipt, 'RoleGranted', {role: whitelistedRole, account: voter1, sender: whitelistManager}
            );
            await expectEvent(
                receipt, 'RoleGranted', {role: whitelistedRole, account: voter2, sender: whitelistManager}
            );
        });
    });
    describe("reclaim tokens", () => {
        let erc20Token: V1Token;
        const smallNumber = '1000000000';
        beforeEach(async () => {
            erc20Token = await V1TokenArtifact.new({from: owner});
            await erc20Token.mint([tokenHolder1, tokenHolder2], [smallNumber, smallNumber], {from: owner});
            await erc20Token.finishMinting({from: owner});
            await erc20Token.transfer((v2Token as any).address, smallNumber, {from: tokenHolder1});
        });
        it("balances should be 0", async () => {
            expect((await erc20Token.balanceOf(owner)).toString()).to.eq('0');
            expect((await erc20Token.balanceOf(tokenHolder1)).toString()).to.eq('0');
            expect((await erc20Token.balanceOf(tokenHolder2)).toString()).to.eq(smallNumber);
            expect((await erc20Token.balanceOf((v2Token as any).address)).toString()).to.eq(smallNumber);
        });

        // it("fails to add an account to whitelist by a non-whitelist manager", async () => {
        //     await expect(
        //         v2Token.grantRole(whitelistedRole, voter2, {from: tokenHolder1})
        //     ).to.be.revertedWith(revertReason.onlyRoleManager);
        // });
        it("can be reclaimed by the owner for a received ERC20 token", async () => {
            const receipt = await v2Token.reclaimToken((erc20Token as any).address, {from: owner});
            await expectEvent(
                receipt, 'Transfer', {from: (v2Token as any).address, to: owner, value: smallNumber}
            );
        });
        it("can be reclaimed by the owner for the new token", async () => {
            const receipt = await v2Token.reclaimToken((v2Token as any).address, {from: owner});
            await expectEvent(
                receipt, 'Transfer', {from: (v2Token as any).address, to: owner, value: '0'}
            );
        });
    });
});


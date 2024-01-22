import { artifacts, web3 } from "@nomiclabs/buidler";
import Web3 from "web3";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import BN from "bn.js"
import { V1TokenInstance as V1Token, TokenInstance as V2Token, SwapEngineInstance as SwapEngine } from "../typechain";
import revertReason from "../tools/test/revert-reason.json";
import {
	constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events,
    expectRevert
  } from "@openzeppelin/test-helpers";

chai.use(solidity).use(require('chai-bn')(BN));

const { expect } = chai;
const { utils } = Web3;

const V1TokenArtifact = artifacts.require("V1Token");
const V2TokenArtifact = artifacts.require("V2Token");
const SwapEngineArtifact = artifacts.require("SwapEngine");

const twentyTokensIn8Dec = (20*10**8).toString();
const oneTokenIn8Dec = (10**8).toString();
const twentyTokensIn18Dec = utils.toWei("20");
const oneTokenIn18Dec = utils.toWei("1");
const conversionRate = (10**10).toString();
const maxAllowance = (370000000*10**8).toString(); //  370 million tokens of 18 decimal

describe("SwapEngine", () => {
    let accounts: string[];
    let deployer: string;
    let v1TokenOwner: string;
    let v2TokenOwner: string;
    let engineOwner: string;
    let tokenHolder1: string;
    let tokenHolder2: string;
    let randomAccount: string;
    let v1Token: V1Token;
    let v1TokenAddress: string;
    let v2Token: V2Token;
    let v2TokenAddress: string;
    let swapEngine: SwapEngine;
    let swapEngineAddress: string;

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        [
            deployer,
            v1TokenOwner,
            v2TokenOwner,
            engineOwner,
            tokenHolder1,
            tokenHolder2,
            randomAccount,
        ] = accounts;
        v1Token = await V1TokenArtifact.new({from: v1TokenOwner});
        v2Token = await V2TokenArtifact.new(v2TokenOwner);
        v1TokenAddress = (v1Token as any).address;
        v2TokenAddress = (v2Token as any).address;
        swapEngine = await SwapEngineArtifact.new(engineOwner, v1TokenAddress, v2TokenAddress);
        swapEngineAddress = (swapEngine as any).address;
        await v1Token.mint([tokenHolder1, tokenHolder2], [twentyTokensIn8Dec, twentyTokensIn8Dec], {from: v1TokenOwner});
        await v1Token.finishMinting({from: v1TokenOwner});
    });

    describe("validate fresh instantiated state", () => {
        it("should have old token address", async () => {
            const oldToken = await swapEngine.oldToken();
            expect(oldToken).to.eq(v1TokenAddress);
        });
        it("should have new token address", async () => {
            const newToken = await swapEngine.newToken();
            expect(newToken).to.eq(v2TokenAddress);
        });
        it("should have the proper conversionRate", async () => {
            const conversion = await swapEngine.conversionRate();
            expect(conversion.toString()).to.eq(conversionRate);
        });
        it("has an owner", async () => {
            expect(await swapEngine.owner()).to.eq(engineOwner);
        });
        it("does not have deployer as an owner", async () => {
            expect(await swapEngine.owner()).to.not.eq(deployer);
        });
        it("fails to renounce the ownership", async () => {
            await expect(swapEngine.renounceOwnership({from: engineOwner})).to.be.revertedWith(revertReason.strictOwnership);
        });
        it("should have the right balance", async () => {
            expect((await v1Token.balanceOf(tokenHolder1)).toString()).to.eq('2000000000');
            expect((await v1Token.balanceOf(tokenHolder2)).toString()).to.eq('2000000000');
        });
    });
    describe("swap tokens", () => {
        context("swapToken", () => {
            context("without correct balance and approval", () => {
                context("when the engine is not registered with the v2 token", () => {
                    it("fails to swap for a non-token-holder", async () => {
                        await expect(
                            swapEngine.swapToken('0', {from: randomAccount})
                        ).to.be.revertedWith(revertReason.noTokenToSwap);
                    });
                    it("fails to swap for a non-token-holder for a non-zero value", async () => {
                        await expect(
                            swapEngine.swapToken(oneTokenIn8Dec, {from: randomAccount})
                        ).to.be.revertedWith(revertReason.noTokenToSwap);
                    });
                    it("fails to swap for a token holder without approval", async () => {
                        await expect(
                            swapEngine.swapToken(oneTokenIn8Dec, {from: tokenHolder1})
                        ).to.be.revertedWith(revertReason.swapExceedAllowance);
                    });
                });
                context("when the engine is registered with the v2 token", () => {
                    beforeEach(async () => {
                        await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
                    });
                    it("swaps for a non-token-holder, for zero token", async () => {
                        await expect(
                            swapEngine.swapToken('0', {from: randomAccount})
                        ).to.be.revertedWith(revertReason.noTokenToSwap);
                    });
                    it("fails to swap for a non-token-holder for a non-zero value", async () => {
                        await expect(
                            swapEngine.swapToken(oneTokenIn8Dec, {from: randomAccount})
                        ).to.be.revertedWith(revertReason.noTokenToSwap);
                    });
                    it("fails to swap for a token holder for tokens more than it holds", async () => {
                        await expect(
                            swapEngine.swapToken(oneTokenIn18Dec, {from: tokenHolder1})
                        ).to.be.revertedWith(revertReason.swapExceedBalance);
                    });
                    it("fails to swap for a token holder without approval", async () => {
                        await expect(
                            swapEngine.swapToken(oneTokenIn8Dec, {from: tokenHolder1})
                        ).to.be.revertedWith(revertReason.swapExceedAllowance);
                    });
                });
            });
            context("with correct balance and approval", () => {
                beforeEach(async () => {
                    await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder1});
                });
                it("should have the right allowance", async () => {
                    expect((await v1Token.allowance(tokenHolder1, swapEngineAddress)).toString()).to.eq('2000000000');
                });
                context("when the engine is not registered with the v2 token", () => {
                    it("fails ", async () => {
                        await expect(
                            swapEngine.swapToken(oneTokenIn8Dec, {from: tokenHolder1})
                        ).to.be.revertedWith(revertReason.onlyEngine);
                    });
                });
                context("when the engine is registered with the v2 token", () => {
                    beforeEach(async () => {
                        await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
                    });
                    it("swaps", async () => {
                        const receipt = await swapEngine.swapToken(oneTokenIn8Dec, {from: tokenHolder1});
                        await expectEvent(
                            receipt, 'TokenSwapped', {holder: tokenHolder1, caller: tokenHolder1, oldTokenAmount: oneTokenIn8Dec}
                        );
                        await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder1, value: oneTokenIn18Dec});
                        expect((await v2Token.balanceOf(tokenHolder1)).toString()).to.eq(oneTokenIn18Dec);
                    });
                });
            });
        });
        context("swapAllToken", () => {
            it("fails to swap for a non-token-holder", async () => {
                await expect(
                    swapEngine.swapAllToken(randomAccount, {from: engineOwner})
                ).to.be.revertedWith(revertReason.noTokenToSwap);
            });
            it("fails to swap for a token holder without approval", async () => {
                await expect(
                    swapEngine.swapAllToken(tokenHolder1, {from: engineOwner})
                ).to.be.revertedWith(revertReason.swapExceedAllowance);
            });
            it("fails to swap for a token holder by non-owner", async () => {
                await expect(
                    swapEngine.swapAllToken(tokenHolder1, {from: tokenHolder2})
                ).to.be.revertedWith(revertReason.tokenHolderOrOwner);
            });
            context("with correct balance and approval", () => {
                beforeEach(async () => {
                    await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder1});
                });
                it("should have the right allowance", async () => {
                    expect((await v1Token.allowance(tokenHolder1, swapEngineAddress)).toString()).to.eq('2000000000');
                });
                context("when the engine is not registered with the v2 token", () => {
                    it("fails", async () => {
                        await expect(
                            swapEngine.swapAllToken(tokenHolder1, {from: engineOwner})
                        ).to.be.revertedWith(revertReason.onlyEngine);
                    });
                });
                context("when the engine is registered with the v2 token", () => {
                    beforeEach(async () => {
                        await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
                    });
                    it("swaps with owner", async () => {
                        const receipt = await swapEngine.swapAllToken(tokenHolder1, {from: engineOwner});
                        await expectEvent(
                            receipt, 'TokenSwapped', {holder: tokenHolder1, caller: engineOwner, oldTokenAmount: twentyTokensIn8Dec}
                        );
                        await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder1, value: twentyTokensIn18Dec});
                        expect((await v2Token.balanceOf(tokenHolder1)).toString()).to.eq(twentyTokensIn18Dec);
                    });
                    it("swaps with tokenHolder", async () => {
                        const receipt = await swapEngine.swapAllToken(tokenHolder1, {from: tokenHolder1});
                        await expectEvent(
                            receipt, 'TokenSwapped', {holder: tokenHolder1, caller: tokenHolder1, oldTokenAmount: twentyTokensIn8Dec}
                        );
                        await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder1, value: twentyTokensIn18Dec});
                        expect((await v2Token.balanceOf(tokenHolder1)).toString()).to.eq(twentyTokensIn18Dec);
                    });
                });
            });
            context("with correct balance and half of the approval", () => {
                const tenTokensIn8Dec = '1000000000';
                beforeEach(async () => {
                    await v1Token.approve(swapEngineAddress, tenTokensIn8Dec, {from: tokenHolder1});
                    await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
                });
                it("should have the right allowance", async () => {
                    expect((await v1Token.allowance(tokenHolder1, swapEngineAddress)).toString()).to.eq(tenTokensIn8Dec);
                });
                it("fails with owner", async () => {
                    await expect(
                        swapEngine.swapAllToken(tokenHolder1, {from: engineOwner})
                    ).to.be.revertedWith(revertReason.swapExceedAllowance);
                });
                it("fails with token holder", async () => {
                    await expect(
                        swapEngine.swapAllToken(tokenHolder1, {from: tokenHolder1})
                    ).to.be.revertedWith(revertReason.swapExceedAllowance);
                });
            });
        });
        context("centrally managed by the engine owner in batch", () => {
            beforeEach(async () => {
                await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
            });
            context("with correct balance and approval", () => {
                beforeEach(async () => {
                    await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder1});
                    await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder2});
                });
                it("should have the right allowance", async () => {
                    expect((await v1Token.allowance(tokenHolder1, swapEngineAddress)).toString()).to.eq(twentyTokensIn8Dec);
                    expect((await v1Token.allowance(tokenHolder2, swapEngineAddress)).toString()).to.eq(twentyTokensIn8Dec);
                });
                it("swaps", async () => {
                    const receipt = await swapEngine.swapAllTokenInBatch([tokenHolder1, tokenHolder2], {from: engineOwner});
                    await expectEvent(
                        receipt, 'TokenSwapped', {holder: tokenHolder1, caller: engineOwner, oldTokenAmount: twentyTokensIn8Dec}
                    );
                    await expectEvent(
                        receipt, 'TokenSwapped', {holder: tokenHolder2, caller: engineOwner, oldTokenAmount: twentyTokensIn8Dec}
                    );
                    await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder1, value: twentyTokensIn18Dec});
                    await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder2, value: twentyTokensIn18Dec});
                    expect((await v2Token.balanceOf(tokenHolder1)).toString()).to.eq(twentyTokensIn18Dec);
                    expect((await v2Token.balanceOf(tokenHolder2)).toString()).to.eq(twentyTokensIn18Dec);
                });
            });
            context("with correct balance and half of the approval", () => {
                const tenTokensIn8Dec = '1000000000';
                beforeEach(async () => {
                    await v1Token.approve(swapEngineAddress, tenTokensIn8Dec, {from: tokenHolder1});
                    await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder2});
                });
                it("should have the right allowance", async () => {
                    expect((await v1Token.allowance(tokenHolder1, swapEngineAddress)).toString()).to.eq(tenTokensIn8Dec);
                    expect((await v1Token.allowance(tokenHolder2, swapEngineAddress)).toString()).to.eq(twentyTokensIn8Dec);
                });
                it("fails", async () => {
                    await expect(
                        swapEngine.swapAllTokenInBatch([tokenHolder1, tokenHolder2], {from: engineOwner})
                    ).to.be.revertedWith(revertReason.swapExceedAllowance);
                });
            });
            context("with zero balance and correct approval", () => {
                beforeEach(async () => {
                    await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder2});
                });
                it("should have the right allowance", async () => {
                    expect((await v1Token.allowance(randomAccount, swapEngineAddress)).toString()).to.eq('0');
                    expect((await v1Token.allowance(tokenHolder2, swapEngineAddress)).toString()).to.eq(twentyTokensIn8Dec);
                });
                it("swaps even for wallets without old tokens", async () => {
                    const receipt = await swapEngine.swapAllTokenInBatch([randomAccount, tokenHolder2, deployer], {from: engineOwner});
                    await expectEvent(
                        receipt, 'TokenSwapped', {holder: tokenHolder2, caller: engineOwner, oldTokenAmount: twentyTokensIn8Dec}
                    );
                    await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: constants.ZERO_ADDRESS, to: tokenHolder2, value: twentyTokensIn18Dec});
                    expect((await v2Token.balanceOf(randomAccount)).toString()).to.eq('0');
                    expect((await v2Token.balanceOf(tokenHolder2)).toString()).to.eq(twentyTokensIn18Dec);
                    expect((await v2Token.balanceOf(deployer)).toString()).to.eq('0');
                });
            });
        });
        context("Not a tokenholder", () => {
            beforeEach(async () => {
                await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
                expect((await v1Token.balanceOf(randomAccount)).toString()).to.eq('0');
                expect((await v1Token.allowance(randomAccount, swapEngineAddress)).toString()).to.eq('0');
                await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder1});
            });
            it("swaps for a non-token-holder with swapToken", async () => {
                await expect(
                    swapEngine.swapToken('0', {from: randomAccount})
                ).to.be.revertedWith(revertReason.noTokenToSwap);
            });
            it("swaps for a non-token-holder with swapAllToken", async () => {
                await expect(
                    swapEngine.swapAllToken(randomAccount, {from: engineOwner})
                ).to.be.revertedWith(revertReason.noTokenToSwap);
            });
            it("swaps for a non-token-holder with swapAllTokenInBatch", async () => {
                const receipt = await swapEngine.swapAllTokenInBatch([randomAccount], {from: engineOwner});
                expect((await v2Token.balanceOf(randomAccount)).toString()).to.eq('0');
            });
            it("swaps even for wallets without old tokens", async () => {
                const receipt = await swapEngine.swapAllTokenInBatch([randomAccount, deployer], {from: engineOwner});
                expect((await v2Token.balanceOf(randomAccount)).toString()).to.eq('0');
                expect((await v2Token.balanceOf(deployer)).toString()).to.eq('0');
            });
        });
    });
    describe("reclaim tokens", () => {
        beforeEach(async () => {
                await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
                await v1Token.approve(swapEngineAddress, twentyTokensIn8Dec, {from: tokenHolder1});
                await swapEngine.swapAllTokenInBatch([randomAccount, tokenHolder1], {from: engineOwner});
            });
            it("getAllowedBalance for v1 token should be 0", async () => {
                expect((await swapEngine.getAllowedBalance(v1TokenAddress)).toString()).to.eq(twentyTokensIn8Dec);
            });
            it("getAllowedBalance for v2 token should be 0", async () => {
                expect((await swapEngine.getAllowedBalance(v2TokenAddress)).toString()).to.eq('0');
            });
        context("nothing to reclaim", () => {
            let receipt: any;
            beforeEach(async () => {
                receipt = await swapEngine.reclaimToken(v2TokenAddress, {from: engineOwner});
            });
            it("claim zero token emits one transfer event", async () => {
                await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: swapEngineAddress, to: engineOwner, value: '0'});
            });
        });
        context("one token to reclaim", () => {
            beforeEach(async () => {
                await v2Token.transfer(swapEngineAddress, oneTokenIn18Dec, {from: tokenHolder1});
            });
            it("getAllowedBalance for v2 token should be 0", async () => {
                expect((await swapEngine.getAllowedBalance(v2TokenAddress)).toString()).to.eq('0');
            });
            context("one token to reclaim", () => {
                let receipt: any;
                beforeEach(async () => {
                    receipt = await swapEngine.reclaimToken(v2TokenAddress, {from: engineOwner});
                });
                it("emits an event", async () => {
                    await expectEvent.inTransaction(receipt.tx, v2Token, 'Transfer', {from: swapEngineAddress, to: engineOwner, value: oneTokenIn18Dec});
                });
                it("getAllowedBalance for v2 token should be 0, after reclaim", async () => {
                    expect((await swapEngine.getAllowedBalance(v2TokenAddress)).toString()).to.eq('0');
                });
            });
        });
    });
    // describe("test max per batch", () => {
    //     beforeEach(async () => {
    //         v1Token = await V1TokenArtifact.new({from: v1TokenOwner});
    //         v2Token = await V2TokenArtifact.new(v2TokenOwner);
    //         v1TokenAddress = (v1Token as any).address;
    //         v2TokenAddress = (v2Token as any).address;
    //         swapEngine = await SwapEngineArtifact.new(engineOwner, v1TokenAddress, v2TokenAddress);
    //         swapEngineAddress = (swapEngine as any).address;
    //         await Promise.all(TWO_HUNDRED_ACCOUNTS.map(async (account) => {
    //             await v1Token.mint([account], [oneTokenIn8Dec], {from: v1TokenOwner});
    //             return v1Token.increaseAllowanceForTest([account], swapEngineAddress, {from: v1TokenOwner});
    //         }));
    //         await v1Token.finishMinting({from: v1TokenOwner});
    //         await v2Token.connectUpgradeEngine(swapEngineAddress, {from: v2TokenOwner});
    //     });
    //     it("has the right balance", async () => {
    //         expect((await v1Token.balanceOf(TWO_HUNDRED_ACCOUNTS[1])).toString()).to.eq(oneTokenIn8Dec);
    //     });
    //     it("has the right allowance", async () => {
    //         expect((await v1Token.allowance(TWO_HUNDRED_ACCOUNTS[1], swapEngineAddress)).toString()).to.eq(maxAllowance);
    //     });
    //     it("can be swapped in batch: 1 account", async () => {
    //         const batch = TWO_HUNDRED_ACCOUNTS.slice(0,99);
    //         const receipt = await swapEngine.swapAllTokenInBatch([TWO_HUNDRED_ACCOUNTS[0]], {from: engineOwner});
    //         console.log("cumulativeGasUsed", receipt.receipt.cumulativeGasUsed);
    //         await expectEvent(
    //             receipt, 'TokenSwapped', {holder: TWO_HUNDRED_ACCOUNTS[0], caller: engineOwner, oldTokenAmount: oneTokenIn8Dec}
    //         );
    //     });
    //     it("can be swapped in batch: 10 accounts", async () => {
    //         const batch = TWO_HUNDRED_ACCOUNTS.slice(0,10);
    //         const receipt = await swapEngine.swapAllTokenInBatch(batch, {from: engineOwner});
    //         console.log("cumulativeGasUsed", receipt.receipt.cumulativeGasUsed);
    //         await expectEvent(
    //             receipt, 'TokenSwapped', {holder: TWO_HUNDRED_ACCOUNTS[0], caller: engineOwner, oldTokenAmount: oneTokenIn8Dec}
    //         );
    //     });
    //     it("can be swapped in batch: 20 accounts", async () => {
    //         const batch = TWO_HUNDRED_ACCOUNTS.slice(0,20);
    //         const receipt = await swapEngine.swapAllTokenInBatch(batch, {from: engineOwner, gas: '8000000'});
    //         console.log("cumulativeGasUsed", receipt.receipt.cumulativeGasUsed);
    //         await expectEvent(
    //             receipt, 'TokenSwapped', {holder: TWO_HUNDRED_ACCOUNTS[0], caller: engineOwner, oldTokenAmount: oneTokenIn8Dec}
    //         );
    //     });
    //     it("can be swapped in batch: 40 accounts", async () => {
    //         const batch = TWO_HUNDRED_ACCOUNTS.slice(0,40);
    //         const receipt = await swapEngine.swapAllTokenInBatch(batch, {from: engineOwner, gas: '8000000'});
    //         console.log("cumulativeGasUsed", receipt.receipt.cumulativeGasUsed);
    //         await expectEvent(
    //             receipt, 'TokenSwapped', {holder: TWO_HUNDRED_ACCOUNTS[0], caller: engineOwner, oldTokenAmount: oneTokenIn8Dec}
    //         );
    //     });
    //     it("can be swapped in batch: 60 accounts", async () => {
    //         const batch = TWO_HUNDRED_ACCOUNTS.slice(0,60);
    //         const receipt = await swapEngine.swapAllTokenInBatch(batch, {from: engineOwner, gas: '8000000'});
    //         console.log("cumulativeGasUsed", receipt.receipt.cumulativeGasUsed);
    //         await expectEvent(
    //             receipt, 'TokenSwapped', {holder: TWO_HUNDRED_ACCOUNTS[0], caller: engineOwner, oldTokenAmount: oneTokenIn8Dec}
    //         );
    //     });
    //     it("cannot be swapped in batch: 61 accounts - out of gas", async () => {
    //         const batch = TWO_HUNDRED_ACCOUNTS.slice(0,61);
    //         await expectRevert(
    //             swapEngine.swapAllTokenInBatch(batch, {from: engineOwner}),
    //             'Transaction reverted without a reason'
    //         );
    //     });
    // });
});


"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_configuration_json_1 = __importDefault(require("./test_configuration.json"));
const api_1 = require("@polkadot/api");
const polkadotjs_1 = require("@composable/utils/polkadotjs");
const connectionHelper_1 = require("@composable/utils/connectionHelper");
const walletHelper_1 = require("@composable/utils/walletHelper");
const mintingHelper_1 = require("@composable/utils/mintingHelper");
const chai_1 = require("chai");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Contains tests for the XCMP system.
 *
 * 1. Transferring funds from 'RelayChain (KSM)' to Picasso/Dali
 * 2. The other way around with KSM.
 * 3. Again from Picasso/Dali to RelayChain with PICA.
 */
describe("tx.xcmp Tests", function () {
    if (!test_configuration_json_1.default.enabledTests.enabled)
        return;
    let api;
    let walletAlice;
    let relayChainApiClient;
    let assetId;
    let ksmAssetID;
    before(async function () {
        this.timeout(60 * 1000);
        // `getNewConnection()` establishes a new connection to the chain and gives us the ApiPromise & a Keyring.
        const { newClient, newKeyring } = await (0, connectionHelper_1.getNewConnection)();
        api = newClient;
        // Using `getDevWallets(Keyring)` we're able to get a dict of all developer wallets.
        const { devWalletAlice } = (0, walletHelper_1.getDevWallets)(newKeyring);
        walletAlice = devWalletAlice;
        const relayChainEndpoint = "ws://" + (process.env.ENDPOINT_RELAYCHAIN ?? "127.0.0.1:9944");
        const relayChainProvider = new api_1.WsProvider(relayChainEndpoint);
        relayChainApiClient = await api_1.ApiPromise.create({
            provider: relayChainProvider,
            types: {
                XcmV2TraitsOutcome: {
                    _enum: {
                        Error: "Null",
                        Complete: "u128",
                        isError: "bool",
                        isComplete: "bool"
                    }
                }
            }
        });
        assetId = 4;
        ksmAssetID = api.createType("SafeRpcWrapper", assetId);
    });
    before("Providing assets for tests", async function () {
        this.timeout(2 * 60 * 1000);
        await (0, mintingHelper_1.mintAssetsToWallet)(api, walletAlice, walletAlice, [1]);
    });
    after(async function () {
        await relayChainApiClient.disconnect();
        await api.disconnect();
    });
    /**
     * xcmPallet.reserveTransferAssets transfers an asset from parachain (Picasso) to a relayChain,
     * in this case the `Rococo Testnet`.
     *
     * Sudo command success is checked with `.isOk`.
     */
    describe("xcmPallet.reserveTransferAssets Success Test", function () {
        if (!test_configuration_json_1.default.enabledTests.addAssetAndInfo__success.enabled)
            return;
        // Timeout set to 2 minutes
        this.timeout(10 * 60 * 1000);
        it("Can transfer asset(kUSD) from relay chain(KSM) to Picasso", async function () {
            if (!test_configuration_json_1.default.enabledTests.addAssetAndInfo__success.add1)
                this.skip();
            // Setting the destination chain to Picasso/Dali
            const destination = relayChainApiClient.createType("XcmVersionedMultiLocation", {
                V0: relayChainApiClient.createType("XcmV0MultiLocation", {
                    X1: relayChainApiClient.createType("XcmV0Junction", {
                        Parachain: relayChainApiClient.createType("Compact<u32>", 2000)
                    })
                })
            });
            // Setting the wallet receiving the funds
            const beneficiary = relayChainApiClient.createType("XcmVersionedMultiLocation", {
                V0: relayChainApiClient.createType("XcmV0MultiLocation", {
                    X1: relayChainApiClient.createType("XcmV0Junction", {
                        AccountId32: {
                            network: relayChainApiClient.createType("XcmV0JunctionNetworkId", "Any"),
                            id: walletAlice.publicKey
                        }
                    })
                })
            });
            const paraAmount = relayChainApiClient.createType("Compact<u128>", "100000000000000");
            // Setting up the asset & amount
            const assets = relayChainApiClient.createType("XcmVersionedMultiAssets", {
                V0: [
                    relayChainApiClient.createType("XcmV0MultiAsset", {
                        ConcreteFungible: {
                            id: relayChainApiClient.createType("XcmV0MultiLocation", "Null"),
                            amount: paraAmount
                        }
                    })
                ]
            });
            // Setting the asset which will be used for fees (0 refers to first in asset list)
            const feeAssetItem = relayChainApiClient.createType("u32", 0);
            // Getting Alice wallet balance before transaction.
            const walletBalanceAliceBeforeTransaction = await relayChainApiClient.query.system.account(walletAlice.publicKey);
            // Getting beneficiary wallet amount before transaction.
            const beneficiaryBalanceBeforeTransaction = new bn_js_1.default((await api.rpc.assets.balanceOf(ksmAssetID, walletAlice.publicKey)).toString());
            // Making the transaction
            const { data: [result] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(relayChainApiClient, walletAlice, relayChainApiClient.events.xcmPallet.Attempted.is, relayChainApiClient.tx.xcmPallet.reserveTransferAssets(destination, beneficiary, assets, feeAssetItem));
            await (0, polkadotjs_1.waitForBlocks)(api, 5);
            // Verifying Stuff
            const convertedResult = relayChainApiClient.createType("XcmV2TraitsOutcome", result);
            (0, chai_1.expect)(convertedResult.isComplete).to.be.true;
            (0, chai_1.expect)(convertedResult.isError).to.be.false;
            // Getting Alice wallet balance after transaction.
            const walletBalanceAliceAfterTransaction = await relayChainApiClient.query.system.account(walletAlice.publicKey);
            (0, chai_1.expect)(new bn_js_1.default(walletBalanceAliceAfterTransaction.data.free)).to.be.bignumber.lessThan(new bn_js_1.default(walletBalanceAliceBeforeTransaction.data.free));
            // Beneficiary Wallet after transaction.
            const beneficiaryBalanceAfterTransaction = new bn_js_1.default((await api.rpc.assets.balanceOf(ksmAssetID, walletAlice.publicKey)).toString());
            (0, chai_1.expect)(beneficiaryBalanceAfterTransaction).to.be.bignumber.greaterThan(beneficiaryBalanceBeforeTransaction);
        });
    });
    /**
     * Transfers an asset from RelayChain (Rococo Testnet) to Picasso/Dali.
     */
    describe("xTokens.transfer Success Test", function () {
        // update name in test_configuration. Ask Dom
        if (!test_configuration_json_1.default.enabledTests.addAssetAndInfo__success.enabled)
            return;
        // Timeout set to 2 minutes
        this.timeout(10 * 60 * 1000);
        it("Can transfer KSM from Picasso to relay chain", async function () {
            // update name in test_configuration. Ask Dom
            if (!test_configuration_json_1.default.enabledTests.addAssetAndInfo__success.add1)
                this.skip();
            //Set amount to transfer
            const amountToTransfer = relayChainApiClient.createType("u128", 10000000000000);
            //Set destination. Should have 2 Junctions, first to parent and then to wallet
            const destination = api.createType("XcmVersionedMultiLocation", {
                V0: api.createType("XcmV0MultiLocation", {
                    X2: [
                        api.createType("XcmV0Junction", "Parent"),
                        api.createType("XcmV0Junction", {
                            AccountId32: {
                                network: api.createType("XcmV0JunctionNetworkId", "Any"),
                                id: walletAlice.publicKey
                            }
                        })
                    ]
                })
            });
            // Set dest weight
            const destWeight = relayChainApiClient.createType("u64", 4000000000); // > 4000000000
            const transactorWalletBalanceBeforeTransaction = new bn_js_1.default((await api.rpc.assets.balanceOf(ksmAssetID, walletAlice.publicKey)).toString());
            const walletBalanceAliceBeforeTransaction = await relayChainApiClient.query.system.account(walletAlice.publicKey);
            //This tx pass on the parachain but encounter an error on relay. Barrier
            const { data: [resultTransactorAccountId, resultsAssetsList, resultMultiAsset, resultMultiLocation] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, walletAlice, api.events.xTokens.TransferredMultiAssets.is, api.tx.xTokens.transfer(ksmAssetID, amountToTransfer, destination, destWeight));
            await (0, polkadotjs_1.waitForBlocks)(api, 5);
            // Verifying Stuff
            const transactorWalletBalanceAfterTransaction = new bn_js_1.default((await api.rpc.assets.balanceOf(ksmAssetID, walletAlice.publicKey)).toString());
            const walletBalanceAliceAfterTransaction = await relayChainApiClient.query.system.account(walletAlice.publicKey);
            (0, chai_1.expect)(new bn_js_1.default(walletBalanceAliceAfterTransaction.data.free))
                .to.be.bignumber.lessThan(new bn_js_1.default(walletBalanceAliceBeforeTransaction.data.free).add(amountToTransfer))
                .to.be.bignumber.greaterThan(new bn_js_1.default(walletBalanceAliceBeforeTransaction.data.free));
            (0, chai_1.expect)(resultMultiLocation).to.not.be.an("Error");
            (0, chai_1.expect)(resultTransactorAccountId).to.not.be.an("Error");
            (0, chai_1.expect)(resultsAssetsList).to.not.be.an("Error");
            (0, chai_1.expect)(resultMultiAsset).to.not.be.an("Error");
            (0, chai_1.expect)(transactorWalletBalanceAfterTransaction).to.be.bignumber.lessThan(transactorWalletBalanceBeforeTransaction);
        });
    });
});
//# sourceMappingURL=transfers.js.map
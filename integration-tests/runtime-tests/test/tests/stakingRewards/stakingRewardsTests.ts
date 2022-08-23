import { expect } from "chai";
import { ApiPromise } from "@polkadot/api";
import testConfiguration from "./test_configuration.json";
import { KeyringPair } from "@polkadot/keyring/types";
import { getNewConnection } from "@composable/utils/connectionHelper";
import { getDevWallets } from "@composable/utils/walletHelper";
import { sendAndWaitForSuccess, waitForBlocks } from "@composable/utils/polkadotjs";
import { ComposableTraitsStakingStake } from "@composable/types/interfaces";
import { Option, u128 } from "@polkadot/types-codec";
import BN from "bn.js";
import { before } from "mocha";
import { mintAssetsToWallet } from "@composable/utils/mintingHelper";

/**
 * Staking Rewards Pallet Tests
 */
describe.only("tx.stakingRewards Tests", function () {
  if (!testConfiguration.enabledTests.query.enabled) return;

  let api: ApiPromise;
  let sudoKey: KeyringPair, walletStaker: KeyringPair, walletStaker2: KeyringPair, walletOwner: KeyringPair;
  let poolId: number, positionStaker1Id: u128, positionStaker2Id: u128;
  let amountAfterStake: BN;

  let stakeAmountAfterExtending: BN;

  const STAKE_AMOUNT = 100_000_000_000;
  const UNLOCK_PENALTY = 1000000000;

  before("Setting up the tests", async function () {
    this.timeout(60 * 1000);
    const { newClient, newKeyring } = await getNewConnection();
    api = newClient;
    const { devWalletAlice, devWalletBob, devWalletEve } = getDevWallets(newKeyring);
    sudoKey = devWalletAlice;
    walletStaker = devWalletBob.derive("/test/staking-rewards/staker");
    walletStaker2 = devWalletBob.derive("/test/staking-rewards/staker2");
    walletOwner = devWalletEve.derive("/test/staking-rewards/owner");
  });

  before("Providing funds", async function () {
    this.timeout(5 * 60 * 1000);
    await mintAssetsToWallet(api, walletStaker, sudoKey, [1]);
    await mintAssetsToWallet(api, walletStaker2, sudoKey, [1]);
    await mintAssetsToWallet(api, walletOwner, sudoKey, [1, 4]);
  });

  after("Closing the connection", async function () {
    await api.disconnect();
  });

  describe("tx.stakingRewards.createRewardPool Tests", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("Sudo can create a new staking reward pool", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);

      const poolCountBefore = await api.query.stakingRewards.rewardPoolCount();
      const currentBlockNumber = await api.query.system.number();

      const poolConfig = api.createType("ComposableTraitsStakingRewardPoolConfiguration", {
        RewardRateBasedIncentive: {
          owner: walletOwner.publicKey,
          assetId: api.createType("u128", 1),
          endBlock: api.createType("u32", currentBlockNumber.addn(16)),
          rewardConfigs: api.createType("BTreeMap<u128, ComposableTraitsStakingRewardConfig>", {
            "1": {
              assetId: "4",
              maxRewards: "100000000000000000",
              rewardRate: {
                period: {
                  PerSecond: "100000"
                },
                amount: "1000000000000000"
              }
            }
          }),
          lock: {
            durationPresets: {
              "2592000": "1000000000"
            },
            unlockPenalty: UNLOCK_PENALTY
          }
        }
      });
      const {
        data: [result]
      } = await sendAndWaitForSuccess(
        api,
        sudoKey,
        api.events.sudo.Sudid.is,
        api.tx.sudo.sudo(api.tx.stakingRewards.createRewardPool(poolConfig))
      );
      expect(result.isOk).to.be.true;
      const poolCountAfter = await api.query.stakingRewards.rewardPoolCount();
      expect(poolCountAfter).to.be.bignumber.equal(poolCountBefore.addn(1));
      poolId = poolCountAfter.toNumber();
      const poolInfo = await api.query.stakingRewards.rewardPools(poolId);
      expect(poolInfo.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletOwner.publicKey).toString()
      );
      expect(poolInfo.unwrap().assetId.toString()).to.equal("1");
    });
  });

  describe("tx.stakingRewards.updateRewardsPool", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("Pool owner can update pool configuration", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const poolInfoBefore = await api.query.stakingRewards.rewardPools(poolId);
      console.debug(poolInfoBefore.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]);
      const rewardUpdates = api.createType("BTreeMap<u128, ComposableTraitsStakingRewardUpdate>", {
        "1": {
          rewardRate: {
            period: {
              PerSecond: "50000"
            },
            amount: "4000000000000000"
          }
        }
      });
      const {
        data: [result]
      } = await sendAndWaitForSuccess(
        api,
        sudoKey,
        api.events.sudo.Sudid.is,
        api.tx.sudo.sudo(api.tx.stakingRewards.updateRewardsPool(poolId, rewardUpdates))
      );
      expect(result.isOk).to.be.true;
      const poolInfo = await api.query.stakingRewards.rewardPools(poolId);
      expect(poolInfo.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletOwner.publicKey).toString()
      );
      expect(poolInfo.unwrap().assetId.toString()).to.equal("1");
      console.debug(poolInfo.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]);
      // ToDo (D.Roth): Change comparison to amount from above.
      expect(poolInfo.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]).to.be.greaterThan(
        poolInfoBefore.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]
      );
      //console.debug(poolInfo.unwrap().rewards.)
    });
  });

  describe("tx.stakingRewards.stake Tests", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("Users can stake in the newly created reward pool", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const userFundsBefore = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      const durationPreset = 2592000;
      const {
        data: [resultPoolId, resultAccountId, resultAmount, resultDurationPreset, resultPositionId, resultBool]
      } = await sendAndWaitForSuccess(
        api,
        walletStaker,
        api.events.stakingRewards.Staked.is,
        api.tx.stakingRewards.stake(poolId, STAKE_AMOUNT, durationPreset)
      );
      expect(resultPoolId.toNumber()).to.equal(poolId);
      expect(resultAccountId.toString()).to.equal(api.createType("AccountId32", walletStaker.publicKey).toString());
      expect(resultAmount.toString()).to.equal(STAKE_AMOUNT.toString());
      expect(resultDurationPreset.toString()).to.equal(durationPreset.toString());
      positionStaker1Id = resultPositionId;
      expect(resultBool.isTrue).to.be.true;

      const stakeInfoAfter = <Option<ComposableTraitsStakingStake>>(
        await api.query.stakingRewards.stakes(positionStaker1Id)
      );
      expect(stakeInfoAfter.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletStaker.publicKey).toString()
      );
      expect(stakeInfoAfter.unwrap().rewardPoolId.toNumber()).to.equal(poolId);
      expect(stakeInfoAfter.unwrap().stake).to.be.bignumber.equal(new BN(STAKE_AMOUNT));
      amountAfterStake = stakeInfoAfter.unwrap().stake;
      expect(stakeInfoAfter.unwrap().share).to.be.bignumber.equal(new BN(STAKE_AMOUNT));
      expect(stakeInfoAfter.unwrap().lock.unlockPenalty).to.be.bignumber.equal(new BN(UNLOCK_PENALTY));

      const userFundsAfter = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      expect(new BN(userFundsAfter.toString())).to.be.bignumber.lessThan(
        new BN(userFundsBefore.toString()).add(new BN(STAKE_AMOUNT))
      );
    });

    it("Another User can stake in the newly created reward pool", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const userFundsBefore = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      const durationPreset = 2592000;
      const {
        data: [resultPoolId, resultAccountId, resultAmount, resultDurationPreset, resultPositionId, resultBool]
      } = await sendAndWaitForSuccess(
        api,
        walletStaker2,
        api.events.stakingRewards.Staked.is,
        api.tx.stakingRewards.stake(poolId, STAKE_AMOUNT, durationPreset)
      );
      expect(resultPoolId.toNumber()).to.equal(poolId);
      expect(resultAccountId.toString()).to.equal(api.createType("AccountId32", walletStaker2.publicKey).toString());
      expect(resultAmount.toString()).to.equal(STAKE_AMOUNT.toString());
      expect(resultDurationPreset.toString()).to.equal(durationPreset.toString());
      positionStaker2Id = resultPositionId;
      expect(resultBool.isTrue).to.be.true;

      const stakeInfoAfter = <Option<ComposableTraitsStakingStake>>(
        await api.query.stakingRewards.stakes(positionStaker2Id)
      );
      expect(stakeInfoAfter.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletStaker2.publicKey).toString()
      );
      expect(stakeInfoAfter.unwrap().rewardPoolId.toNumber()).to.equal(poolId);
      expect(stakeInfoAfter.unwrap().stake).to.be.bignumber.equal(new BN(STAKE_AMOUNT));
      amountAfterStake = stakeInfoAfter.unwrap().stake;
      expect(stakeInfoAfter.unwrap().share).to.be.bignumber.equal(new BN(STAKE_AMOUNT));
      expect(stakeInfoAfter.unwrap().lock.unlockPenalty).to.be.bignumber.equal(new BN(UNLOCK_PENALTY));

      const userFundsAfter = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      expect(new BN(userFundsAfter.toString())).to.be.bignumber.lessThan(
        new BN(userFundsBefore.toString()).add(new BN(STAKE_AMOUNT))
      );
    });
  });

  describe("tx.stakingRewards.extend Tests", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("User should be able to extend their position", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const userFundsBefore = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      const amount = STAKE_AMOUNT * 2;
      const {
        data: [resultPositionId, resultAmount]
      } = await sendAndWaitForSuccess(
        api,
        walletStaker,
        api.events.stakingRewards.StakeAmountExtended.is,
        api.tx.stakingRewards.extend(positionStaker1Id, amount)
      );
      expect(resultPositionId).to.be.bignumber.equal(resultPositionId);
      expect(resultAmount.toString()).to.equal(amount.toString());

      const stakeInfoAfter = <Option<ComposableTraitsStakingStake>>(
        await api.query.stakingRewards.stakes(positionStaker1Id)
      );
      expect(stakeInfoAfter.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletStaker.publicKey).toString()
      );
      expect(stakeInfoAfter.unwrap().rewardPoolId.toNumber()).to.equal(poolId);
      expect(stakeInfoAfter.unwrap().stake).to.be.bignumber.equal(new BN(amount).add(amountAfterStake));
      stakeAmountAfterExtending = stakeInfoAfter.unwrap().stake;
      expect(stakeInfoAfter.unwrap().share).to.be.bignumber.equal(new BN(amount).add(amountAfterStake));
      expect(stakeInfoAfter.unwrap().lock.unlockPenalty).to.be.bignumber.equal(new BN(UNLOCK_PENALTY));

      const userFundsAfter = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      expect(new BN(userFundsAfter.toString())).to.be.bignumber.lessThan(
        new BN(userFundsBefore.toString()).add(new BN(amount))
      );
    });
  });

  describe("tx.stakingRewards.split Tests", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("User can split their position", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const {
        data: [result]
      } = await sendAndWaitForSuccess(
        api,
        walletStaker,
        api.events.stakingRewards.SplitPosition.is,
        api.tx.stakingRewards.split(poolId, 500_000)
      );
      expect(result.length).to.be.equal(2);

      const stakeInfoAfter = <Option<ComposableTraitsStakingStake>>(
        await api.query.stakingRewards.stakes(positionStaker1Id)
      );
      expect(stakeInfoAfter.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletStaker.publicKey).toString()
      );
      expect(stakeInfoAfter.unwrap().rewardPoolId.toNumber()).to.equal(poolId);
      expect(stakeInfoAfter.unwrap().stake).to.be.bignumber.equal(stakeAmountAfterExtending.muln(0.5));
      expect(stakeInfoAfter.unwrap().share).to.be.bignumber.equal(stakeAmountAfterExtending.muln(0.5));
      expect(stakeInfoAfter.unwrap().lock.unlockPenalty).to.be.bignumber.equal(new BN(UNLOCK_PENALTY));
    });
  });

  describe("tx.stakingRewards.unstake Tests", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("User should be able to unstake funds from pool before it has ended and get slashed", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const userFundsBefore = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      const {
        data: [resultAccountId, resultPositionId, resultSlashAmount]
      } = await sendAndWaitForSuccess(
        api,
        walletStaker2,
        api.events.stakingRewards.UnstakingSlashed.is,
        api.tx.stakingRewards.unstake(positionStaker2Id)
      );
      expect(resultAccountId.toString()).to.be.equal(api.createType("AccountId32", walletStaker2.publicKey).toString());
      expect(resultPositionId).to.be.bignumber.equal(positionStaker2Id);
      expect(resultSlashAmount).to.be.bignumber.greaterThan(0);

      const stakeInfoAfter = <Option<ComposableTraitsStakingStake>>(
        await api.query.stakingRewards.stakes(positionStaker2Id)
      );
      expect(stakeInfoAfter.unwrapOr(undefined)).to.be.undefined;

      const userFundsAfter = await api.rpc.assets.balanceOf("1", walletStaker2.publicKey);
      expect(new BN(userFundsAfter.toString())).to.be.bignumber.greaterThan(new BN(userFundsBefore.toString()));
    });

    it("User should be able to unstake funds from pool", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(4 * 60 * 1000);
      await waitForBlocks(api, 6);
      const userFundsBefore = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      const {
        data: [resultAccountId, resultPositionId]
      } = await sendAndWaitForSuccess(
        api,
        walletStaker,
        api.events.stakingRewards.Unstaked.is,
        api.tx.stakingRewards.unstake(positionStaker1Id)
      );
      expect(resultAccountId.toString()).to.be.equal(api.createType("AccountId32", walletStaker.publicKey).toString());
      expect(resultPositionId).to.be.bignumber.equal(positionStaker1Id);

      const stakeInfoAfter = <Option<ComposableTraitsStakingStake>>(
        await api.query.stakingRewards.stakes(positionStaker1Id)
      );
      expect(stakeInfoAfter.unwrapOr(undefined)).to.be.undefined;

      const userFundsAfter = await api.rpc.assets.balanceOf("1", walletStaker.publicKey);
      expect(new BN(userFundsAfter.toString())).to.be.bignumber.greaterThan(new BN(userFundsBefore.toString()));
    });
  });

  describe("tx.stakingRewards.updateRewardsPool After End Tests", function () {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("Pool owner can update pool configuration", async function () {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const poolInfoBefore = await api.query.stakingRewards.rewardPools(poolId);
      console.debug(poolInfoBefore.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]);
      const rewardUpdates = api.createType("BTreeMap<u128, ComposableTraitsStakingRewardUpdate>", {
        "1": {
          rewardRate: {
            period: {
              PerSecond: "100000"
            },
            amount: "1000000000000000"
          }
        }
      });
      const {
        data: [result]
      } = await sendAndWaitForSuccess(
        api,
        sudoKey,
        api.events.sudo.Sudid.is,
        api.tx.sudo.sudo(api.tx.stakingRewards.updateRewardsPool(poolId, rewardUpdates))
      );
      expect(result.isOk).to.be.true;
      const poolInfo = await api.query.stakingRewards.rewardPools(poolId);
      expect(poolInfo.unwrap().owner.toString()).to.equal(
        api.createType("AccountId32", walletOwner.publicKey).toString()
      );
      expect(poolInfo.unwrap().assetId.toString()).to.equal("1");
      console.debug(poolInfo.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]);
      // ToDo (D.Roth): Change comparison to amount from above.
      expect(poolInfo.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]).to.be.greaterThan(
        poolInfoBefore.unwrap().rewards.toJSON()["1"]["rewardRate"]["amount"]
      );
      //console.debug(poolInfo.unwrap().rewards.)
    });
  });
});

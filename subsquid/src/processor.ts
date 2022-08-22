import { SubstrateProcessor } from "@subsquid/substrate-processor";
import {
  PabloLiquidityAddedEvent,
  PabloLiquidityRemovedEvent,
  PabloPoolCreatedEvent,
  PabloPoolDeletedEvent,
  PabloSwappedEvent,
} from "./types/events";
import {
  processLiquidityAddedEvent,
  processLiquidityRemovedEvent,
  processPoolCreatedEvent,
  processPoolDeletedEvent,
  processSwappedEvent,
} from "./processors/pablo";
import {
  processRewardPoolCreatedEvent,
  processSplitPositionEvent,
  processStakeAmountExtendedEvent,
  processStakedEvent,
  processUnstakedEvent,
} from "./processors/stakingRewards";
import {
  processTransferEvent,
  processDepositEvent,
  processWithdrawEvent,
} from "./processors/balances";
import {
  processNewBondEvent,
  processNewOfferEvent,
  processOfferCancelledEvent,
} from "./processors/bondedFinance";
import { processVestingScheduleAddedEvent } from "./processors/vestingSchedule";
import { processOraclePriceChanged } from "./processors/oracle";

const processor = new SubstrateProcessor("composable_dali_dev");

const chain = (): string => {
  switch (process.env.ENV) {
    case "dali":
      return "wss://dali.devnets.composablefinance.ninja/parachain/alice";
    case "dali-stage":
      return "wss://dali-cluster-fe.composablefinance.ninja";
    default:
      return "ws://127.0.0.1:9988";
  }
};

const chainConnectionString = chain();
const archiveConnectionString = "http://localhost:4010/v1/graphql";

console.log(`Chain ${chainConnectionString}`);
console.log(`Archive ${archiveConnectionString}`);

processor.setBatchSize(500);
processor.setDataSource({
  archive: archiveConnectionString,
  chain: chainConnectionString,
});

processor.addEventHandler("pablo.PoolCreated", async (ctx) => {
  const event = new PabloPoolCreatedEvent(ctx);
  await processPoolCreatedEvent(ctx, event);
});

processor.addEventHandler("pablo.PoolDeleted", async (ctx) => {
  const event = new PabloPoolDeletedEvent(ctx);
  await processPoolDeletedEvent(ctx, event);
});

processor.addEventHandler("pablo.LiquidityAdded", async (ctx) => {
  const event = new PabloLiquidityAddedEvent(ctx);
  await processLiquidityAddedEvent(ctx, event);
});

processor.addEventHandler("pablo.LiquidityRemoved", async (ctx) => {
  const event = new PabloLiquidityRemovedEvent(ctx);
  await processLiquidityRemovedEvent(ctx, event);
});

processor.addEventHandler("pablo.Swapped", async (ctx) => {
  const event = new PabloSwappedEvent(ctx);
  await processSwappedEvent(ctx, event);
});

processor.addEventHandler("balances.Transfer", async (ctx) => {
  await processTransferEvent(ctx);
});

processor.addEventHandler("balances.Withdraw", async (ctx) => {
  await processWithdrawEvent(ctx);
});

processor.addEventHandler("balances.Deposit", async (ctx) => {
  await processDepositEvent(ctx);
});

processor.addEventHandler("bondedFinance.NewOffer", processNewOfferEvent);

processor.addEventHandler("bondedFinance.NewBond", processNewBondEvent);

processor.addEventHandler(
  "bondedFinance.OfferCancelled",
  processOfferCancelledEvent
);

processor.addEventHandler(
  "vesting.VestingScheduleAdded",
  processVestingScheduleAddedEvent
);

processor.addEventHandler("stakingRewards.RewardPoolCreated", async (ctx) => {
  await processRewardPoolCreatedEvent(ctx);
});

processor.addEventHandler("stakingRewards.Staked", async (ctx) => {
  await processStakedEvent(ctx);
});

processor.addEventHandler("stakingRewards.StakeAmountExtended", async (ctx) => {
  await processStakeAmountExtendedEvent(ctx);
});

processor.addEventHandler("stakingRewards.Unstaked", async (ctx) => {
  await processUnstakedEvent(ctx);
});

processor.addEventHandler("stakingRewards.SplitPosition", async (ctx) => {
  await processSplitPositionEvent(ctx);
});

processor.addEventHandler("oracle.PriceChanged", processOraclePriceChanged);

processor.run();

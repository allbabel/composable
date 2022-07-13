import { ApiPromise } from "@polkadot/api";
import { sendAndWaitForSuccess } from "@composable/utils/polkadotjs";
import { KeyringPair } from "@polkadot/keyring/types";
import { u128 } from "@polkadot/types-codec";
import { Balance } from "@polkadot/types/interfaces/runtime";
import { IEvent } from "@polkadot/types/types";
import { AccountId32 } from "@polkadot/types/interfaces";

/**
 * Creates a constant product (Uniswap) dex pool.
 * @param api Connected API client.
 * @param senderWallet The wallet to send the transaction from.
 * @param poolId
 * @param lpAmount
 * @param minBaseAmount
 * @param minQuoteAmount
 */
export default async function(
  api: ApiPromise,
  senderWallet: KeyringPair,
  poolId: number | u128,
  lpAmount: number | u128 | Balance,
  minBaseAmount: number | u128 | Balance,
  minQuoteAmount: number | u128 | Balance
): Promise<IEvent<[AccountId32, u128, u128, u128, u128]>> {
  return await sendAndWaitForSuccess(
    api,
    senderWallet,
    api.events.pablo.LiquidityRemoved.is,
    api.tx.pablo.removeLiquidity(poolId, lpAmount, minBaseAmount, minQuoteAmount)
  );
}

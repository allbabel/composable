import { ApiPromise } from "@polkadot/api";
import { sendAndWaitForSuccess } from "@composable/utils/polkadotjs";
import { KeyringPair } from "@polkadot/keyring/types";
import { Bool, Null, Result, u128 } from "@polkadot/types-codec";
import { Balance } from "@polkadot/types/interfaces/runtime";
import { SpRuntimeDispatchError } from "@polkadot/types/lookup";
import { IEvent } from "@polkadot/types/types";

/**
 * Creates a constant product (Uniswap) dex pool.
 * @param api Connected API client.
 * @param sudoKey
 * @param poolId
 * @param baseAmount
 * @param quoteAmount
 * @param minMintAmount
 * @param keepAlive
 */
export default async function(
  api: ApiPromise,
  sudoKey: KeyringPair,
  poolId: number | u128,
  baseAmount: number | u128 | Balance,
  quoteAmount: number | u128 | Balance,
  minMintAmount: number | u128 | Balance,
  keepAlive: Bool | boolean
): Promise<IEvent<[Result<Null, SpRuntimeDispatchError>]>> {
  return await sendAndWaitForSuccess(
    api,
    sudoKey,
    api.events.sudo.Sudid.is,
    api.tx.sudo.sudo(api.tx.pablo.addLiquidity(poolId, baseAmount, quoteAmount, minMintAmount, keepAlive))
  );
}

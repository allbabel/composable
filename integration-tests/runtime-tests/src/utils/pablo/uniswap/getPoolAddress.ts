import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { sendAndWaitForSuccess } from "@composable/utils/polkadotjs";

export default async function(
  api: ApiPromise,
  poolId: number,
  walletId: KeyringPair,
  baseAmount: bigint,
  quoteAmount: bigint
): Promise<string> {
  const pool = api.createType("u128", poolId);
  const baseAmountParam = api.createType("u128", baseAmount);
  const quoteAmountParam = api.createType("u128", quoteAmount);
  const keepAliveParam = api.createType("bool", true);
  const minMintAmountParam = api.createType("u128", 0);
  const {
    data: [, AccountId]
  } = await sendAndWaitForSuccess(
    api,
    walletId,
    api.events.tokens.Endowed.is,
    api.tx.pablo.addLiquidity(pool, baseAmountParam, quoteAmountParam, minMintAmountParam, keepAliveParam)
  );
  return AccountId.toString();
}

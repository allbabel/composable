import BigNumber from "bignumber.js";
import useStore from "../../store/useStore";
import { useEffect } from "react";
import { useParachainApi, useSelectedAccount } from "substrate-react";
import { decodeBondOffer } from "./decodeBondOffer";
import { stringToBigNumber } from "../pools/utils";
import { DEFAULT_NETWORK_ID } from "../constants";
import { decodeVestingSchedule } from "./decodeVestingSchedule";

/**
 * Updates zustand store with all bonds from bondedFinance pallet
 * @returns null
 */
const Updater = () => {
  const { addBond, addActiveBond, reset } = useStore();
  const { parachainApi } = useParachainApi("picasso");
  const selectedAccount = useSelectedAccount(DEFAULT_NETWORK_ID);

  useEffect(() => {
    if (parachainApi && selectedAccount) {
      parachainApi.query.bondedFinance
        ?.bondOfferCount()
        .then(async (offerCount) => {
          const _offerCount = new BigNumber(offerCount.toString());

          let offerPromises = [];
          for (let i = 1; i <= _offerCount.toNumber(); i++) {
            offerPromises.push(parachainApi.query.bondedFinance.bondOffers(i));
          }

          const bonds = await Promise.all(offerPromises);
          bonds.map(async (bond) => {
            const [beneficiary, bondOffer] = bond.toHuman() as any;

            const assetId = stringToBigNumber(bondOffer.asset).toNumber();
            const rewardAssetId = stringToBigNumber(
              bondOffer.reward.asset
            ).toNumber();

            const [vestingSchedule] = (await (
              await parachainApi.query.vesting.vestingSchedules(
                selectedAccount.address,
                assetId
              )
            ).toHuman()) as any;

            const oracleAssetPrice = (
              await parachainApi.query.oracle.prices(assetId)
            ).toHuman() as any;
            const oracleRewardPrice = (
              await parachainApi.query.oracle.prices(rewardAssetId)
            ).toHuman() as any;

            const decimals = new BigNumber(10).pow(12);

            const assetPriceInUSD = stringToBigNumber(
              oracleAssetPrice.price
            ).div(decimals);
            const rewardPriceInUSD = stringToBigNumber(
              oracleRewardPrice.price
            ).div(decimals);

            const decodedBondOffer = decodeBondOffer(beneficiary, bondOffer);
            const decodedVestingSchedule = vestingSchedule
              ? decodeVestingSchedule(vestingSchedule)
              : null;

            const currentBlock = stringToBigNumber(
              (await parachainApi.query.system.number()).toString()
            );
            const currentTime = stringToBigNumber(
              (await parachainApi.query.timestamp.now()).toString()
            );

            if (decodedVestingSchedule) {
              addActiveBond(
                decodedBondOffer,
                decodedVestingSchedule,
                currentBlock,
                currentTime
              );
            }

            addBond(
              decodedBondOffer,
              assetPriceInUSD.toNumber(),
              rewardPriceInUSD.toNumber()
            );
          });
        });
    }
  }, [parachainApi, selectedAccount]);

  useEffect(() => {
    reset();
  }, [selectedAccount]);

  return null;
};

export default Updater;

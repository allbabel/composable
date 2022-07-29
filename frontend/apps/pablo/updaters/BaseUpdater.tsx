import PoolsUpdater from "@/updaters/pools/Updater";
import LiquidityUpdater from "@/updaters/liquidity/Updater";
import LiquidityBootstrappingUpdater from "@/updaters/pools/Updater";

import PoolStatsUpdater from "@/updaters/poolStats/Updater";
import BalancesUpdater from "@/updaters/assets/balances/Updater";
import ApolloUpdater from "@/updaters/assets/apollo/Updater";
import AuctionsUpdater from "@/updaters/auctions/Updater";
import BondsUpdater from "@/updaters/bonds/Updater";
import { useEagerConnect } from "substrate-react";
import { DEFAULT_NETWORK_ID } from "@/defi/utils";

const BaseUpdaters = () => {

    return (
        <>
        <AuctionsUpdater />
        <LiquidityBootstrappingUpdater />
        <BalancesUpdater />
        <LiquidityUpdater />
        <PoolStatsUpdater />
        <ApolloUpdater />
        <PoolsUpdater />
        <BondsUpdater />
      </>
    )
}

export default BaseUpdaters;
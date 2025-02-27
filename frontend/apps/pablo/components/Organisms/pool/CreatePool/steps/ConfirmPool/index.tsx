import { BaseAsset, Label } from "@/components/Atoms";
import { Link } from "@/components/Molecules";
import { FormTitle } from "@/components/Organisms/FormTitle";
import {
  Box,
  Button,
  useTheme,
  alpha,
  BoxProps,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { useDispatch } from "react-redux";
import FormWrapper from "../../FormWrapper";

import EditIcon from "@mui/icons-material/Edit";
import { ConfirmingPoolModal } from "./ConfirmingPoolModal";
import { AccessTimeRounded, OpenInNewRounded } from "@mui/icons-material";
import moment from "moment-timezone";
import useStore from "@/store/useStore";
import { AMMs } from "@/defi/AMMs";
import { useUSDPriceByAssetId } from "@/store/assets/hooks";
import {
  getSigner,
  useExecutor,
  useParachainApi,
  useSelectedAccount,
} from "substrate-react";
import { DEFAULT_NETWORK_ID } from "@/defi/utils/constants";
import { APP_NAME } from "@/defi/polkadot/constants";
import { EventRecord } from "@polkadot/types/interfaces/system/types";
import { addLiquidityToPoolViaPablo, createConstantProductPool, createStableSwapPool, toChainUnits } from "@/defi/utils";
import { closeConfirmingModal, openConfirmingModal } from "@/stores/ui/uiSlice";
import { useAsset } from "@/defi/hooks/assets/useAsset";

const labelProps = (
  label: string | undefined,
  balance?: string,
  fontWeight?: string | number
) =>
  ({
    label: label,
    mb: 0,
    TypographyProps: {
      variant: "body1",
      fontWeight: fontWeight,
    },
    BalanceProps: {
      balance: balance,
      BalanceTypographyProps: {
        variant: "body1",
        fontWeight: fontWeight,
      },
    },
  } as const);

const ConfirmPoolStep: React.FC<BoxProps> = ({ ...boxProps }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);
  const selectedAccount = useSelectedAccount(DEFAULT_NETWORK_ID);

  const {
    createPool: {
      baseAsset,
      quoteAsset,
      liquidity,
      currentStep,
      swapFee,
      ammId,
      weights,
      setSelectable,
      resetSlice,
    },
    supportedAssets
  } = useStore();

  const _baseAsset = useAsset(baseAsset);
  const _quoteAsset = useAsset(quoteAsset)

  const executor = useExecutor();

  const baseLiquidity = useMemo(() => {
    return new BigNumber(liquidity.baseAmount);
  }, [liquidity.baseAmount]);

  const quoteLiquidity = useMemo(() => {
    return new BigNumber(liquidity.quoteAmount);
  }, [liquidity.quoteAmount]);

  const [createdAt, setCreatedAt] = useState(-1)

  const baseTokenUSDPrice = useUSDPriceByAssetId(baseAsset);
  const quoteTokenUSDPrice = useUSDPriceByAssetId(quoteAsset);

  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const usdAmount1 = baseLiquidity.multipliedBy(baseTokenUSDPrice);
  const usdAmount2 = quoteLiquidity.multipliedBy(quoteTokenUSDPrice);

  const poolName = `${_baseAsset?.symbol}-${_quoteAsset?.symbol}`;

  const buttonText = () => {
    // if (isConfirmed) {
    //   return "View pool";
    // }

    // if (isFunding) {
    //   return "Fund pool";
    // }

    return "Create pool";
  };

  const goChooseTokensStep = () => {
    setSelectable({ currentStep: 1 });
  };

  const goSetFeesStep = () => {
    setSelectable({ currentStep: 2 });
  };

  const addLiquidity = async (poolId: number) => {
    if (parachainApi && selectedAccount && executor && selectedAccount) {
      const { address } = selectedAccount;
      const signer = await getSigner(APP_NAME, address);

      const call = addLiquidityToPoolViaPablo(
        parachainApi,
        poolId,
        toChainUnits(liquidity.baseAmount).toString(),
        toChainUnits(liquidity.quoteAmount).toString()
      );

      executor.execute(
        call,
        selectedAccount.address,
        parachainApi,
        signer,
        (txHash: string) => {
          console.log("Add Liq Tx Hash: ", txHash);
        },
        (txHash: string, events) => {
          dispatch(closeConfirmingModal());
          console.log("Add Liq Tx Hash: ", txHash);
          resetSlice();
        },
        (errorMessage: string) => {
          dispatch(closeConfirmingModal());
          console.log("Add Liq Error: ", errorMessage);
        }
      );
    }
  };

  const onCreateFinalized = (txHash: string, events: EventRecord[]) => {
    console.log("Pool Creation Finalized", txHash);
    setCreatedAt(Date.now())

    if (parachainApi) {
      const poolCreatedEvent = events.find((ev) =>
        parachainApi.events.pablo.PoolCreated.is(ev.event)
      );

      if (poolCreatedEvent) {
        const poolCreated: any = poolCreatedEvent.toJSON();
        if (
          poolCreated.event &&
          poolCreated.event.data &&
          poolCreated.event.data.length
        ) {
          addLiquidity(poolCreated.event.data[0]);
        }
      }
    }
  };

  const onButtonClickHandler = async () => {
    if (executor && parachainApi && selectedAccount) {
      const { address } = selectedAccount;
      const signer = await getSigner(APP_NAME, address);

      let pair = { base: +baseAsset, quote: +quoteAsset }
      let permillDecimals = new BigNumber(10).pow(4);
      let fee = new BigNumber(swapFee).times(permillDecimals).toNumber();

      let baseWeight = new BigNumber(weights.baseWeight).times(permillDecimals);

      let call =
        ammId === "uniswap" || ammId === "balancer"
          ? createConstantProductPool(
              parachainApi,
              pair,
              fee,
              address,
              baseWeight.toNumber()
            )
          : createStableSwapPool(parachainApi, pair, fee, address);

      executor
        .execute(
          call,
          selectedAccount.address,
          parachainApi,
          signer,
          (txHash: string) => {
            dispatch(openConfirmingModal());
            console.log("Tx Ready Hash: ", txHash);
          },
          onCreateFinalized,
          (errorMessage) => {
            console.log("tx Error: ", errorMessage);
            dispatch(closeConfirmingModal());
          }
        )
        .catch((err) => {
          console.log("error", err);
          dispatch(closeConfirmingModal());
        });
    }
  };

  const onBackHandler = () => {
    setSelectable({ currentStep: currentStep - 1 });
  };

  return (
    <FormWrapper {...boxProps}>
      <FormTitle title="Confirm new pool" onBackHandler={onBackHandler} />

      <Box mt={6}>
        <Typography variant="subtitle1">
          Tokens and initial seed liquidity
        </Typography>

        <Label {...labelProps(undefined, `${baseLiquidity}`, 600)} mt={3}>
          {_baseAsset && (
            <BaseAsset
              icon={_baseAsset.icon}
              label={_baseAsset.symbol}
            />
          )}
        </Label>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="right"
          mt={0.5}
        >
          {`≈$${usdAmount1.toFixed(2)}`}
        </Typography>

        <Label {...labelProps(undefined, `${quoteLiquidity}`, 600)} mt={2}>
          {_quoteAsset && (
            <BaseAsset
              icon={_quoteAsset.icon}
              label={_quoteAsset.symbol}
            />
          )}
        </Label>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="right"
          mt={0.5}
        >
          {`≈$${usdAmount2.toFixed(2)}`}
        </Typography>

        <Label
          {...labelProps("Total", `$${usdAmount1.plus(usdAmount2)}`, 600)}
          mt={2}
        />
      </Box>

      <Box mt={4}>
        <Divider
          sx={{
            borderColor: alpha(
              theme.palette.common.white,
              theme.custom.opacity.main
            ),
          }}
        />
      </Box>

      <Box mt={4}>
        <Typography variant="subtitle1">Summary</Typography>
        <Box display="flex" gap={1} alignItems="center" mt={2}>
          <Label {...labelProps("Pool name", `${poolName}`)} width="100%" />
          <IconButton onClick={goChooseTokensStep}>
            <EditIcon color="primary" />
          </IconButton>
        </Box>

        <Label
          {...labelProps(
            "Pool type",
            `${ammId === "none" ? "-" : AMMs[ammId].label}`
          )}
          mt={1}
        />

        <Box display="flex" gap={1} alignItems="center" mt={1}>
          <Label {...labelProps("Swap fee", `${swapFee}%`)} width="100%" />
          <IconButton onClick={goSetFeesStep}>
            <EditIcon color="primary" />
          </IconButton>
        </Box>

        {isConfirmed && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
          >
            <Box display="flex" alignItems="center" gap={1.75}>
              <AccessTimeRounded sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {moment(createdAt)
                  .utc()
                  .format("ddd, DD MMM YYYY, hh:mm:ss [GMT]")}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1.75}>
              <Typography variant="body2" color="text.secondary">
                Etherscan
              </Typography>
              <Link href="/frontend/apps/pablo/pages" target="_blank">
                <OpenInNewRounded color="primary" />
              </Link>
            </Box>
          </Box>
        )}
      </Box>

      <Box mt={isConfirmed ? 1.5 : 4}>
        <Button
          variant={isConfirmed ? "outlined" : "contained"}
          fullWidth
          size="large"
          onClick={onButtonClickHandler}
        >
          {buttonText()}
        </Button>
      </Box>

      <ConfirmingPoolModal poolName={poolName} isFunding={isFunding} />
    </FormWrapper>
  );
};

export default ConfirmPoolStep;

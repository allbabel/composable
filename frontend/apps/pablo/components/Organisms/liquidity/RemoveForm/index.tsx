import { FormTitle, ValueSelector } from "@/components";
import { useAppSelector } from "@/hooks/store";
import {
  closeConfirmingModal,
  openConfirmingModal,
  setMessage,
} from "@/stores/ui/uiSlice";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  alpha,
  Box,
  Button,
  Divider,
  Slider,
  Typography,
  useTheme,
} from "@mui/material";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ConfirmingModal } from "./ConfirmingModal";
import { PreviewDetails } from "./PreviewDetails";
import { useRemoveLiquidityState } from "@/store/removeLiquidity/hooks";
import useDebounce from "@/hooks/useDebounce";
import { useLiquidityPoolDetails } from "@/store/hooks/useLiquidityPoolDetails";
import { fetchSpotPrice, fromRemoveLiquiditySimulationResult, toChainUnits } from "@/defi/utils";
import { useParachainApi, useSelectedAccount } from "substrate-react";
import { DEFAULT_NETWORK_ID } from "@/defi/utils/constants";

export const RemoveLiquidityForm = ({ ...rest }) => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);
  const selectedAccount = useSelectedAccount(DEFAULT_NETWORK_ID);
  const { poolId } = useRemoveLiquidityState();
  const { lpBalance, baseAsset, quoteAsset } = useLiquidityPoolDetails(poolId);

  const isConfirmingModalOpen = useAppSelector(
    (state) => state.ui.isConfirmingModalOpen
  );

  const [percentage, setPercentage] = useState<number>(0);
  const [expectedRemoveAmountQuote, setExpectedRemoveAmountQuote] =
    useState<BigNumber>(new BigNumber(0));
  const [expectedRemoveAmountBase, setExpectedRemoveAmountBase] =
    useState<BigNumber>(new BigNumber(0));

  const [confirmed, setConfirmed] = useState<boolean>(false);

  const debouncedPercentage = useDebounce(percentage, 500);

  const [priceOfBase, setPriceOfBase] = useState(new BigNumber(0));
  const [priceOfQuote, setPriceOfQuote] = useState(new BigNumber(0));

  useEffect(() => {
    if (poolId !== -1 && baseAsset && quoteAsset && parachainApi) {
      fetchSpotPrice(
        parachainApi,
        {
          base: baseAsset.network[DEFAULT_NETWORK_ID],
          quote: quoteAsset.network[DEFAULT_NETWORK_ID],
        },
        poolId
      ).then((basePrice) => {
        const basePriceBn = new BigNumber(basePrice);

        setPriceOfBase(basePriceBn);
        setPriceOfQuote(new BigNumber(1).div(basePriceBn));
      });
    }
  }, [poolId, baseAsset, quoteAsset, parachainApi]);

  useEffect(() => {
    if (
      parachainApi &&
      debouncedPercentage > 0 &&
      lpBalance.gt(0) &&
      selectedAccount &&
      baseAsset &&
      quoteAsset
    ) {
      const selectedLpAmount = toChainUnits(
        lpBalance.times(debouncedPercentage / 100)
      );

      const b = baseAsset.network[DEFAULT_NETWORK_ID].toString();
      const q = quoteAsset.network[DEFAULT_NETWORK_ID].toString();

      // @ts-ignore
      parachainApi.rpc.pablo
        .simulateRemoveLiquidity(
          parachainApi.createType("AccountId32", selectedAccount.address),
          parachainApi.createType("PalletPabloPoolId", poolId.toString()),
          selectedLpAmount.dp(0).toString(),
          {
            [b]: "0",
            [q]: "0",
          }
        )
        .then((response: any) => {
          const remove = fromRemoveLiquiditySimulationResult(response.toJSON())
          setExpectedRemoveAmountBase(remove[b])
          setExpectedRemoveAmountQuote(remove[q])
        })
        .catch((err: any) => {
          setExpectedRemoveAmountBase(new BigNumber(0))
          setExpectedRemoveAmountQuote(new BigNumber(0))
          console.error(err);
        });
    }
  }, [
    parachainApi,
    debouncedPercentage,
    lpBalance,
    poolId,
    selectedAccount,
    baseAsset,
    quoteAsset,
  ]);

  const onBackHandler = () => {
    router.push("/pool");
  };

  const onSettingHandler = () => {
    console.log("onSettingHandler");
  };

  const onSliderChangeHandler = (_: Event, newValue: number | number[]) => {
    setPercentage(newValue as number);
  };

  const onRemoveHandler = async () => {
    dispatch(openConfirmingModal());
  };

  useEffect(() => {
    confirmed && dispatch(closeConfirmingModal());
    !confirmed && dispatch(setMessage({}));
  }, [confirmed, dispatch]);

  useEffect(() => {
    dispatch(setMessage({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      borderRadius={1.33}
      margin="auto"
      sx={{
        width: 550,
        padding: theme.spacing(4),
        [theme.breakpoints.down("sm")]: {
          width: "100%",
          padding: theme.spacing(2),
        },
        background: theme.palette.gradient.secondary,
        boxShadow: `-1px -1px ${alpha(
          theme.palette.common.white,
          theme.custom.opacity.light
        )}`,
      }}
      {...rest}
    >
      <FormTitle
        title="Remove Liquidity"
        onBackHandler={onBackHandler}
        onSettingHandler={onSettingHandler}
      />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={4}
      >
        <Typography variant="body1">Amount</Typography>
        <Typography variant="body1">Detailed</Typography>
      </Box>

      <Typography variant="h5" mt={4}>
        {percentage}%
      </Typography>

      <Box mt={8}>
        <Slider
          aria-label="percentage"
          value={percentage}
          valueLabelDisplay="auto"
          onChange={confirmed ? undefined : onSliderChangeHandler}
          min={0}
          max={100}
          marks={[
            { value: 0, label: "0" },
            { value: 25 },
            { value: 50 },
            { value: 75 },
            { value: 100, label: "100" },
          ]}
        />
        <ValueSelector
          values={[25, 50, 75, 100]}
          unit="%"
          onChangeHandler={confirmed ? undefined : setPercentage}
        />
      </Box>

      <Box mt={4} textAlign="center">
        <Box
          width={56}
          height={56}
          borderRadius={9999}
          display="flex"
          border={`2px solid ${theme.palette.primary.main}`}
          justifyContent="center"
          alignItems="center"
          margin="auto"
        >
          <ExpandMoreIcon />
        </Box>
      </Box>

      {baseAsset && quoteAsset && (
        <PreviewDetails
          lpToRemove={lpBalance.times(debouncedPercentage).div(100)}
          mt={4}
          token1={baseAsset}
          token2={quoteAsset}
          expectedReceiveAmountToken1={expectedRemoveAmountBase}
          expectedReceiveAmountToken2={expectedRemoveAmountQuote}
          price1={priceOfBase}
          price2={priceOfQuote}
        />
      )}

      {!confirmed && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={4}
          gap={2}
        >
          {/* <Box width="50%">
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setApproved(true)}
              disabled={approved}
              sx={{
                "&:disabled": {
                  backgroundColor: alpha(
                    theme.palette.success.main,
                    theme.custom.opacity.light
                  ),
                  color: theme.palette.featured.main,
                },
              }}
            >
              {approved ? (
                <>
                  <CheckIcon sx={{ marginRight: theme.spacing(2) }} />
                  Approved
                </>
              ) : (
                <>Approve</>
              )}
            </Button>
          </Box> */}

          <Box width="100%">
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={!percentage || confirmed}
              onClick={onRemoveHandler}
            >
              {!percentage ? "Enter Amount" : "Remove"}
            </Button>
          </Box>
        </Box>
      )}

      {!confirmed && (
        <>
          <Box mt={6}>
            <Divider
              sx={{
                borderColor: alpha(
                  theme.palette.common.white,
                  theme.custom.opacity.main
                ),
              }}
            />
          </Box>
          {/* <YourPosition
            noTitle={false}
            noDivider
            tokenId1={tokenId1 as TokenId}
            tokenId2={tokenId2 as TokenId}
            pooledAmount1={pooledAmount1}
            pooledAmount2={pooledAmount2}
            amount={amount}
            share={share}
            mt={6}
          /> */}
        </>
      )}

      {!confirmed && baseAsset && quoteAsset && (
        <ConfirmingModal
          lpBalance={lpBalance}
          percentage={new BigNumber(debouncedPercentage).div(100)}
          price1={priceOfBase}
          price2={priceOfQuote}
          baseAsset={baseAsset}
          quoteAsset={quoteAsset}
          open={isConfirmingModalOpen}
          amount1={expectedRemoveAmountBase}
          amount2={expectedRemoveAmountQuote}
          setConfirmed={setConfirmed}
        />
      )}
    </Box>
  );
};

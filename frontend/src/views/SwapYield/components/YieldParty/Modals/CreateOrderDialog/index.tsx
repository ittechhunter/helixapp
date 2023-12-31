import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { useAllTokens } from 'hooks/Tokens'
import { useERC20s, useHelixYieldSwap } from 'hooks/useContract'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useMemo, useState } from 'react'
import { useMemoFarms } from 'state/farms/hooks'
import { useAllTokenBalances } from 'state/wallet/hooks'
import { ButtonMenu, ButtonMenuItem, Modal } from 'uikit'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import BaseOpenSwap from './BaseOpenSwap'



const CreateOrderDialog = (props) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { onDismiss } = props
  const [swapType, setSwapType] = useState(0)
  const YieldSwapContract = useHelixYieldSwap()
  const allTokens = useAllTokens() // All Stable Token
  const allTokenBalances = useAllTokenBalances()
  const { data: farmsLP } = useMemoFarms()

  const [LPOptions, setLPOptions] = useState<any>()

  const TokenOptions = Object.keys(allTokens).map((key) => {
    return {
      label: allTokens[key].symbol,
      value: allTokens[key],
      address: allTokens[key].address,
      decimals: allTokens[key].decimals,
      maxBalance: allTokenBalances[key] ? new BigNumber(allTokenBalances[key].toExact()) : BIG_ZERO,
      allowance: BIG_ZERO,
      contract: undefined
    }
  })
  const tokenAddressList = Object.keys(allTokens).map(key => allTokens[key].address)


  const [minDuration, setMinDuration] = useState(0)
  const [maxDuration, setMaxDuration] = useState(0)

  const [tempLPOptions, lpAddressList] = useMemo(() => {
    const lpOptions = farmsLP
      .filter((lp) => lp.pid !== 0)
      .map((lp) => ({
        label: lp.lpSymbol,
        value: lp,
        decimals: lp.token.decimals,
        address: lp.lpAddress,
        maxBalance: getBalanceAmount(lp.userData.tokenBalance, lp.token.decimals),
        allowance: BIG_ZERO,
        contract: undefined,
      }))
    const addressList = lpOptions.map((option) => {
      return option.address
    })
    return [lpOptions, addressList]
  }, [farmsLP])

  const lpContracts = useERC20s(lpAddressList)
  const tokenContracts = useERC20s(tokenAddressList)

  useEffect(() => {
    let unmounted = false
    const allowanceContracts = lpContracts.map((lpContract) => {
      return lpContract.allowance(account, YieldSwapContract.address)
    })
    Promise.all(allowanceContracts).then((allowances) => {
      for (let i = 0; i < tempLPOptions.length; i++) {
        tempLPOptions[i].allowance = new BigNumber(allowances[i].toString())
        tempLPOptions[i].contract = lpContracts[i]
      }
      if (unmounted) return
      setLPOptions(tempLPOptions)
    })
    return () => {
      unmounted = true
    }
  }, [YieldSwapContract.address, account, lpContracts, tempLPOptions])

  useEffect(() => {
    const allowanceContracts = tokenContracts.map((contract) => {
      return contract.allowance(account, YieldSwapContract.address)
    })
    Promise.all(allowanceContracts).then((allowances) => {
      for (let i = 0; i < TokenOptions.length; i++) {
        TokenOptions[i].allowance = new BigNumber(allowances[i].toString())
        TokenOptions[i].contract = tokenContracts[i]
      }
    })
  })

  useEffect(() => {
    let unmounted = false
    Promise.all([YieldSwapContract.MIN_LOCK_DURATION(), YieldSwapContract.MAX_LOCK_DURATION()]).then((values) => {
      if (unmounted) return
      setMinDuration(values[0].toNumber() / 24 / 3600)
      setMaxDuration(values[1].toNumber() / 24 / 3600)
    })
    return () => {
      unmounted = true
    }
  }, [YieldSwapContract, account])

  if (!LPOptions) return null

  const handleConfirm = (toBuyerTokenAddress, toSellerTokenAddress, decimalUAmount, decimalYAmount, duration, isToBuyerTokenLP, isToSellerTokenLp) => {
    return YieldSwapContract.openSwap(
      toBuyerTokenAddress,
      toSellerTokenAddress,
      decimalUAmount.toString(),
      decimalYAmount.toString(),
      duration,
      isToBuyerTokenLP, isToSellerTokenLp
    )
  }
  const propData = {
    toBuyerTokenOptions: LPOptions,
    minDuration,
    maxDuration,
    toSellerTokenOptions: TokenOptions,
    contractAddress: YieldSwapContract.address,
    onDismiss,
    handleConfirm
  }
  return (
    <Modal title={t('Create Swap')} headerBackground={theme.colors.gradients.cardHeader} onDismiss={onDismiss}>
      <ButtonMenu activeIndex={swapType} scale="sm" variant="subtle" onItemClick={(index) => { setSwapType(index) }}>
        <ButtonMenuItem>{t('Yield-Stable')}</ButtonMenuItem>
        <ButtonMenuItem>{t('Stable-Yield')}</ButtonMenuItem>
        <ButtonMenuItem>{t('Yield-Yield')}</ButtonMenuItem>
      </ButtonMenu>
      {
        swapType === 0 ? <BaseOpenSwap {...propData} key={swapType}
          isToBuyerTokenLp
          isToSellerTokenLp={false}
        />
          : swapType === 1 ? <BaseOpenSwap {...propData}
            key={swapType}
            toBuyerTokenOptions={TokenOptions}
            toSellerTokenOptions={LPOptions}
            isToBuyerTokenLp={false}
            isToSellerTokenLp
          />
            : <BaseOpenSwap {...propData}
              key={swapType}
              toBuyerTokenOptions={LPOptions}
              toSellerTokenOptions={LPOptions}
              isToBuyerTokenLp
              isToSellerTokenLp
            />
      }
    </Modal>
  )
}
export default CreateOrderDialog

import { Button, Flex, Text } from 'uikit'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from 'contexts/Localization'
import { useERC20 } from 'hooks/useContract'
import useToast from 'hooks/useToast'
import React, { useCallback, useState } from 'react'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'
import { DeserializedFarm } from 'state/types'
import styled from 'styled-components'
import { logError } from 'utils/sentry'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useFetchFarmUserAllowances, useFetchFarmUserEarnings, useFetchFarmUserStakedBalances, useFetchFarmUserTokenBalances } from 'state/farms/hooks'
import useApproveFarm from '../../hooks/useApproveFarm'
import HarvestAction from './HarvestAction'
import StakeAction from './StakeAction'

const Action = styled.div`
  padding-top: 16px;
`
export interface FarmWithStakedValue extends DeserializedFarm {
  apr?: number
}

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  account?: string
  addLiquidityUrl?: string
  helixPrice?: BigNumber
  lpLabel?: string
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, account, addLiquidityUrl, helixPrice, lpLabel }) => {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { chainId } = useActiveWeb3React()
  const { pid, lpAddress } = farm
  const { allowance, tokenBalance, stakedBalance, earnings } = farm.userData || {}
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const dispatch = useAppDispatch()
  const fetchFarmUserAllowances = useFetchFarmUserAllowances()
  const fetchFarmUserTokenBalances = useFetchFarmUserTokenBalances()
  const fetchFarmUserStakedBalances = useFetchFarmUserStakedBalances()
  const fetchFarmUserEarnings = useFetchFarmUserEarnings()
  const lpContract = useERC20(lpAddress)

  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      dispatch(fetchFarmUserDataAsync({
        account, pids: [pid], chainId, fetchFarmUserAllowances,
        fetchFarmUserEarnings, fetchFarmUserStakedBalances, fetchFarmUserTokenBalances
      }))
    } catch (e) {
      logError(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    } finally {
      setRequestedApproval(false)
    }
  }, [onApprove, dispatch, account, pid, chainId, fetchFarmUserAllowances, fetchFarmUserEarnings, fetchFarmUserStakedBalances, fetchFarmUserTokenBalances, toastError, t])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <StakeAction
        stakedBalance={stakedBalance}
        tokenBalance={tokenBalance}
        tokenName={farm.lpSymbol}
        pid={pid}
        apr={farm.apr}
        lpLabel={lpLabel}
        helixPrice={helixPrice}
        addLiquidityUrl={addLiquidityUrl}
      />
    ) : (
      <Button mt="8px" width="100%" disabled={requestedApproval} onClick={handleApprove}>
        {t('Enable Contract')}
      </Button>
    )
  }

  return (
    <Action>
      <Flex>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          HELIX
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Earned')}
        </Text>
      </Flex>
      <HarvestAction earnings={earnings} pid={pid} />
      <Flex>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          {farm.lpSymbol}
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Staked')}
        </Text>
      </Flex>
      {!account ? <ConnectWalletButton mt="8px" width="100%" /> : renderApprovalOrStakeButton()}
    </Action>
  )
}

export default CardActions

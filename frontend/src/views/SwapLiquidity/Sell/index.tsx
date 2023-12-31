import { useWeb3React } from '@web3-react/core'
import Page from 'components/Layout/Page'
import Loading from 'components/Loading'
import { useTranslation } from 'contexts/Localization'
import { useHelixLpSwap } from 'hooks/useContract'
import { useFastFresh } from 'hooks/useRefresh'
import useToast from 'hooks/useToast'
import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonMenu, ButtonMenuItem, useMatchBreakpoints, useModal } from 'uikit'
import handleError from 'utils/handleError'
import { SwapLiquidityContext } from '../context'
import { OrderState } from '../types'
import CreateOrderDialog from './Modals/CreateOrderDialog'
import SellTable from './SellTable'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1em;
  a {
    padding-left: 12px;
    padding-right: 12px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
  }
`

const Sell = () => {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const LpSwapContract = useHelixLpSwap()
  const { account } = useWeb3React()
  const [menuIndex, setMenuIndex] = useState(0)
  const [swapIds, setSwapIds] = useState<any[]>()
  const { isMobile } = useMatchBreakpoints()

  const fastRefresh = useFastFresh()
  const { tableRefresh, setFilterState } = useContext(SwapLiquidityContext)

  const handleButtonMenuClick = (newIndex) => {
    // setFilterOrderState(newIndex)
    if (newIndex === 0) setFilterState(OrderState.Active)
    if (newIndex === 1) setFilterState(OrderState.Completed)
    setMenuIndex(newIndex)
  }
  useEffect(()=>{
    setFilterState(menuIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [handleAdd] = useModal(<CreateOrderDialog />)
  useEffect(() => {
    if (tableRefresh < 0) return
    if (!account) {
      setSwapIds([])
      return
    } 
    LpSwapContract.getSwapIds(account)
      .then(async (ids) => {
        setSwapIds(ids)
      })
      .catch((err) => {
        console.error(err)
        handleError(err, toastError)
      })
  }, [LpSwapContract, account, toastError, tableRefresh, fastRefresh])

  return (
    <Page>
      {
        account && (
          <Wrapper>
            <ButtonMenu activeIndex={menuIndex} scale="sm" variant="subtle" onItemClick={handleButtonMenuClick}>
              <ButtonMenuItem>{t('Open')}</ButtonMenuItem>
              <ButtonMenuItem>{t('Executed')}</ButtonMenuItem>
            </ButtonMenu>
            <Button variant="secondary" scale={ isMobile ? "sm" : "md" } mr="1em" onClick={handleAdd}>
              {' '}
              Create Swap{' '}
            </Button>
          </Wrapper>
        )
      }
      {
        !swapIds ?
        <Loading/>
        :
        <SellTable data={swapIds} />
      }
      
    </Page>
  )
}

export default Sell

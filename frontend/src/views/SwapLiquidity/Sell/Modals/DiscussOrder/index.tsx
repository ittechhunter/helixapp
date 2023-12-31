import BigNumber from 'bignumber.js'
import { useAllTokens } from 'hooks/Tokens'
import { useHelixLpSwap } from 'hooks/useContract'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useToast from 'hooks/useToast'
import React, { useState } from 'react'
import { useFarms } from 'state/farms/hooks'
import { useTheme } from 'styled-components'
import {
  AutoRenewIcon,
  BalanceInput,
  Button,
  Heading,
  ModalBody,
  ModalCloseButton,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  Text
} from 'uikit'
import getThemeValue from 'uikit/util/getThemeValue'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceNumber, getDecimalAmount } from 'utils/formatBalance'
import handleError from 'utils/handleError'
import { getTokenDecimals, getTokenSymbol } from 'views/SwapYield/components/Cells/ToolTipCell'

// const getEllipsis = (account) => {
//   return account ? `${account.substring(0, 5)}...${account.substring(account.length - 5)}` : null
// }

const DiscussOrder: React.FC<any> = ({onDismiss, ...props}) => {
  const theme = useTheme()
  const { chainId } = useActiveWeb3React()
  const LpSwapContract = useHelixLpSwap()
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)

  const bodyPadding = '24px'
  const headerBackground = 'transparent'
  const minWidth = '320px'
  const { swapId, sendAsk, swapData,buyer } = props  
  const { data: farms } = useFarms()
  const tokens = useAllTokens()
  
  const [yAmount, setYAmount] = useState(getBalanceNumber(swapData?.ask.toString(), getTokenDecimals(chainId, farms, tokens, buyer)).toString())

  const handleYAmountChange = (input) => {
    setYAmount(input)
  }
  const handleSendClick = () => {
    const decimalYAmount = getDecimalAmount(new BigNumber(yAmount), getTokenDecimals(chainId, farms, tokens, buyer))
    if (decimalYAmount.lte(BIG_ZERO)) {
      toastError('Error', 'Token Amount should be bigger than zero')
      return
    }
    setPendingTx(true)
    LpSwapContract.setAsk(swapId, decimalYAmount.toString())
      .then(async (tx) => {
        await tx.wait()
        toastSuccess('Success', 'Updated asking amount!')
        if (sendAsk) sendAsk()
        setPendingTx(false)
        onDismiss()
      })
      .catch((err) => {
        handleError(err, toastError)
        setPendingTx(false)
      })
  }
  return (
    <ModalContainer minWidth={minWidth} {...props}>
      <ModalHeader background={getThemeValue(`colors.${headerBackground}`, headerBackground)(theme)}>
        <ModalTitle>
          <Heading> Update Asking Amount </Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>
      <ModalBody p={bodyPadding}>
        <div style={{ marginTop: '1em' }}>
          <div style={{ display: 'flex', marginBottom: '1em', alignItems: 'center' }}>
            <Text style={{ marginRight: '1em' }}>{getTokenSymbol(chainId, farms, tokens, buyer)}</Text>
            <BalanceInput value={yAmount} onUserInput={handleYAmountChange} />
          </div>
          <Button
            isLoading={pendingTx}
            endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
            onClick={handleSendClick}
            width="100%"
          >
            Confirm
          </Button>
        </div>
      </ModalBody>
    </ModalContainer>
  )
}

export default DiscussOrder

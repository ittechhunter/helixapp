import React from 'react'
import { useAllTokens } from 'hooks/Tokens'
import styled from 'styled-components'
import { TokenImage } from 'components/TokenImage'
import { useMatchBreakpoints } from 'uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import BaseTokenCell from './BaseTokenCell'


const Container = styled.div`
  display: flex;
  justify-content: start;
`

const ExTokenCell = (props) => {
  const { exTokenAddress, balance } = props
  const tokens = useAllTokens()
  const exToken = tokens[exTokenAddress]
  const amount = getBalanceNumber(balance, exToken.decimals)
  const {isMobile} = useMatchBreakpoints()

  return(
    <Container>
      { !isMobile && <TokenImage  token={exToken} width={32} height={32}/> }
      <BaseTokenCell tokenSymbol={exToken?.symbol} balance={amount} />
    </Container>
  ) 
}

export default ExTokenCell

import React from 'react'
import Balance from 'components/Balance'
import { Skeleton, Text, useMatchBreakpoints } from 'uikit'
import { CellContent } from './BaseCell'

const BaseTokenCell = (props) => {
  const { tokenSymbol, balance } = props // moment Duration
  const {isMobile} = useMatchBreakpoints()

  if (!tokenSymbol || balance === undefined) {
    return (
      <CellContent>
        <Skeleton />
        <Skeleton mt="4px" />
      </CellContent>
    )
  }
  return (
    <>
      <CellContent style={{marginLeft: isMobile && 8}}>
        <Text fontSize={isMobile ? "12px": undefined}>{tokenSymbol}</Text>
        <Balance mt="4px" color="primary" value={balance} fontSize="14px" decimals={4}/>
      </CellContent>
    </>
  )
}
export default BaseTokenCell

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import React, { Fragment, memo } from 'react'
import { Trade } from 'sdk'
import { Text, Flex, ChevronRightIcon } from 'uikit'
import { unwrappedToken } from 'utils/wrappedCurrency'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const { chainId } = useActiveWeb3React()
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token, chainId)
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <Flex alignItems="end">
              <Text fontSize="14px" ml="0.125rem" mr="0.125rem">
                {currency.symbol}
              </Text>
            </Flex>
            {!isLastItem && <ChevronRightIcon width="12px" />}
          </Fragment>
        )
      })}
    </Flex>
  )
})

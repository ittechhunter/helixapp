import React from 'react'
import styled from 'styled-components'
import { Box, CardBody, Flex, Text, CardProps, HelpIcon, useTooltip, LinkExternal, Link, TokenPairImage } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useWeb3React } from '@web3-react/core'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useIfoPoolCreditBlock, useVaultPoolByKey } from 'state/pools/hooks'
import { DeserializedPool, VaultKey } from 'state/types'
import { convertSharesToHelix } from 'views/Pools/helpers'
import { FlexGap } from 'components/Layout/Flex'
import { getEtherScanLink } from 'utils'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useGetVaultPoolConfig } from 'views/Pools/hooks/useGetVaultPoolConfig'
import AprRow from '../PoolCard/AprRow'
import { StyledCard } from '../PoolCard/StyledCard'
import CardFooter from '../PoolCard/CardFooter'
import PoolCardHeader, { PoolCardHeaderTitle } from '../PoolCard/PoolCardHeader'
import VaultCardActions from './VaultCardActions'
import UnstakingFeeCountdownRow from './UnstakingFeeCountdownRow'
import RecentHelixProfitRow from './RecentHelixProfitRow'

const StyledCardBody = styled(CardBody)<{ isLoading: boolean }>`
  min-height: ${({ isLoading }) => (isLoading ? '0' : '254px')};
`

interface HelixVaultProps extends CardProps {
  pool: DeserializedPool
  showStakedOnly: boolean
  defaultFooterExpanded?: boolean
}

export const CreditCalcBlock = () => {
  const { creditStartBlock, creditEndBlock, hasEndBlockOver } = useIfoPoolCreditBlock()
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  const { tooltip, tooltipVisible, targetRef } = useTooltip(
    hasEndBlockOver ? (
      <>
        <Text>
          {t(
            'The latest credit calculation period has ended. After the coming IFO, credits will be reset and the calculation will resume.',
          )}
        </Text>
        <LinkExternal href="https://twitter.com/panhelixswap">
          {t('Follow us on Twitter to catch the latest news about the coming IFO.')}
        </LinkExternal>
      </>
    ) : (
      <>
        <Text>
          {t(
            'The start block of the current calculation period. Your average IFO HELIX Pool staking balance is calculated throughout this period.',
          )}
        </Text>
        <LinkExternal href="https://medium.com/panhelixswap/initial-farm-offering-ifo-3-0-ifo-staking-pool-622d8bd356f1">
          {t('Check out our Medium article for more details.')}
        </LinkExternal>
      </>
    ),
    { placement: 'auto' },
  )

  return (
    <Flex mt="8px" justifyContent="space-between">
      <Text fontSize="14px">{hasEndBlockOver ? t('Credit calculation ended:') : t('Credit calculation starts:')}</Text>
      <Flex mr="6px" alignItems="center">
        <Link
          external
          href={getEtherScanLink(hasEndBlockOver ? creditEndBlock : creditStartBlock, 'block', chainId)}
          mr="4px"
          color={hasEndBlockOver ? 'warning' : 'primary'}
          fontSize="14px"
        >
          {hasEndBlockOver ? creditEndBlock : creditStartBlock}
        </Link>
        <span ref={targetRef}>
          <HelpIcon color="textSubtle" />
        </span>
      </Flex>
      {tooltipVisible && tooltip}
    </Flex>
  )
}

const HelixVaultCard: React.FC<HelixVaultProps> = ({ pool, showStakedOnly, defaultFooterExpanded, ...props }) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const {
    userData: { userShares, isLoading: isVaultUserDataLoading },
    fees: { performanceFeeAsDecimal },
    pricePerFullShare,
  } = useVaultPoolByKey(pool.vaultKey)
  const vaultPoolConfig = useGetVaultPoolConfig()

  const { helixAsBigNumber } = convertSharesToHelix(userShares, pricePerFullShare)

  const accountHasSharesStaked = userShares && userShares.gt(0)
  const isLoading = !pool.userData || isVaultUserDataLoading

  if (showStakedOnly && !accountHasSharesStaked) {
    return null
  }

  return (
    <StyledCard isActive {...props}>
      <PoolCardHeader isStaking={accountHasSharesStaked}>
        <PoolCardHeaderTitle
          title={t(vaultPoolConfig[pool.vaultKey].name)}
          subTitle={t(vaultPoolConfig[pool.vaultKey].description)}
        />
        <TokenPairImage {...vaultPoolConfig[pool.vaultKey].tokenImage} width={64} height={64} />
      </PoolCardHeader>
      <StyledCardBody isLoading={isLoading}>
        <AprRow pool={pool} stakedBalance={helixAsBigNumber} performanceFee={performanceFeeAsDecimal} />
        {pool.vaultKey === VaultKey.IfoPool && <CreditCalcBlock />}
        <FlexGap mt="16px" gap="24px" flexDirection={accountHasSharesStaked ? 'column-reverse' : 'column'}>
          <Box>
            <Box mt="24px">
              <RecentHelixProfitRow vaultKey={pool.vaultKey} />
            </Box>
            <Box mt="8px">
              <UnstakingFeeCountdownRow vaultKey={pool.vaultKey} />
            </Box>
          </Box>
          <Flex flexDirection="column">
            {account ? (
              <VaultCardActions
                pool={pool}
                accountHasSharesStaked={accountHasSharesStaked}
                isLoading={isLoading}
                performanceFee={performanceFeeAsDecimal}
              />
            ) : (
              <>
                <Text mb="10px" textTransform="uppercase" fontSize="12px" color="textSubtle" bold>
                  {t('Start earning')}
                </Text>
                <ConnectWalletButton />
              </>
            )}
          </Flex>
        </FlexGap>
      </StyledCardBody>
      <CardFooter defaultExpanded={defaultFooterExpanded} pool={pool} account={account} />
    </StyledCard>
  )
}

export default HelixVaultCard

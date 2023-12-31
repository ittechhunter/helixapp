import { Box, Button, Flex, InjectedModalProps, LinkExternal, Message, Skeleton, Text } from 'uikit'
import { FetchStatus } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import useAuth from 'hooks/useAuth'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import React from 'react'
import { getEtherScanLink } from 'utils'
import { formatBigNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { useGetTokens } from 'hooks/useGetTokens'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ETHER } from 'sdk'
import { BASE_SCAN_NAMES } from 'config'
import CopyAddress from './CopyAddress'

interface WalletInfoProps {
  hasLowBnbBalance: boolean
  onDismiss: InjectedModalProps['onDismiss']
}

const WalletInfo: React.FC<WalletInfoProps> = ({ hasLowBnbBalance, onDismiss }) => {
  const { t } = useTranslation()
  const { balance, fetchStatus } = useGetBnbBalance()
  const { logout } = useAuth()
  const { chainId, account } = useActiveWeb3React()
  const tokens = useGetTokens()
  const { balance: helixBalance, fetchStatus: helixFetchStatus } = useTokenBalance(tokens.helix.address)

  const handleLogout = () => {
    onDismiss()
    logout()
  }

  return (
    <>
      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
        {t('Your Address')}
      </Text>
      <CopyAddress account={account} mb="24px" />
      {hasLowBnbBalance && (
        <Message variant="warning" mb="24px">
          <Box>
            <Text fontWeight="bold">{t(`${ETHER[chainId].symbol} Balance Low`)}</Text>
            <Text as="p">{t(`You need ${ETHER[chainId].symbol} for transaction fees.`)}</Text>
          </Box>
        </Message>
      )}
      <Flex alignItems="center" justifyContent="space-between">
        <Text color="textSubtle">{t(`${ETHER[chainId].symbol} Balance`)}</Text>
        {fetchStatus !== FetchStatus.Fetched ? (
          <Skeleton height="22px" width="60px" />
        ) : (
          <Text>{formatBigNumber(balance, 6)}</Text>
        )}
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" mb="24px">
        <Text color="textSubtle">{t('HELIX Balance')}</Text>
        {helixFetchStatus !== FetchStatus.Fetched ? (
          <Skeleton height="22px" width="60px" />
        ) : (
          <Text>{getFullDisplayBalance(helixBalance, 18, 3)}</Text>
        )}
      </Flex>
      <Flex alignItems="center" justifyContent="end" mb="24px">
        <LinkExternal href={getEtherScanLink(account, 'address', chainId)}>{t(`View on ${BASE_SCAN_NAMES[chainId]}`)}</LinkExternal>
      </Flex>
      <Button variant="secondary" width="100%" onClick={handleLogout}>
        {t('Disconnect Wallet')}
      </Button>
    </>
  )
}

export default WalletInfo

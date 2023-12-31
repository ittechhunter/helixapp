import { getAddress } from '@ethersproject/address'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, ETHER } from 'sdk'
import { BASE_SOLANA_SCAN_URLS, BASE_ETH_SCAN_URLS } from '../config'
import { TokenAddressMap } from '../state/lists/hooks'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

export function getSolanaScanLink(data: string | number, cluster: 'mainnet' | 'testnet' | 'devnet'): string {
    let append
    switch (cluster) {
        case 'testnet': {
            append = '?cluster=testnet'
            break
        }
        case 'devnet': {
            append = '?cluster=devnet'
            break
        }
        default: {
            append = ''
        }
    }
    return `${BASE_SOLANA_SCAN_URLS}/address/${data}${append}`
}

export function getEtherScanLink(
    data: string | number,
    type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
    chainId: ChainId,
): string {
    switch (type) {
        case 'transaction': {
            return `${BASE_ETH_SCAN_URLS[chainId]}/tx/${data}`
        }
        case 'token': {
            return `${BASE_ETH_SCAN_URLS[chainId]}/token/${data}`
        }
        case 'block': {
            return `${BASE_ETH_SCAN_URLS[chainId]}/block/${data}`
        }
        case 'countdown': {
            return `${BASE_ETH_SCAN_URLS[chainId]}/block/countdown/${data}`
        }
        default: {
            return `${BASE_ETH_SCAN_URLS[chainId]}/address/${data}`
        }
    }
}

export function getEtherScanLinkForNft(
    collectionAddress: string,
    tokenId: string,
    chainId: ChainId,
): string {
    return `${BASE_ETH_SCAN_URLS[chainId]}/token/${collectionAddress}?a=${tokenId}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
    return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
    return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
    if (slippage < 0 || slippage > 10000) {
        throw Error(`Unexpected slippage value: ${slippage}`)
    }
    return [
        JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
        JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
    ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
    if (currency instanceof Token && currency === ETHER[currency.chainId]) return true
    return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

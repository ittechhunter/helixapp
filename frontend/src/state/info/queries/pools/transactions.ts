import { request, gql } from 'graphql-request'
import { INFO_CLIENT } from 'config/constants/endpoints'
import { Transaction } from 'state/info/types'
import { MintResponse, SwapResponse, BurnResponse } from 'state/info/queries/types'
import { mapMints, mapBurns, mapSwaps } from 'state/info/queries/helpers'
import { ChainId } from 'sdk'
/**
 * Transactions of the given pool, used on Pool page
 */
const POOL_TRANSACTIONS = gql`
    query poolTransactions($address: Bytes!) {
        mints(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            to
            amount0
            amount1
            amountUSD
        }
        swaps(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            from
            amount0In
            amount1In
            amount0Out
            amount1Out
            amountUSD
        }
        burns(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            sender
            amount0
            amount1
            amountUSD
        }
    }
`

interface TransactionResults {
    mints: MintResponse[]
    swaps: SwapResponse[]
    burns: BurnResponse[]
}

const fetchPoolTransactions = async (chainId: ChainId, address: string): Promise<{ data?: Transaction[]; error: boolean }> => {
    try {
        const data = await request<TransactionResults>(INFO_CLIENT[chainId], POOL_TRANSACTIONS, {
            address,
        })
        const mints = data.mints.map((mint) => mapMints(mint, chainId))
        const burns = data.burns.map((burn) => mapBurns(burn, chainId))
        const swaps = data.swaps.map((swap) => mapSwaps(swap, chainId))
        return { data: [...mints, ...burns, ...swaps], error: false }
    } catch (error) {
        console.error(`Failed to fetch transactions for pool ${address}`, error)
        return {
            error: true,
        }
    }
}

export default fetchPoolTransactions

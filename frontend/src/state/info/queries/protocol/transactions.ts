import { request, gql } from 'graphql-request'
import { INFO_CLIENT } from 'config/constants/endpoints'
import { Transaction } from 'state/info/types'
import { MintResponse, SwapResponse, BurnResponse } from 'state/info/queries/types'
import { mapMints, mapBurns, mapSwaps } from 'state/info/queries/helpers'
import { ChainId } from 'sdk'

/**
 * Transactions for Transaction table on the Home page
 */
const GLOBAL_TRANSACTIONS = gql`
    query overviewTransactions {
        mints: mints(first: 33, orderBy: timestamp, orderDirection: desc) {
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
        swaps: swaps(first: 33, orderBy: timestamp, orderDirection: desc) {
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
        burns: burns(first: 33, orderBy: timestamp, orderDirection: desc) {
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

const fetchTopTransactions = async (chainId: ChainId): Promise<Transaction[] | undefined> => {
    try {
        const data = await request<TransactionResults>(INFO_CLIENT[chainId], GLOBAL_TRANSACTIONS)

        if (!data) {
            return undefined
        }

        const mints = data.mints.map((mint) => mapMints(mint, chainId))
        const burns = data.burns.map((burn) => mapBurns(burn, chainId))
        const swaps = data.swaps.map((swap) => mapSwaps(swap, chainId))

        return [...mints, ...burns, ...swaps].sort((a, b) => {
            return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
        })
    } catch {
        return undefined
    }
}

export default fetchTopTransactions

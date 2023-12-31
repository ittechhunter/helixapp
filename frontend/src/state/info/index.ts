/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit'
import { InfoState } from './types'
import {
    updateProtocolData,
    updateProtocolChartData,
    updateProtocolTransactions,
    updatePoolData,
    addPoolKeys,
    updatePoolChartData,
    updatePoolTransactions,
    updateTokenData,
    addTokenKeys,
    addTokenPoolAddresses,
    updateTokenChartData,
    updateTokenPriceData,
    updateTokenTransactions,
    updateChainId
} from './actions'

const initialState: InfoState = {
    protocol: {
        overview: undefined,
        chartData: undefined,
        transactions: undefined,
    },
    pools: { byAddress: {} },
    tokens: { byAddress: {} },
    chainId: 0
}

export default createReducer(initialState, (builder) =>
    builder
        // Protocol actions
        .addCase(updateProtocolData, (state, { payload: { protocolData } }) => {
            state.protocol.overview = protocolData
        })
        .addCase(updateProtocolChartData, (state, { payload: { chartData } }) => {
            state.protocol.chartData = chartData
        })
        .addCase(updateProtocolTransactions, (state, { payload: { transactions } }) => {
            state.protocol.transactions = transactions
        })
        // Pools actions
        .addCase(updatePoolData, (state, { payload: { pools } }) => {
            const byAddress = {}
            pools.forEach((poolData) => {
                byAddress[`${poolData.address}-${poolData.chainId}`] = {
                    ...state.pools.byAddress[`${poolData.address}-${poolData.chainId}`],
                    data: poolData,
                }
            })
            state.pools.byAddress = byAddress
        })
        .addCase(addPoolKeys, (state, { payload: { poolAddresses } }) => {
            poolAddresses.forEach((address) => {
                if (!state.pools.byAddress[address]) {
                    state.pools.byAddress[address] = {
                        data: undefined,
                        chartData: undefined,
                        transactions: undefined,
                    }
                }
            })
        })
        .addCase(updatePoolChartData, (state, { payload: { poolAddress, chartData } }) => {
            state.pools.byAddress[poolAddress] = { ...state.pools.byAddress[poolAddress], chartData }
        })
        .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions } }) => {
            state.pools.byAddress[poolAddress] = { ...state.pools.byAddress[poolAddress], transactions }
        })
        // Tokens actions
        .addCase(updateTokenData, (state, { payload: { tokens } }) => {
            const byAddress = {}
            tokens.forEach((tokenData) => {
                byAddress[`${tokenData.address}-${tokenData.chainId}`] = {
                    ...state.tokens.byAddress[`${tokenData.address}-${tokenData.chainId}`],
                    data: tokenData,
                }
            })
            state.tokens.byAddress = byAddress
        })
        .addCase(addTokenKeys, (state, { payload: { tokenAddresses } }) => {
            tokenAddresses.forEach((address) => {
                if (!state.tokens.byAddress[address]) {
                    state.tokens.byAddress[address] = {
                        poolAddresses: undefined,
                        data: undefined,
                        chartData: undefined,
                        priceData: {},
                        transactions: undefined,
                    }
                }
            })
        })
        .addCase(addTokenPoolAddresses, (state, { payload: { tokenAddress, poolAddresses } }) => {
            state.tokens.byAddress[tokenAddress] = { ...state.tokens.byAddress[tokenAddress], poolAddresses }
        })
        .addCase(updateTokenChartData, (state, { payload: { tokenAddress, chartData } }) => {
            state.tokens.byAddress[tokenAddress] = { ...state.tokens.byAddress[tokenAddress], chartData }
        })
        .addCase(updateTokenTransactions, (state, { payload: { tokenAddress, transactions } }) => {
            state.tokens.byAddress[tokenAddress] = { ...state.tokens.byAddress[tokenAddress], transactions }
        })
        .addCase(
            updateTokenPriceData,
            (state, { payload: { tokenAddress, secondsInterval, priceData, oldestFetchedTimestamp } }) => {
                state.tokens.byAddress[tokenAddress] = {
                    ...state.tokens.byAddress[tokenAddress],
                    priceData: {
                        ...state.tokens.byAddress[tokenAddress]?.priceData,
                        [secondsInterval]: priceData,
                        oldestFetchedTimestamp,
                    },
                }
            },
        )
        .addCase(updateChainId, (state, { payload: { chainId } }) => {
            state.chainId = chainId
        }),
)

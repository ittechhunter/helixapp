import { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import { getFarms } from 'config/constants'
import { useFastFresh, useSlowFresh } from 'hooks/useRefresh'
import { deserializeToken } from 'state/user/hooks/helpers'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { SerializedFarmConfig } from 'config/constants/types'
import useMulticall from 'hooks/useMulticall'
import erc20ABI from 'config/abi/erc20.json'
import masterchefABI from 'config/abi/masterchef.json'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync, getNonArchivedFarms } from '.'
import { State, SerializedFarm, DeserializedFarmUserData, DeserializedFarm, DeserializedFarmsState } from '../types'
import useFetchFarms from './useFetchFarms'

const deserializeFarmUserData = (farm: SerializedFarm): DeserializedFarmUserData => {
    return {
        allowance: farm.userData ? new BigNumber(farm.userData.allowance) : BIG_ZERO,
        tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : BIG_ZERO,
        stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : BIG_ZERO,
        earnings: farm.userData ? new BigNumber(farm.userData.earnings) : BIG_ZERO,
    }
}

const deserializeFarm = (farm: SerializedFarm): DeserializedFarm => {
    if (farm === undefined) return null
    const { lpAddress, lpSymbol, pid, dual, multiplier, isCommunity, quoteTokenPriceBusd, tokenPriceBusd } = farm
    return {
        lpAddress,
        lpSymbol,
        pid,
        dual,
        multiplier,
        isCommunity,
        quoteTokenPriceBusd,
        tokenPriceBusd,
        token: deserializeToken(farm.token),
        quoteToken: deserializeToken(farm.quoteToken),
        userData: deserializeFarmUserData(farm),
        tokenAmountTotal: farm.tokenAmountTotal ? new BigNumber(farm.tokenAmountTotal) : BIG_ZERO,
        lpTotalInQuoteToken: farm.lpTotalInQuoteToken ? new BigNumber(farm.lpTotalInQuoteToken) : BIG_ZERO,
        lpTotalSupply: farm.lpTotalSupply ? new BigNumber(farm.lpTotalSupply) : BIG_ZERO,
        tokenPriceVsQuote: farm.tokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : BIG_ZERO,
        poolWeight: farm.poolWeight ? new BigNumber(farm.poolWeight) : BIG_ZERO,
    }
}

export const usePollFarmsPublicData = (includeArchive = false) => {
    const dispatch = useAppDispatch()
    const slowRefresh = useSlowFresh()
    const fetchFarms = useFetchFarms()
    const { chainId } = useActiveWeb3React()

    const farmsConfig = useMemo(() => getFarms(chainId), [chainId])
    const nonArchivedFarms = useMemo(() => getNonArchivedFarms(chainId), [chainId])

    useEffect(() => {
        const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
        const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)

        dispatch(fetchFarmsPublicDataAsync({ pids, fetchFarms, chainId }))
    }, [includeArchive, dispatch, slowRefresh, fetchFarms, farmsConfig, nonArchivedFarms, chainId])
}

export const usePollFarmsWithUserData = (includeArchive = false) => {
    const dispatch = useAppDispatch()
    const fastRefresh = useFastFresh()
    const fetchFarms = useFetchFarms()
    const fetchFarmUserAllowances = useFetchFarmUserAllowances()
    const fetchFarmUserTokenBalances = useFetchFarmUserTokenBalances()
    const fetchFarmUserStakedBalances = useFetchFarmUserStakedBalances()
    const fetchFarmUserEarnings = useFetchFarmUserEarnings()
    const { chainId, account } = useActiveWeb3React()

    const farmsConfig = useMemo(() => getFarms(chainId), [chainId])
    const nonArchivedFarms = useMemo(() => getNonArchivedFarms(chainId), [chainId])

    useEffect(() => {
        const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
        const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)

        dispatch(fetchFarmsPublicDataAsync({ pids, fetchFarms, chainId }))

        if (account) {
            dispatch(fetchFarmUserDataAsync({
                account, pids, chainId, fetchFarmUserAllowances,
                fetchFarmUserTokenBalances, fetchFarmUserStakedBalances, fetchFarmUserEarnings
            }))
        }
    }, [includeArchive, dispatch, fastRefresh, account, fetchFarms, fetchFarmUserAllowances, fetchFarmUserTokenBalances, fetchFarmUserStakedBalances, fetchFarmUserEarnings, farmsConfig, nonArchivedFarms, chainId])
}

/**
 * Fetches the "core" farm data used globally
 * 1 = HELIX-BNB LP
 * 3 = BNB-BUSD LP
 */
export const usePollCoreFarmData = () => {
    const dispatch = useAppDispatch()
    const fastRefresh = useFastFresh()
    const fetchFarms = useFetchFarms()
    const { chainId } = useActiveWeb3React()

    useEffect(() => {
        dispatch(fetchFarmsPublicDataAsync({ pids: [1, 2, 3, 11], fetchFarms, chainId }))
    }, [chainId, dispatch, fastRefresh, fetchFarms])
}

export const useFarms = (): DeserializedFarmsState => {
    const farms = useSelector((state: State) => state.farms)
    const { loadArchivedFarmsData, userDataLoaded } = farms
    return useMemo(() => {
        const deserializedFarmsData = farms.data.map(deserializeFarm)
        return {
            loadArchivedFarmsData,
            userDataLoaded,
            data: deserializedFarmsData,
        }
    }, [farms.data, loadArchivedFarmsData, userDataLoaded])
}

export const useMemoFarms = (): DeserializedFarmsState => {
    const farms = useSelector((state: State) => state.farms)

    return useMemo(() => {
        const deserializedFarmsData = farms.data.map(deserializeFarm)
        const { loadArchivedFarmsData, userDataLoaded } = farms
        return {
            loadArchivedFarmsData,
            userDataLoaded,
            data: deserializedFarmsData,
        }
    }, [farms])
}

export const useFarmFromPid = (pid: number): DeserializedFarm => {
    const farm = useSelector((state: State) => state.farms.data.find((f) => f.pid === pid))
    return useMemo(() => deserializeFarm(farm), [farm])
}

export const useFarmFromLpSymbol = (lpSymbol: string): DeserializedFarm => {
    const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
    return useMemo(() => deserializeFarm(farm), [farm])
}

export const useFarmFromLpAddress = (lpAddress: string): DeserializedFarm => {
    const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpAddress === lpAddress))
    return useMemo(() => deserializeFarm(farm), [farm])
}

export const useFarmUser = (pid): DeserializedFarmUserData => {
    const farm = useFarmFromPid(pid)
    return useMemo(() => {
        if (farm === null) return null
        const { userData } = farm
        const { allowance, tokenBalance, stakedBalance, earnings } = userData
        return {
            allowance,
            tokenBalance,
            stakedBalance,
            earnings,
        }
    }, [farm])
}

// Return the base token price for a farm, from a given pid
export const useBusdPriceFromPid = (pid: number): BigNumber => {
    const farm = useFarmFromPid(pid)
    return useMemo(() => farm ? new BigNumber(farm.tokenPriceBusd) : BIG_ZERO, [farm])
}

export const useLpTokenPrice = (symbol: string) => {
    const farm = useFarmFromLpSymbol(symbol)
    const farmTokenPriceInUsd = useBusdPriceFromPid(farm ? farm.pid : -1)
    return useMemo(() => {
        let lpTokenPrice = BIG_ZERO

        if (farm && farm.lpTotalSupply.gt(0) && farm.lpTotalInQuoteToken.gt(0)) {
            // Total value of base token in LP
            const valueOfBaseTokenInFarm = farmTokenPriceInUsd.times(farm.tokenAmountTotal)
            // Double it to get overall value in LP
            const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.times(2)
            // Divide total value of all tokens, by the number of LP tokens
            const totalLpTokens = getBalanceAmount(farm.lpTotalSupply)
            lpTokenPrice = overallValueOfAllTokensInFarm.div(totalLpTokens)
        }

        return lpTokenPrice
    }, [farm, farmTokenPriceInUsd])
}

/**
 * @@deprecated use the BUSD hook in /hooks
 */
export const usePriceHelixBusd = (): BigNumber => {
    const helixBnbFarm = useFarmFromPid(1)

    const helixPriceBusd = useMemo(() => {
        if (helixBnbFarm === null) return BIG_ZERO
        const helixPriceBusdAsString = helixBnbFarm.tokenPriceBusd
        return new BigNumber(helixPriceBusdAsString)
    }, [helixBnbFarm])

    return helixPriceBusd
}

export const useFetchFarmUserAllowances = () => {
    const multicall = useMulticall()
    const { chainId } = useActiveWeb3React()
    return useCallback(async (account: string, farmsToFetch: SerializedFarmConfig[]) => {
        const masterChefAddress = getMasterChefAddress(chainId)

        const calls = farmsToFetch.map((farm) => {
            const lpContractAddress = farm.lpAddress
            return { address: lpContractAddress, name: 'allowance', params: [account, masterChefAddress] }
        })

        const rawLpAllowances = await multicall<BigNumber[]>(erc20ABI, calls)
        const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
            return new BigNumber(lpBalance).toJSON()
        })
        return parsedLpAllowances
    }, [chainId, multicall])
}

export const useFetchFarmUserTokenBalances = () => {
    const multicall = useMulticall()
    return useCallback(async (account: string, farmsToFetch: SerializedFarmConfig[]) => {
        const calls = farmsToFetch.map((farm) => {
            const lpContractAddress = farm.lpAddress
            return {
                address: lpContractAddress,
                name: 'balanceOf',
                params: [account],
            }
        })

        const rawTokenBalances = await multicall(erc20ABI, calls)
        const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
            return new BigNumber(tokenBalance).toJSON()
        })
        return parsedTokenBalances
    }, [multicall])
}



export const useFetchFarmUserStakedBalances = () => {
    const multicall = useMulticall()
    const { chainId } = useActiveWeb3React()
    return useCallback(async (account: string, farmsToFetch: SerializedFarmConfig[]) => {
        const masterChefAddress = getMasterChefAddress(chainId)

        const calls = farmsToFetch.map((farm) => {
            return {
                address: masterChefAddress,
                name: 'userInfo',
                params: [farm.pid, account],
            }
        })

        const rawStakedBalances = await multicall(masterchefABI, calls)
        const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
            return new BigNumber(stakedBalance[0]._hex).toJSON()
        })
        return parsedStakedBalances
    }, [chainId, multicall])
}

export const useFetchFarmUserEarnings = () => {
    const multicall = useMulticall()
    const { chainId } = useActiveWeb3React()
    return useCallback(async (account: string, farmsToFetch: SerializedFarmConfig[]) => {
        const masterChefAddress = getMasterChefAddress(chainId)

        const calls = farmsToFetch.map((farm) => {
            return {
                address: masterChefAddress,
                name: 'pendingHelixToken',
                params: [farm.pid, account],
            }
        })

        const rawEarnings = await multicall(masterchefABI, calls)
        const parsedEarnings = rawEarnings.map((earnings) => {
            return new BigNumber(earnings).toJSON()
        })
        return parsedEarnings
    }, [chainId, multicall])
}

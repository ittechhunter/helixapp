import { FAST_INTERVAL, SLOW_INTERVAL } from 'config/constants'
import { useAppDispatch } from 'state'
import { useSelector } from 'react-redux'
import useProviders from 'hooks/useProviders'
import useSWR, { useSWRConfig } from 'swr'
import useSWRImmutable from 'swr/immutable'
import { State } from '../types'
import { setBlock } from '.'

const REFRESH_BLOCK_INTERVAL = 6000

export const usePollBlockNumber = () => {
    const { cache, mutate } = useSWRConfig()
    const dispatch = useAppDispatch()
    const rpcProvider = useProviders()
    const { data } = useSWR(
        'blockNumber',
        async () => {
            const blockNumber = await rpcProvider.getBlockNumber()
            if (!cache.get('initialBlockNumber')) {
                mutate('initialBlockNumber', blockNumber)
            }
            dispatch(setBlock(blockNumber))
            return blockNumber
        },
        {
            refreshInterval: REFRESH_BLOCK_INTERVAL,
        },
    )

    useSWR(
        [FAST_INTERVAL, 'blockNumber'],
        async () => {
            return data
        },
        {
            refreshInterval: FAST_INTERVAL,
        },
    )

    useSWR(
        [SLOW_INTERVAL, 'blockNumber'],
        async () => {
            return data
        },
        {
            refreshInterval: SLOW_INTERVAL,
        },
    )
}

export const useBlock = () => {
    return useSelector((state: State) => state.block)
}

export const useInitialBlock = (): number => {
    const { data: initialBlock = 0 } = useSWRImmutable('initialBlockNumber')
    return initialBlock
}

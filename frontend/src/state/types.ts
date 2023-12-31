import { ThunkAction } from 'redux-thunk'
import { AnyAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import {
    CampaignType,
    SerializedFarmConfig,
    LotteryStatus,
    LotteryTicket,
    DeserializedPoolConfig,
    SerializedPoolConfig,
    Team,
    TranslatableText,
    DeserializedFarmConfig,
    FetchStatus,
} from 'config/constants/types'
import { ChainId } from 'sdk'
import { NftToken, State as NftMarketState } from './nftMarket/types'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, AnyAction>

export interface BigNumberToJson {
    type: 'BigNumber'
    hex: string
}

export type SerializedBigNumber = string

interface SerializedFarmUserData {
    allowance: string
    tokenBalance: string
    stakedBalance: string
    earnings: string
}

export interface DeserializedFarmUserData {
    allowance: BigNumber
    tokenBalance: BigNumber
    stakedBalance: BigNumber
    earnings: BigNumber
}

export interface SerializedFarm extends SerializedFarmConfig {
    tokenPriceBusd?: string
    quoteTokenPriceBusd?: string
    tokenAmountTotal?: SerializedBigNumber
    lpTotalInQuoteToken?: SerializedBigNumber
    lpTotalSupply?: SerializedBigNumber
    tokenPriceVsQuote?: SerializedBigNumber
    poolWeight?: SerializedBigNumber
    userData?: SerializedFarmUserData
}

export interface DeserializedFarm extends DeserializedFarmConfig {
    tokenPriceBusd?: string
    quoteTokenPriceBusd?: string
    tokenAmountTotal?: BigNumber
    lpTotalInQuoteToken?: BigNumber
    lpTotalSupply?: BigNumber
    tokenPriceVsQuote?: BigNumber
    poolWeight?: BigNumber
    userData?: DeserializedFarmUserData
}

export enum VaultKey {
    HelixAutoPool = 'helixAutoPool',
    IfoPool = 'ifoPool',
}

interface CorePoolProps {
    startBlock?: number
    endBlock?: number
    apr?: number
    rawApr?: number
    stakingTokenPrice?: number
    earningTokenPrice?: number
    vaultKey?: VaultKey
}

export interface DeserializedPool extends DeserializedPoolConfig, CorePoolProps {
    totalStaked?: BigNumber
    manualStaked?: BigNumber
    stakingLimit?: BigNumber
    userData?: {
        allowance: BigNumber
        stakingTokenBalance: BigNumber
        stakedBalance: BigNumber
        pendingReward: BigNumber
    }
}

export interface SerializedPool extends SerializedPoolConfig, CorePoolProps {
    totalStaked?: SerializedBigNumber
    stakingLimit?: SerializedBigNumber
    userData?: {
        allowance: SerializedBigNumber
        stakingTokenBalance: SerializedBigNumber
        stakedBalance: SerializedBigNumber
        pendingReward: SerializedBigNumber
    }
}

export interface Profile {
    userId: number
    points: number
    teamId: number
    collectionAddress: string
    tokenId: number
    isActive: boolean
    username: string
    nft?: NftToken
    team: Team
    hasRegistered: boolean
}

// Slices states

export interface SerializedFarmsState {
    data: SerializedFarm[]
    loadArchivedFarmsData: boolean
    userDataLoaded: boolean
    loadingKeys: Record<string, boolean>,
    chainId: ChainId
}

export interface DeserializedFarmsState {
    data: DeserializedFarm[]
    loadArchivedFarmsData: boolean
    userDataLoaded: boolean
}

export interface VaultFees {
    performanceFee: number
    callFee: number
    withdrawalFee: number
    withdrawalFeePeriod: number
}

export interface VaultUser {
    isLoading: boolean
    userShares: string
    helixAtLastUserAction: string
    lastDepositedTime: string
    lastUserActionTime: string
}

export interface IfoVaultUser extends VaultUser {
    credit: string
}

export interface HelixAutoPool {
    totalShares?: string
    pricePerFullShare?: string
    totalHelixInVault?: string
    estimatedHelixBountyReward?: string
    totalPendingHelixHarvest?: string
    fees?: VaultFees
    userData?: VaultUser
}
export interface Deposit {
    id: number
    amount: BigNumber // staked Amount
    withdrawTimeStamp: number
    withdrawn: boolean
    weight: number
    apr?: number
}
export interface IfoHelixVault extends Omit<HelixAutoPool, 'userData'> {
    userData?: IfoVaultUser
    creditStartBlock?: number
    creditEndBlock?: number
}

export interface PoolsState {
    data: SerializedPool[]
    helixAutoPool: HelixAutoPool
    ifoPool: IfoHelixVault
    userDataLoaded: boolean
}

export interface ProfileState {
    isInitialized: boolean
    isLoading: boolean
    hasRegistered: boolean
    data: Profile
    profileAvatars: {
        [key: string]: {
            username: string
            nft: NftToken
            hasRegistered: boolean
            usernameFetchStatus: FetchStatus
            avatarFetchStatus: FetchStatus
        }
    }
}

export type TeamResponse = {
    0: string
    1: string
    2: string
    3: string
    4: boolean
}

export type TeamsById = {
    [key: string]: Team
}

export interface TeamsState {
    isInitialized: boolean
    isLoading: boolean
    data: TeamsById
}

export interface Achievement {
    id: string
    type: CampaignType
    address: string
    title: TranslatableText
    description?: TranslatableText
    badge: string
    points: number
}

export interface AchievementState {
    achievements: Achievement[]
    achievementFetchStatus: FetchStatus
}

// Block

export interface BlockState {
    currentBlock: number
    initialBlock: number
}

// Predictions

export enum BetPosition {
    BULL = 'Bull',
    BEAR = 'Bear',
    HOUSE = 'House',
}

export enum PredictionStatus {
    INITIAL = 'initial',
    LIVE = 'live',
    PAUSED = 'paused',
    ERROR = 'error',
}

export interface Round {
    id: string
    epoch: number
    position: BetPosition
    failed: boolean
    startAt: number
    startBlock: number
    startHash: string
    lockAt: number
    lockBlock: number
    lockHash: string
    lockPrice: number
    lockRoundId: string
    closeAt: number
    closeBlock: number
    closeHash: string
    closePrice: number
    closeRoundId: string
    totalBets: number
    totalAmount: number
    bullBets: number
    bullAmount: number
    bearBets: number
    bearAmount: number
    bets?: Bet[]
}

export interface Market {
    paused: boolean
    epoch: number
}

export interface Bet {
    id?: string
    hash?: string
    amount: number
    position: BetPosition
    claimed: boolean
    claimedAt: number
    claimedBlock: number
    claimedHash: string
    claimedBNB: number
    claimedNetBNB: number
    createdAt: number
    updatedAt: number
    user?: PredictionUser
    round?: Round
}

export interface PredictionUser {
    id: string
    createdAt: number
    updatedAt: number
    block: number
    totalBets: number
    totalBetsBull: number
    totalBetsBear: number
    totalBNB: number
    totalBNBBull: number
    totalBNBBear: number
    totalBetsClaimed: number
    totalBNBClaimed: number
    winRate: number
    averageBNB: number
    netBNB: number
    bets?: Bet[]
}

export enum HistoryFilter {
    ALL = 'all',
    COLLECTED = 'collected',
    UNCOLLECTED = 'uncollected',
}

export interface LedgerData {
    [key: string]: {
        [key: string]: ReduxNodeLedger
    }
}

export interface RoundData {
    [key: string]: ReduxNodeRound
}

export interface ReduxNodeLedger {
    position: BetPosition
    amount: BigNumberToJson
    claimed: boolean
}

export interface NodeLedger {
    position: BetPosition
    amount: ethers.BigNumber
    claimed: boolean
}

export interface ReduxNodeRound {
    epoch: number
    startTimestamp: number | null
    lockTimestamp: number | null
    closeTimestamp: number | null
    lockPrice: BigNumberToJson | null
    closePrice: BigNumberToJson | null
    totalAmount: BigNumberToJson
    bullAmount: BigNumberToJson
    bearAmount: BigNumberToJson
    rewardBaseCalAmount: BigNumberToJson
    rewardAmount: BigNumberToJson
    oracleCalled: boolean
    lockOracleId: string
    closeOracleId: string
}

export interface NodeRound {
    epoch: number
    startTimestamp: number | null
    lockTimestamp: number | null
    closeTimestamp: number | null
    lockPrice: ethers.BigNumber | null
    closePrice: ethers.BigNumber | null
    totalAmount: ethers.BigNumber
    bullAmount: ethers.BigNumber
    bearAmount: ethers.BigNumber
    rewardBaseCalAmount: ethers.BigNumber
    rewardAmount: ethers.BigNumber
    oracleCalled: boolean
    closeOracleId: string
    lockOracleId: string
}

export type LeaderboardFilterTimePeriod = '1d' | '7d' | '1m' | 'all'

export interface LeaderboardFilter {
    address?: string
    orderBy?: string
    timePeriod?: LeaderboardFilterTimePeriod
}

export interface PredictionsState {
    status: PredictionStatus
    isLoading: boolean
    isHistoryPaneOpen: boolean
    isChartPaneOpen: boolean
    isFetchingHistory: boolean
    historyFilter: HistoryFilter
    currentEpoch: number
    intervalSeconds: number
    minBetAmount: string
    bufferSeconds: number
    lastOraclePrice: string
    history: Bet[]
    totalHistory: number
    currentHistoryPage: number
    hasHistoryLoaded: boolean
    rounds?: RoundData
    ledgers?: LedgerData
    claimableStatuses: {
        [key: string]: boolean
    }
    leaderboard: {
        selectedAddress: string
        loadingState: FetchStatus
        filters: LeaderboardFilter
        skip: number
        hasMoreResults: boolean
        addressResults: {
            [key: string]: PredictionUser
        }
        results: PredictionUser[]
    }
}

// Voting

/* eslint-disable camelcase */
/**
 * @see https://hub.snapshot.page/graphql
 */
export interface VoteWhere {
    id?: string
    id_in?: string[]
    voter?: string
    voter_in?: string[]
    proposal?: string
    proposal_in?: string[]
}

export enum SnapshotCommand {
    PROPOSAL = 'proposal',
    VOTE = 'vote',
}

export enum ProposalType {
    ALL = 'all',
    CORE = 'core',
    COMMUNITY = 'community',
}

export enum ProposalState {
    ACTIVE = 'active',
    PENDING = 'pending',
    CLOSED = 'closed',
}

export interface Space {
    id: string
    name: string
}

export interface Proposal {
    author: string
    body: string
    choices: string[]
    end: number
    id: string
    snapshot: string
    space: Space
    start: number
    state: ProposalState
    title: string
}

export interface Vote {
    id: string
    voter: string
    created: number
    space: Space
    proposal: {
        choices: Proposal['choices']
    }
    choice: number
    vp: number
}

export interface VotingPower {
    vp: number
    vp_by_strategy: number[]
    vp_state: string
}

export interface VotingState {
    proposalLoadingStatus: FetchStatus
    proposals: {
        [key: string]: Proposal
    }
    voteLoadingStatus: FetchStatus
    votes: {
        [key: string]: Vote[]
    }
    vpLoadingStatus: FetchStatus
    vp: VotingPower
}

export interface LotteryRoundUserTickets {
    isLoading?: boolean
    tickets?: LotteryTicket[]
}

interface LotteryRoundGenerics {
    isLoading?: boolean
    lotteryId: string
    status: LotteryStatus
    startTime: string
    endTime: string
    treasuryFee: string
    firstTicketId: string
    lastTicketId: string
    finalNumber: number
}

export interface LotteryRound extends LotteryRoundGenerics {
    userTickets?: LotteryRoundUserTickets
    priceTicketInHelix: BigNumber
    discountDivisor: BigNumber
    amountCollectedInHelix: BigNumber
    helixPerBracket: string[]
    countWinnersPerBracket: string[]
    rewardsBreakdown: string[]
}

export interface LotteryResponse extends LotteryRoundGenerics {
    priceTicketInHelix: SerializedBigNumber
    discountDivisor: SerializedBigNumber
    amountCollectedInHelix: SerializedBigNumber
    helixPerBracket: SerializedBigNumber[]
    countWinnersPerBracket: SerializedBigNumber[]
    rewardsBreakdown: SerializedBigNumber[]
}

export interface LotteryState {
    currentLotteryId: string
    maxNumberTicketsPerBuyOrClaim: string
    isTransitioning: boolean
    currentRound: LotteryResponse & { userTickets?: LotteryRoundUserTickets }
    lotteriesData?: LotteryRoundGraphEntity[]
    userLotteryData?: LotteryUserGraphEntity
}

export interface LotteryRoundGraphEntity {
    id: string
    totalUsers: string
    totalTickets: string
    winningTickets: string
    status: LotteryStatus
    finalNumber: string
    startTime: string
    endTime: string
    ticketPrice: SerializedBigNumber
}

export interface LotteryUserGraphEntity {
    account: string
    totalHelix: string
    totalTickets: string
    rounds: UserRound[]
}

export interface UserRound {
    claimed: boolean
    lotteryId: string
    status: LotteryStatus
    endTime: string
    totalTickets: string
    tickets?: LotteryTicket[]
}

// Global state

export interface State {
    achievements: AchievementState
    block: BlockState
    farms: SerializedFarmsState
    pools: PoolsState
    predictions: PredictionsState
    profile: ProfileState
    teams: TeamsState
    voting: VotingState
    lottery: LotteryState
    nftMarket: NftMarketState
}

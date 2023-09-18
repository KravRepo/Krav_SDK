import { useWeb3React } from '@web3-react/core'
import { useRootStore } from '../store/root'
import { useFactory } from '../hook/hookV8/useFactory'
import { QUANTO_API, TEST_CHAIN_ID, TRADE_HISTORY_API } from '../constant/chain'
import type { HistoryData, Quanto } from '../components/Trades/TradeLeft/TradeHistory'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { addDecimals } from '../utils/math'
import type { PoolParams } from '../store/FactorySlice'
import {
  useGetOrderLimit,
  useGetUserOpenLimitOrders,
  useGetUserOpenTrade,
  useApprove,
  useGetUserAllBalance,
  useMaxPositionCheck,
  useTradingV6Contract,
  useBTCPrice,
  useUserPosition,
} from '../hook/hookV8'
import { useRequest } from 'ahooks'
import { getGasLimit } from '../utils'
import { ZERO_ADDRESS } from '../constant/math'
import type { OpenTradeParams } from '../components/Trades/type'

export { addDecimals }
export const useGetSupportedPools = () => {
  const getFactory = useFactory()
  return getFactory
}
export const useSupportedPools = () => {
  const getFactory = useFactory()
  const { provider } = useWeb3React()
  return useRequest(
    async () => {
      return getFactory()
    },
    { manual: false, refreshDeps: [provider] }
  )
}

export const useOrderLimit = (tradePool?: PoolParams) => {
  const { provider } = useWeb3React()
  const getOrderLimit = useGetOrderLimit(tradePool)
  return useRequest(
    async () => {
      return getOrderLimit()
    },
    { manual: false, refreshDeps: [provider, tradePool] }
  )
}

export const useGetOpenTrades = () => {
  const { getUserOpenTrade } = useGetUserOpenTrade()
  return (storageAddress: string) => getUserOpenTrade(storageAddress, false)
}
export const useOpenTrades = (storageAddress?: string) => {
  const { getUserOpenTrade } = useGetUserOpenTrade()
  const { account, provider } = useWeb3React()
  return useRequest(
    async () => {
      if (!storageAddress) return []
      return getUserOpenTrade(storageAddress, false)
    },
    { manual: false, refreshDeps: [storageAddress, account, provider] }
  )
}

export const useGetHistoryTrades = () => {
  // useInit()
  const allPoolParams = useRootStore((state) => state.allPoolParams)
  const { account } = useWeb3React()

  const getTradeHistory = async (tradePool: PoolParams) => {
    try {
      const quantosRequest = await fetch(
        QUANTO_API + `?chainId=${TEST_CHAIN_ID}&offset=0&limit=` + allPoolParams.length
      )
      const quantos = await quantosRequest.json()
      if (Number(quantos.code) === 200) {
        const target = quantos.data.find((quanto: Quanto) => quanto?.tradingT === tradePool?.tradingT)
        const historyRequest = await fetch(
          TRADE_HISTORY_API + `?chainId=${TEST_CHAIN_ID}&trader=${account}&indexId=${target.indexId}&offset=0&limit=100`
        )
        const history = await historyRequest.json()
        if (history.code === 200) {
          const data: HistoryData[] = history.data
          return data.filter((item: HistoryData) => new BigNumber(item.tradeInitialPosToken).isGreaterThan(0))
        }
      }
      return []
    } catch (e) {
      console.error('get user trade history failed!', e)
    }
  }
  return getTradeHistory
}
export const useHistoryTrades = (tradePool?: PoolParams) => {
  const getHistoryTrades = useGetHistoryTrades()
  const { account, provider } = useWeb3React()
  return useRequest(
    async () => {
      if (!tradePool) return []
      return getHistoryTrades(tradePool)
    },
    { manual: false, refreshDeps: [tradePool, account, provider] }
  )
}

export const usePoolInfo = (address?: string) => {
  const { allPoolParams } = useRootStore(({ allPoolParams }) => ({ allPoolParams }))
  return useMemo(() => allPoolParams.find((pool) => pool.tradingT === address), [address, allPoolParams])
}

export const useAvaliableLiquidity = (address?: string) => {
  return usePoolInfo(address)?.poolCurrentBalance
}

export const useAvaliableBalance = (tradePoolAddress?: string) => {
  const getUserAllBalance = useGetUserAllBalance()
  const getUserPosition = useUserPosition()
  const { account, provider } = useWeb3React()
  const { userPositionDatas, allPoolParams } = useRootStore(({ userPositionDatas, allPoolParams }) => ({
    userPositionDatas,
    allPoolParams,
  }))
  useEffect(() => {
    getUserAllBalance()
    getUserPosition()
  }, [provider, account, allPoolParams])

  const balance = useMemo(() => {
    return userPositionDatas.find((item) => item.pool?.tradingT === tradePoolAddress)?.walletBalance ?? new BigNumber(0)
  }, [tradePoolAddress, userPositionDatas, allPoolParams.length])
  return balance
}

export const useTradeBeforeActions = (tradePool?: PoolParams) => {
  const maxPositionCheck = useMaxPositionCheck()
  const contractApprove = useApprove(tradePool?.tokenT, tradePool?.tradingT, tradePool?.storageT)
  const check = async ({ positionSizeDai, leverage }: { positionSizeDai: BigNumber; leverage: number }) => {
    const passCheck = await maxPositionCheck(positionSizeDai, leverage)
    return passCheck
  }
  const approve = async ({ positionSizeDai, decimal }: { positionSizeDai: BigNumber; decimal: number }) => {
    await contractApprove(() => {}, addDecimals(positionSizeDai, decimal))
  }
  return {
    check,
    approve,
  }
}

export const useConfirmTrade = (tradingAddress?: string) => {
  const contract = useTradingV6Contract(tradingAddress || '')
  const { getUserOpenTrade } = useGetUserOpenTrade()
  const { getUserOpenLimitOrders } = useGetUserOpenLimitOrders()
  return async (options?: Omit<OpenTradeParams, 'tradingAddress'>) => {
    const {
      tuple,
      tradeType,
      slippageP,
      referral = ZERO_ADDRESS,
      spreadReductionId = 0,
      storageAddress,
    } = options || {}
    if (!contract || !storageAddress || !tuple) return
    // try {
    const params = [tuple, tradeType, spreadReductionId, slippageP, referral] as any

    let gasLimit = await getGasLimit(contract, 'openTrade', params)
    gasLimit = new BigNumber(gasLimit.toString()).times(1.1)

    const tx = await contract.openTrade(...params, { gasLimit: gasLimit.toFixed(0) })
    console.log('tx', await tx.wait())
    if (tradeType === 0) {
      await getUserOpenTrade(storageAddress, true)
    } else {
      await getUserOpenLimitOrders(storageAddress, true)
    }
    // } catch (e: any) {
    //   console.error('Open Trade failed!', e)
    // }
  }
}

export const useClaimTrade = (tradingAddress?: string) => {
  const contract = useTradingV6Contract(tradingAddress || '')
  return async (orderId: BigNumber, isClosePosition: boolean) => {
    if (!contract) return
    const params = [orderId.toNumber()] as any
    let gasLimit = await getGasLimit(
      contract,
      isClosePosition ? 'closeTradeMarketTimeout' : 'openTradeMarketTimeout',
      params
    )
    gasLimit = new BigNumber(gasLimit.toString()).times(1.1)
    let tx: any
    if (isClosePosition) {
      tx = await contract.closeTradeMarketTimeout(...params, { gasLimit: gasLimit.toFixed(0) })
    } else tx = await contract.openTradeMarketTimeout(...params, { gasLimit: gasLimit.toFixed(0) })

    const closeTradeMarketTX = await tx.wait()
    console.log('tx', closeTradeMarketTX)
  }
}

export const useCloseTrade = (tradingAddress?: string) => {
  const contract = useTradingV6Contract(tradingAddress || '')
  const { getUserOpenTrade } = useGetUserOpenTrade()
  return async ({
    orderIndex,
    pairIndex = 0,
    storageAddress,
  }: {
    orderIndex: number
    pairIndex?: number
    storageAddress: string
  }) => {
    if (!contract) return
    const params = [pairIndex, orderIndex] as any
    let gasLimit = await getGasLimit(contract, 'closeTradeMarket', params)
    gasLimit = new BigNumber(gasLimit.toString()).times(1.1)
    const tx = await contract.closeTradeMarket(...params, { gasLimit: gasLimit.toFixed(0) })
    const closeTradeMarketTX = await tx.wait()
    console.log('tx', closeTradeMarketTX)
    const close = await getUserOpenTrade(storageAddress, true)
    console.log('close tx ', close)
  }
}

export const useGetOpenLimitOrders = () => {
  const { getUserOpenLimitOrders } = useGetUserOpenLimitOrders()
  return (storageAddress: string) => getUserOpenLimitOrders(storageAddress, false)
}

export const useOpenLimitOrders = (storageAddress?: string) => {
  const { getUserOpenLimitOrders } = useGetUserOpenLimitOrders()
  const { account, provider } = useWeb3React()
  return useRequest(
    async () => {
      if (!storageAddress) return []
      return getUserOpenLimitOrders(storageAddress, false)
    },
    { manual: false, refreshDeps: [storageAddress, account, provider] }
  )
}

export const useCancelLimitOrder = (tradingAddress: string) => {
  const contract = useTradingV6Contract(tradingAddress)
  const { getUserOpenLimitOrders } = useGetUserOpenLimitOrders()
  return async ({
    orderIndex,
    pairIndex = 0,
    storageAddress,
  }: {
    orderIndex: number
    pairIndex?: number
    storageAddress: string
  }) => {
    if (!contract) return
    try {
      const params = [pairIndex, orderIndex] as any
      let gasLimit = await getGasLimit(contract, 'cancelOpenLimitOrder', params)
      gasLimit = new BigNumber(gasLimit.toString()).times(1.1)
      const tx = await contract.cancelOpenLimitOrder(...params, { gasLimit: gasLimit.toFixed(0) })
      console.log('tx', await tx.wait())
      const close = await getUserOpenLimitOrders(storageAddress, true)
      console.log('close tx', close)
    } catch (e: any) {
      console.error('useCancelOpenLimitOrder err', JSON.stringify(e))
    }
  }
}

export const useGetBTCPrice = useBTCPrice

export const useUpdateTrade = (tradingAddress: string) => {
  const contract = useTradingV6Contract(tradingAddress || '')
  return async ({
    type,
    pairIndex = 0,
    orderIndex,
    price,
  }: {
    type: 'stopLoss' | 'takeProfit'
    price: BigNumber
    orderIndex: number
    pairIndex?: number
  }) => {
    if (!contract) return
    try {
      const func = type === 'stopLoss' ? 'updateSl' : 'updateTp'
      const params = [pairIndex, orderIndex, price.times(Number(1e10)).toString()] as any
      let gasLimit = await getGasLimit(contract, func, params)
      gasLimit = new BigNumber(gasLimit.toString()).times(1.1)
      const tx = await contract[func](...params, { gasLimit: gasLimit.toFixed(0) })
      const closeTradeMarketTX = await tx.wait()
      console.log('tx', closeTradeMarketTX)
    } catch (e) {
      console.error(e)
    }
  }
}

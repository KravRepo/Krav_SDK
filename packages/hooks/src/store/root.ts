import type { WalletSlice } from './walletSlice'
import { createWalletSlice } from './walletSlice'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { create } from 'zustand'
import type { TransactionSlice } from './TransactionSlice'
import { createTransactionSlice } from './TransactionSlice'
import type { FactorySlice } from './FactorySlice'
import { createFactorySlice } from './FactorySlice'
import type { TradeSlice } from './TradeSlice'
import { createTradeSlice } from './TradeSlice'

export type RootStore = WalletSlice & TransactionSlice & FactorySlice & TradeSlice

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createWalletSlice(...args),
        ...createTransactionSlice(...args),
        ...createFactorySlice(...args),
        ...createTradeSlice(...args),
      }
    })
  )
)

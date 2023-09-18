import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { useGetSupportedPools } from './hooks'
import { useWeb3React } from '@web3-react/core'
import { useAsyncEffect } from 'ahooks'

export interface IMainContext {}

export const MainContext = createContext<IMainContext | null>(null)

export const useMainContext = () => {
  const context = useContext(MainContext)
  if (context === null) {
    throw new Error('You must add a <KravProvider> into the React tree')
  }
  return context
}

export const KravProvider = ({ children }: { children: ReactNode }) => {
  useInit()
  const value = useMemo<IMainContext>(() => ({}), [])
  return <MainContext.Provider value={value}>{children!}</MainContext.Provider>
}

const useInit = () => {
  const getTokens = useGetSupportedPools()
  const { provider } = useWeb3React()
  useAsyncEffect(async () => {
    await getTokens()
  }, [provider])
}

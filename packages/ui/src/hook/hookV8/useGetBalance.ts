import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useTokenContract } from './useContract'
import { useRootStore } from '../../store/root'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import test_erc20 from '../../abi/test_erc20.json'
import { eXDecimals } from '../../utils/math'

export const useGetBalance = () => {
  const account = useRootStore((store) => store.account)
  const test_erc20_contract = useTokenContract()!
  return useCallback(async () => {
    try {
      if (!account) return new BigNumber(0)
      else {
        const balance = await test_erc20_contract.balanceOf(account)
        return new BigNumber(balance._hex).div(new BigNumber(10).pow(18))
      }
    } catch (e) {
      console.error('get balance failed', e)
      return new BigNumber(0)
    }
  }, [account, test_erc20_contract])
}

export const useGetUserAllBalance = () => {
  const { account, provider } = useWeb3React()
  const allPoolParams = useRootStore((store) => store.allPoolParams)
  const userPositionDatas = useRootStore((store) => store.userPositionDatas)
  const setUserPositionDatas = useRootStore((store) => store.setUserPositionDatas)
  const balanceTask = [] as any
  return async () => {
    try {
      if (allPoolParams.length > 0 && account && provider) {
        allPoolParams.forEach((pool) => {
          const tokenContract = new Contract(pool.tokenT, test_erc20.abi, provider)
          balanceTask.push(tokenContract.balanceOf(account))
        })
        try {
          const newUserPositionDatas = userPositionDatas
          const userAllBalance = await Promise.allSettled(balanceTask)
          allPoolParams.forEach((pool, index) => {
            if (userAllBalance[index].status === 'fulfilled') {
              console.error('fulfilled', userAllBalance[index])
              // @ts-ignore
              newUserPositionDatas[index] ||= {}
              newUserPositionDatas[index].walletBalance = eXDecimals(userAllBalance[index].value._hex, pool.decimals)
            } else {
              console.error(userAllBalance[index])
            }
          })
          setUserPositionDatas(newUserPositionDatas)
          return newUserPositionDatas
        } catch (e) {
          console.error('send balance task failed!', e)
        }
      }
    } catch (e) {
      console.error('get user all balance failed!', e)
    }
  }
}

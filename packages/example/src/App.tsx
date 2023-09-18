import { useEffect, useState } from 'react'
import {
	useSupportedPools,
	useOpenTrades,
	useOpenLimitOrders,
	useHistoryTrades,
	usePoolInfo,
	useAvaliableBalance,
	useAvaliableLiquidity,
	useOrderLimit,
	useCloseTrade,
	useClaimTrade,
	useTradeBeforeActions,
	useConfirmTrade,
	useCancelLimitOrder,
	useGetBTCPrice,
	useUpdateTrade,
} from 'krav-sdk-beta'

import { useRequest } from 'ahooks'
import { useWeb3React } from '@web3-react/core'
import { Container, JSONItem } from './components'
import BigNumber from 'bignumber.js'
const STORAGE_ADDRESS = '0xCa14274EfC3b73A536e799c01E0b97c687E23454'
function App() {
	const web3 = useWeb3React()
	const { account } = web3
	useEffect(() => {
		web3.connector.activate()
	}, [])
	const { data: supportedPools } = useSupportedPools()
	const tradePool = supportedPools?.find((item) => item.symbol === 'KRAV')
	const poolInfo = usePoolInfo(tradePool?.tradingT)

	const avaliableBalance = useAvaliableBalance(tradePool?.tradingT)

	const avaliableLiquidity = useAvaliableLiquidity(tradePool?.tradingT)

	const { data: orderLimit } = useOrderLimit(tradePool)

	const { data: openTrades } = useOpenTrades(tradePool?.storageT)

	const { data: openLimitOrders } = useOpenLimitOrders(tradePool?.storageT)

	const { data: historyTrades } = useHistoryTrades(tradePool)

	const closeTrade = useCloseTrade(tradePool?.tradingT)

	const claimTrade = useClaimTrade(tradePool?.tradingT)

	const cancelLimitOrder = useCancelLimitOrder(tradePool?.tradingT || '')

	const { check, approve } = useTradeBeforeActions(tradePool)

	const [checked, setChecked] = useState(false)
	const limitPrice = '20000'
	const tradeType = 0
	const confirmTrade = useConfirmTrade(tradePool?.tradingT)
	const updateTrade = useUpdateTrade(tradePool?.tradingT || '')
	const getBTCPrice = useGetBTCPrice()
	const { data: BTCPrice } = useRequest(async () => getBTCPrice(), { manual: false })
	return (
		<>
			<div className="flex items-center p-4">
				<button
					onClick={async () => {
						if (!tradePool) return

						await check({ positionSizeDai: String(1500 * 1e18), leverage: 2 })
						await approve({
							positionSizeDai: String(1500 * 1e18),
							decimal: tradePool?.decimals,
						})
						await confirmTrade({
							tradeType,
							referral: '0x0000000000000000000000000000000000000000',
							storageAddress: tradePool.storageT,
							spreadReductionId: 0,
							slippageP: checked ? '10400000000' : '3399999999',
							tuple: {
								trader: account!,
								// sl: addDecimals(targetSl, 10).toFixed(0),
								// tp: addDecimals(targetTp, 10).toFixed(0),
								sl: '0',
								tp: '0',
								pairIndex: 0,
								// openPrice: addDecimals(tradeType === 0 ? BTCPrice : limitPrice, 10).toString(),
								openPrice: new BigNumber('25899')
									.multipliedBy(new BigNumber(10).pow(10))
									.toString(),
								leverage: 2,
								initialPosToken: 0,
								index: 0,
								buy: true,
								// positionSizeDai: addDecimals('1500', tradePool?.decimals || 0),
								positionSizeDai: String('1500000000000000000000'),
							},
						})
					}}
				>
					Open Trade
				</button>
			</div>
			<Container title="usePoolInfo">
				<JSONItem data={poolInfo} />
			</Container>
			<Container title="useSupportedPools">
				<JSONItem data={supportedPools} />
			</Container>
			<Container title="useOrderLimit">{orderLimit?.toString()}</Container>
			<Container title="useAvaliableLiquidity">{avaliableLiquidity?.toString()}</Container>
			<Container title="useAvaliableBalance">{avaliableBalance?.toString()}</Container>
			<Container title="useOpenTrades">
				<div className="flex gap-4">
					{openTrades?.map((item, i) => (
						<JSONItem
							key={i}
							data={item}
							extra={
								item.isPendingOrder && item.leverage > 0 && item.orderId ? (
									<button
										onClick={() => {
											claimTrade(item.orderId!, true)
										}}
									>
										Cliam
									</button>
								) : (
									<button
										onClick={() => {
											if (!poolInfo) return
											closeTrade({ storageAddress: poolInfo.storageT, orderIndex: item.index })
										}}
									>
										Close
									</button>
								)
							}
						/>
					))}
				</div>
			</Container>
			<Container title="useOpenLimitOrders">
				<div className="flex gap-4">
					{openLimitOrders?.map((item, i) => (
						<JSONItem
							key={i}
							data={item}
							extra={
								<button
									onClick={() => {
										cancelLimitOrder({ storageAddress: STORAGE_ADDRESS, orderIndex: item.index })
									}}
								>
									Cancel
								</button>
							}
						/>
					))}
				</div>
			</Container>
			<Container title="useHistoryTrades">
				<div className="flex gap-4">
					{historyTrades?.map((item, i) => (
						<JSONItem key={i} data={item} />
					))}
				</div>
			</Container>
			<Container title="BTCPrice">{BTCPrice?.toString()}$</Container>
		</>
	)
}

export default App

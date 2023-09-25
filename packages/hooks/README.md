# Krav SDK

## Hooks

- useSupportedPools - Get supported pools
- usePoolInfo - Get pool information
- useAvailableBalance - Get available token balance for trading
- useAvailableLiquidity - Get available liquidity for trading
- useOrderLimit - Get order size limit for a pool
- useOpenTrades - Get open trades
- useOpenLimitOrders - Get open limit orders
- useHistoryTrades - Get historical trades
- useCloseTrade - Close an open trade
- useClaimTrade - Claim funds from a closed trade
- useCancelLimitOrder - Cancel a limit order
- useTradeBeforeActions - Check and approve trade authorization
- useConfirmTrade - Execute a trade
- useGetBTCPrice - Get Bitcoin price from an oracle
- useUpdateTrade

### useSupportedPools

This hook is used to get the supported pools. Returns an array of supported pools.

```tsx
const { data: supportedPools } = useSupportedPools()
```

### usePoolInfo

This hook is used to get information about a given pool.

```tsx
const poolInfo = usePoolInfo(tradePool?.tradingT)
```

Parameters:

- tradingT: Trading contract address of the pool

### useAvailableBalance

This hook is used to get the available balance of the trading contract for a given pool.

```tsx
const availableBalance = useAvailableBalance(tradePool?.tradingT)
```

Parameters:

- tradingT: Trading contract address of the pool

### useAvailableLiquidity

This hook is used to get the available liquidity for a given pool.

```tsx
const availableLiquidity = useAvailableLiquidity(tradePool?.tradingT)
```

Parameters:

- tradingT: Trading contract address of the pool

### useOrderLimit

This hook is used to get the order limit for a given pool.

```tsx
const { data: orderLimit } = useOrderLimit(tradePool)
```

Parameters:

- tradePool: Pool object

### useOpenTrades

This hook is used to get the open trade records for a given pool.

```tsx
const { data: openTrades } = useOpenTrades(tradePool?.storageT)
```

Parameters:

- storageT: Storage contract address of the pool

### useOpenLimitOrders

This hook is used to get the open limit orders for a given pool.

```tsx
const { data: openLimitOrders } = useOpenLimitOrders(tradePool?.storageT)
```

Parameters:

- storageT: Storage contract address of the pool

### useHistoryTrades

This hook is used to get the historical trade records for a given pool.

```tsx
const { data: historyTrades } = useHistoryTrades(tradePool)
```

Parameters:

- tradePool: Pool object

### useCloseTrade

This hook is used to close an open trade for a given pool.

```tsx
const closeTrade = useCloseTrade(tradePool?.tradingT)
```

Parameters:

- tradingT: Trading contract address of the pool

### useClaimTrade

This hook is used to claim funds from a closed trade.

```tsx
const claimTrade = useClaimTrade(tradePool?.tradingT)
```

Parameters:

- tradingT: Trading contract address of the pool

### useCancelLimitOrder

This hook is used to cancel a limit order for a given pool.

```tsx
const cancelLimitOrder = useCancelLimitOrder(tradePool?.tradingT || '')
```

Parameters:

- tradingT: Trading contract address of the pool

### useTradeBeforeActions

This hook is used to check and approve trade authorization before executing a trade.

```tsx
const { check, approve } = useTradeBeforeActions(tradePool)
```

Parameters:

- tradePool: Pool object

### useConfirmTrade

This hook is used to confirm a trade for a given pool.

```tsx
const confirmTrade = useConfirmTrade(tradePool?.tradingT)
```

Parameters:

- tradingT: Trading contract address of the pool

### useGetBTCPrice

This hook is used to get the current price of Bitcoin.

```tsx
const getBTCPrice = useGetBTCPrice()
const { data: BTCPrice } = useRequest(async () => getBTCPrice(), { manual: false })
```

### useUpdateTrade

This hook is used to get the current price of Bitcoin.

```tsx
const updateTrade = useUpdateTrade(tradePool?.tradingT)
```

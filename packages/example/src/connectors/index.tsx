import { Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import { hooks as metaMaskHooks, metaMask } from "./metaMask";
import React from "react";
import { MetaMask } from "@web3-react/metamask";
// import useEagerlyConnect from '../hook/hookV8/useEagerlyConnect'

const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, metaMaskHooks]];

export function Web3Provider({ children }: { children: React.ReactNode }) {
  // useEagerlyConnect()
  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>;
}

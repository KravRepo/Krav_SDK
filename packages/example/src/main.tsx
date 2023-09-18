import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from './connectors/index'
import 'uno.css'
import { KravProvider } from 'krav-sdk-beta'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<Web3Provider>
		<KravProvider>
			<App />
		</KravProvider>
	</Web3Provider>,
)

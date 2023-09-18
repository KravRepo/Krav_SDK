import presetUno from '@unocss/preset-uno'
import type { UserConfig } from 'unocss'
import { defineConfig, presetIcons } from 'unocss'

const baseUnoConfig: UserConfig = defineConfig({
	presets: [
		presetUno(),
		presetIcons({
			extraProperties: {
				cursor: 'pointer',
			},
		}),
	],
	rules: [
		[
			/^ellipsis-(\d+)$|^ellipsis$/,
			([_, d]) => {
				if (d) {
					return {
						display: '-webkit-box',
						overflow: 'hidden',
						'word-break': 'break-all',
						'-webkit-line-clamp': d,
						'-webkit-box-orient': 'vertical',
					}
				}
				return {
					'text-overflow': 'ellipsis',
					'white-space': 'nowrap',
					'word-break': 'break-all',
					overflow: 'hidden',
				}
			},
		],
		[
			/^animation-delay-(\d+)$/,
			([_, d]) => ({
				'animation-delay': d + 'ms',
			}),
		],
		[
			/^animation-duration-(\d+)$/,
			([_, d]) => ({
				'animation-duration': d + 'ms',
			}),
		],
	],
	shortcuts: {
		'flex-center': 'flex justify-center items-center',
	},
	theme: {
		colors: {
			primary: 'var(--color-primary)',
			secondary: 'var(--color-secondary)',
		},
		height: {},
	},
	safelist: [],
})

export default baseUnoConfig

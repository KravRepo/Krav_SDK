import type { ReactNode } from 'react'

interface JSONItemProps {
	data?: {}
	extra?: ReactNode
}

export const JSONItem = (props: JSONItemProps) => {
	const { data, extra, ...rest } = props
	return (
		<div className="break-all flex gap-4 items-center">
			<code>{JSON.stringify(data, null, 4)}</code> <div className="flex-shrink-0">{extra}</div>
		</div>
	)
}

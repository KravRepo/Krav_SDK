import type { ReactNode } from 'react'

interface ContainerProps {
	title: ReactNode
	children: ReactNode
}

export const Container = (props: ContainerProps) => {
	const { title, children, ...rest } = props
	return (
		<section className="mb-5 b-2 b-solid b-#e1e4e8 p-6 rounded-3">
			<h2>{title}</h2>
			<div>{children}</div>
		</section>
	)
}

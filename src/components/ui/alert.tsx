import * as React from "react"

import { cn } from "@/lib/utils"

function Alert({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			role="alert"
			data-slot="alert"
			className={cn(
				"relative w-full rounded-lg border bg-background text-foreground shadow-xs",
				"px-4 py-3",
				className
			)}
			{...props}
		/>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
	return (
		<h5
			data-slot="alert-title"
			className={cn("mb-1 font-medium leading-none tracking-tight", className)}
			{...props}
		/>
	)
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}

export { Alert, AlertTitle, AlertDescription }

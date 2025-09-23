import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"

// Simple field name context to allow label, control, and message to know the field
const FormFieldContext = React.createContext<{ name: string } | null>(null)

function useFormFieldName() {
	const ctx = React.useContext(FormFieldContext)
	if (!ctx) {
		throw new Error("Form components must be used within a <FormField> context")
	}
	return ctx.name
}

function getErrorByPath(errors: unknown, path: string): unknown {
	if (!errors) return undefined
	return path
		.split(".")
		.reduce<any>((acc, key) => (acc && typeof acc === "object" ? (acc as any)[key] : undefined), errors)
}

const Form = FormProvider

function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
	props: ControllerProps<TFieldValues, TName>
) {
	return (
		<FormFieldContext.Provider value={{ name: String(props.name) }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="form-item" className={cn("space-y-2", className)} {...props} />
}

function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
	const name = useFormFieldName()
	return <label htmlFor={name} data-slot="form-label" className={cn("text-sm font-medium", className)} {...props} />
}

function FormControl({ className, ...props }: React.ComponentProps<typeof Slot>) {
	const name = useFormFieldName()
	const { formState } = useFormContext()
	const error = getErrorByPath(formState.errors, name) as any

	return (
		<Slot
			id={name}
			aria-invalid={Boolean(error)}
			data-slot="form-control"
			className={className}
			{...props}
		/>
	)
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
	const name = useFormFieldName()
	const { formState } = useFormContext()
	const error = getErrorByPath(formState.errors, name) as any
	const message: React.ReactNode = children ?? (error?.message as React.ReactNode)

	if (!message) return null
	return (
		<p data-slot="form-message" className={cn("text-sm text-destructive", className)} {...props}>
			{message}
		</p>
	)
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
	return <p data-slot="form-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } 

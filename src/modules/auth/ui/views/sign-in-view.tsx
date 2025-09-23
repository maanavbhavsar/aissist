"use client";


import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import{useForm} from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

import{Button} from "@/components/ui/button";
import{Input} from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import{Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {message: "Password required"}),
});



export const SignInView = () => {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setPending(true);
        setError(null);
        try {
            await authClient.signIn.email({email: data.email, password: data.password});
            setPending(false);
            router.push("/");
        } catch (error) {
            const message = error instanceof Error ? String(error.message ?? "") : String(error ?? "");
            // Basic heuristics to set field-specific errors
            if (/email/i.test(message) && !/password/i.test(message)) {
                form.setError("email", { message: "Invalid email" });
            } else if (/password/i.test(message)) {
                form.setError("password", { message: "Invalid password" });
            } else {
                // Fallback: most providers return generic credentials error; show on password field
                form.setError("password", { message: "Invalid email or password" });
            }
        }
    };
    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2"> 
                    <div className="p-4">
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">
                                        Welcome back
                                    </h1>
                                    <p className="text-balance text-muted-foreground">
                                        Login to your account
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="m@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={pending}>
                                    Sign In  
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:insert-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-background px-2 text-muted-foreground relative z-10 px-4">
                                        Or continue with
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button disabled={pending} variant="outline" type="button" className="w-full">
                                        Google
                                    </Button>
                                    <Button disabled={pending} variant="outline" type="button" className="w-full">
                                        GitHub
                                    </Button>
                                </div>
                                <div className="text-center text-sm text-muted-foreground">
                                    Don't have an account? <Link href="/sign-up" className="text-primary underline-offset-4 hover:underline">Sign Up</Link>
                                </div>
                            </div>
                        </form>
                        </Form>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-700 to-cyan-900 relative flex flex-col gap-y-4 justify-center items-center p-4">
                        <img src="/aissist-logo.png" alt="AISSIST" className="h-[375px] w-[375px]" />
                    </div>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-sm text-balance *:[a]:underline-offset-4 *:[a]:hover:underline">
                &copy; {new Date().getFullYear()} AISSIST. All rights reserved.
            </div>
        </div>
    );
};
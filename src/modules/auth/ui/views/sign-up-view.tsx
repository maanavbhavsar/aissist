"use client";


import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import{useForm} from "react-hook-form";
import { useState } from "react";
import React from "react";

import{Button} from "@/components/ui/button";
import{Input} from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import{Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation";
import {FaGoogle, FaGithub} from "react-icons/fa";
const formSchema = z
    .object({
        name: z.string().min(1, {message: "Name required"}),
        email: z.string().email(),
        password: z.string().min(1, {message: "Password required"}),
        confirmPassword: z.string().min(1, {message: "Confirm your password"}),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });



export const SignUpView = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setPending(true);
        setError(null);
        try {
            await authClient.signUp.email({name: data.name, email: data.email, password: data.password, callbackURL: "/dashboard"});
            setPending(false);
            router.push("/dashboard");       
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

    const onSocial = (provider: "google" | "github") => {
        authClient.signIn.social({
            provider: provider, 
            callbackURL: "/dashboard"
        },
        {
            onSuccess: () => {
                setPending(false);
            },
            onError: (error) => {
                setPending(false);
                const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as {message: string}).message : 'Authentication failed';
                setError(errorMessage);
            }
        }
    );
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
                                        Let's get you started
                                    </h1>
                                    <p className="text-balance text-muted-foreground">
                                        Create your account
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="re-enter password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white" disabled={pending}>
                                    Sign Up  
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:insert-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-background px-2 text-muted-foreground relative z-10 px-4">
                                        Or continue with
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button disabled={pending} onClick={() => authClient.signIn.social({provider: "google"})} variant="outline" type="button" className="w-full">
                                        <FaGoogle />
                                    </Button>
                                    <Button disabled={pending} onClick={() => authClient.signIn.social({provider: "github"})} variant="outline" type="button" className="w-full">
                                        <FaGithub />
                                    </Button>
                                </div>
                                <div className="text-center text-sm text-muted-foreground">
                                    Already have an account? <Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">Sign In</Link>
                                </div>
                            </div>
                        </form>
                        </Form>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-700 to-cyan-900 relative flex flex-col gap-y-4 justify-center items-center p-4">
                        <img src="/aissist_colored_only.png" alt="AISSIST" className="h-[100px] w-[100px] hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-300 cursor-pointer" />
                    </div>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-sm text-balance *:[a]:underline-offset-4 *:[a]:hover:underline">
                &copy; {new Date().getFullYear()} AISSIST. All rights reserved.
            </div>
        </div>
    );
};
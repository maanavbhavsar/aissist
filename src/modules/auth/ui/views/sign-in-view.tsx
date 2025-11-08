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
import {FaGoogle, FaGithub, FaLinkedin} from "react-icons/fa";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {message: "Password required"}),
});



export const SignInView = () => {

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const router = useRouter();
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setPending(true);
        setError(null);
        try {
            await authClient.signIn.email({email: data.email, password: data.password, callbackURL: "/dashboard"});
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
        <div className="flex flex-col gap-4 md:gap-6 w-full">
            <Card className="overflow-hidden p-0 w-full max-w-5xl mx-auto">
                <CardContent className="grid p-0 md:grid-cols-[1fr_1.5fr]"> 
                    <div className="bg-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
                        <div className="w-full max-w-sm">
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 md:gap-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                        Welcome
                                    </h1>
                                    <img src="/aissist_colored_only.png" alt="AISSIST" className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Sign in to continue your AISSIST journey
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                            <FormLabel className="text-gray-800">Email</FormLabel>
                                                <FormControl>
                                                <Input type="email" placeholder="m@example.com" className="bg-gray-100 border-gray-300" {...field} />
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
                                            <FormLabel className="text-gray-800">Password</FormLabel>
                                                <FormControl>
                                                <Input type="password" placeholder="********" className="bg-gray-100 border-gray-300" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300" disabled={pending}>
                                    Sign In  
                                </Button>
                            <div className="relative text-center text-sm">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-700"></span>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-slate-400 rounded-full border border-slate-300">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <Button disabled={pending} onClick={() => authClient.signIn.social({provider: "google"})} variant="outline" type="button" className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 text-white border-cyan-500/30 hover:border-cyan-500/50 text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/20">
                                    <FaGoogle className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                                    <span className="truncate">Google</span>
                                    </Button>
                                <Button disabled={pending} onClick={() => authClient.signIn.social({provider: "github"})} variant="outline" type="button" className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 text-white border-cyan-500/30 hover:border-cyan-500/50 text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/20">
                                    <FaGithub className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                                    <span className="truncate">GitHub</span>
                                    </Button>
                                </div>
                            <div className="text-center text-sm text-gray-600">
                                Don&apos;t have an account? <Link href="/sign-up" className="text-cyan-400 underline-offset-4 hover:underline font-medium hover:text-cyan-300">Sign up</Link>
                            </div>
                        </form>
                        </Form>
                        </div>
                    </div>
                    <div className="hidden md:flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative flex-col gap-4 md:gap-6 p-6 md:p-8 overflow-y-auto max-h-screen">
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative h-16 w-16 md:h-20 md:w-20 logo-glow overflow-hidden flex items-start justify-center">
                                <img 
                                    src="/aissist_colored_only.png" 
                                    alt="AISSIST Logo" 
                                    className="logo-icon-only h-full w-full" 
                                />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AISSIST</h2>
                            <p className="text-xs md:text-sm text-slate-300">AI-powered meeting assistant ❤️</p>
                        </div>
                        
                            <div className="flex flex-col gap-3 md:gap-4">
                            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                                <h3 className="text-base md:text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    ✨ Maanav Bhavsar
                                </h3>
                                <p className="text-slate-300 text-xs md:text-sm mb-1">I&apos;m an AI/ML Engineer and Full-Stack Developer</p>
                                <p className="text-cyan-400 text-xs md:text-sm font-medium">Building scalable AI systems and intelligent automation solutions for real-world impact. 🚀</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                                <h3 className="text-base md:text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    💻 What is AISSIST?
                                </h3>
                                <p className="text-slate-300 text-xs md:text-sm mb-3">
                                    Full-stack SaaS where AI meets video meetings. Create custom AI agents that join your calls, participate in real-time, and provide multilingual support with live translation.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 md:px-3 py-1 bg-cyan-600/30 text-white text-xs rounded-full border border-cyan-500/30">Real-time AI</span>
                                    <span className="px-2 md:px-3 py-1 bg-cyan-600/30 text-white text-xs rounded-full border border-cyan-500/30">LLM Applications</span>
                                    <span className="px-2 md:px-3 py-1 bg-cyan-600/30 text-white text-xs rounded-full border border-cyan-500/30">Scalable Systems</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                                <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                                    ✨ Tech Stack
                                </h3>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">Python</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">PyTorch</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">TensorFlow</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">Next.js</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">React</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">TypeScript</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">Node.js</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">PostgreSQL</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">Drizzle ORM</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">AWS</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">Docker</span>
                                    <span className="px-2 md:px-3 py-1 bg-slate-700/60 text-white text-xs rounded-full border border-cyan-500/20">LangChain</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                                <h3 className="text-base md:text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    🏆 Key Achievements
                                </h3>
                                <p className="text-slate-300 text-xs md:text-sm mb-2">
                                    Reduced manual effort by 40% and boosted task completion by 25% through AI-powered automation tools.
                                </p>
                                <p className="text-slate-300 text-xs md:text-sm">
                                    Built and deployed scalable video analytics and SaaS AI platforms supporting 1,000+ concurrent streams/users with cost-efficient cloud scaling.
                                </p>
                            </div>
                        </div>
                        
                        {/* Social Media Links */}
                        <div className="mt-auto pt-4 flex items-center justify-center gap-4">
                            <a 
                                href="https://www.linkedin.com/in/maanavbhavsar/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-cyan-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="LinkedIn Profile"
                            >
                                <FaLinkedin className="w-5 h-5 text-slate-300 hover:text-cyan-400 transition-colors" />
                            </a>
                            <a 
                                href="https://github.com/maanavbhavsar" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-cyan-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="GitHub Profile"
                            >
                                <FaGithub className="w-5 h-5 text-slate-300 hover:text-cyan-400 transition-colors" />
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs sm:text-sm text-balance *:[a]:underline-offset-4 *:[a]:hover:underline">
                &copy; {new Date().getFullYear()} AISSIST. All rights reserved.
            </div>
        </div>
    );
};
import type { AgentGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { agentsInsertSchema } from "../../schemas";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import{ Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

const getAgentEmoji = (name: string) => {
    if (!name) return "🤖";
    
    const emojis = ["🤖", "👨‍💼", "👩‍💼", "🧑‍💻", "👨‍🔬", "👩‍🔬", "🧑‍🎓", "👨‍🏫", "👩‍🏫", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️"];
    const index = name.charCodeAt(0) % emojis.length;
    return emojis[index];
};

interface AgentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialValues: AgentGetOne;
}

export const AgentForm = ({ onSuccess, onCancel, initialValues }: AgentFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [agentName, setAgentName] = useState(initialValues.name);
    const createAgent = useMutation(trpc.agents.create.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions());
            if(initialValues?.id) {
                await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: initialValues.id }));
            }
            onSuccess?.();
        },
        onError: () => {
            toast.error("Failed to create agent");
            // TODO: Handle error, redirect to "/upgrade"
        },
    }));
    
    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValues.name,
            instructions: initialValues.instructions,
        },
    })

    const isEdit = !!initialValues?.id;
    const isPending = createAgent.isPending;

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit) {
            console.log("TODO: Update agent");
        }
        else {
            createAgent.mutate(values, {
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Avatar className="border size-16">
                    <AvatarFallback className="text-2xl">
                        {getAgentEmoji(agentName)}
                    </AvatarFallback>
                </Avatar>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    placeholder="Agent Name" 
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setAgentName(e.target.value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Agent Instructions" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-2">
                    <Button type="submit" disabled={isPending}>{isEdit ? "Update" : "Create"} Agent</Button>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
            </form>
        </Form>
    );
};
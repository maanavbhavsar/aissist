import type { MeetingGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { meetingsInsertSchema } from "../../schemas";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommandSelect } from "@/components/ui/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { FormDescription } from "@/components/ui/form";

interface MeetingFormProps {
    onSuccess: (id?: string) => void;
    onCancel: () => void;
    initialValues: MeetingGetOne;
}

const MeetingForm = ({ onSuccess, onCancel, initialValues }: MeetingFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [agentSearch, setAgentSearch] = useState("");
    const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);

    const { data: agents } = useQuery({
        ...trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch,
        }),
        enabled: true,
    });

    const createMeeting = useMutation(trpc.meetings.create.mutationOptions({
        onSuccess: async (data) => {
            await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            // TODO: invalidate free tier usage
            onSuccess?.(data.id);
        },
        onError: (error) => {
            console.error("Meeting creation error:", error);
            toast.error(`Failed to create meeting: ${error.message || "Unknown error"}`);
        },
    }));

    const updateMeeting = useMutation(trpc.meetings.update.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: initialValues.id }));
            // TODO: invalidate free tier usage
            onSuccess?.();
        },
        onError: (error) => {
            console.error("Meeting update error:", error);
            toast.error(`Failed to update meeting: ${error.message || "Unknown error"}`);
        },
    }));
    
    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues.name,
            agentId: initialValues.agentId,
        },
    })

    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        console.log("Form submitted with values:", values);
        console.log("Is edit mode:", isEdit);
        
        if (isEdit) {
            console.log("Updating meeting...");
            updateMeeting.mutate({ ...values, id: initialValues.id }, {
                onSuccess: () => {
                    console.log("Meeting updated successfully");
                    onSuccess?.();
                },
                onError: (error) => {
                    console.error("Meeting update failed:", error);
                }
            });
        }
        else {
            console.log("Creating new meeting...");
            createMeeting.mutate(values, {
                onSuccess: (data) => {
                    console.log("Meeting created successfully");
                    onSuccess?.(data.id);
                },
                onError: (error) => {
                    console.error("Meeting creation failed:", error);
                }
            });
        }
    }

    return (
        <>
            <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Name</FormLabel>
                            <FormControl className="mt-2">
                                <Input 
                                    {...field} 
                                    placeholder="Math Consultations"
                                    className="h-11"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="agentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Agent</FormLabel>
                            <FormControl className="mt-2">
                                <CommandSelect
                                    options={agents?.items?.map((agent) => ({
                                        id: agent.id,
                                        value: agent.id,
                                        children: (
                                            <div className="flex items-center gap-2">
                                                <GeneratedAvatar
                                                    seed={agent.name}
                                                    variant="bot-neutral"
                                                    className="border w-6 h-6"
                                                />
                                                <span className="font-medium">{agent.name}</span>
                                            </div>
                                        ),
                                    })) || []}
                                    onSelect={field.onChange}
                                    onSearch={setAgentSearch}
                                    value={field.value}
                                    placeholder="Select an agent"
                                />
                            </FormControl>
                            <FormDescription className="mt-2">
                                Did not find the agent you&apos;re looking for?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline font-medium"
                                    onClick={() => setOpenNewAgentDialog(true)}
                                >
                                    Create new agent
                                </button>
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} className="px-6">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300">
                        {isEdit ? "Update" : "Create"} Meeting
                    </Button>
                </div>
                </form>
            </Form>
        </>
    );
};

export { MeetingForm };

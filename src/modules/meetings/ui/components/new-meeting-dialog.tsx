import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "../components/meeting-form";
import { useRouter } from "next/navigation";

interface NewMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const NewMeetingDialog = ({ open, onOpenChange }: NewMeetingDialogProps) => {
    const router = useRouter();

    return (
        <ResponsiveDialog 
            open={open} 
            onOpenChange={onOpenChange} 
            title="Create a new meeting" 
            description="Fill out the form below to schedule a new meeting with your AI agent." 
            showSearch={false}
        >
            <MeetingForm
                onSuccess={(id) => {
                    onOpenChange(false);
                    if (id) {
                        router.push(`/dashboard/meetings/${id}`);
                    }
                }}
                onCancel={() => onOpenChange(false)}
                initialValues={{ 
                    id: "", 
                    name: "", 
                    agentId: "", 
                    userId: "", 
                    status: "upcoming", 
                    startedAt: null, 
                    endedAt: null, 
                    transcriptUrl: null, 
                    recordingUrl: null, 
                    summary: null, 
                    createdAt: "", 
                    updatedAt: "",
                    agent: {
                        id: "",
                        name: ""
                    }
                }}
            />
        </ResponsiveDialog>
    );
};

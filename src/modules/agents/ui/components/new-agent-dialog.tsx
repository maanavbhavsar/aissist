import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";

interface NewAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const NewAgentDialog = ({ open, onOpenChange }: NewAgentDialogProps) => {
    return (
        <ResponsiveDialog 
            open={open} 
            onOpenChange={onOpenChange} 
            title="New Agent" 
            description="Create a new agent" 
            showSearch={false}
            maxContentHeight="max-h-80"
        >
            <AgentForm
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            initialValues={{ id: "", name: "", instructions: "", createdAt: "", updatedAt: "", userId: "", meetingCount: 0 }}
            />
        </ResponsiveDialog>
    );
};

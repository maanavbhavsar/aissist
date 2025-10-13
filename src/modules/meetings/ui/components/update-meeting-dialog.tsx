import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "../components/meeting-form";
import { MeetingGetOneOutput } from "../../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: MeetingGetOneOutput;
}

export const UpdateMeetingDialog = ({ open, onOpenChange, initialValues }: Props) => {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Edit Meeting" description="Edit meeting details" showSearch={false}>
      <MeetingForm
        onSuccess={() => {
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};

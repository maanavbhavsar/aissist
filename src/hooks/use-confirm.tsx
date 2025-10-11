import { useState, type JSX} from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";

export const useConfirm = (
  title: string,
  description: string
): [JSX.Element, () => Promise<boolean>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const confirmationDialog = (
    <ResponsiveDialog
      open={promise !== null}
      onOpenChange={handleClose}
      title={title}
      description={description}
    >
      <div className="flex flex-col-reverse gap-y-2 lg:flex-row lg:gap-x-2 lg:items-center lg:justify-end">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full lg:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          className="w-full lg:w-auto"
        >
          Confirm
        </Button>
      </div>
    </ResponsiveDialog>
  );

  return [confirmationDialog, confirm];
};

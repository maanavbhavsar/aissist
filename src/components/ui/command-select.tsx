import { ReactNode, useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CommandSelectProps {
    options: Array<{
        id: string;
        value: string;
        children: ReactNode;
    }>;
    onSelect: (value: string) => void;
    onSearch?: (value: string) => void;
    value?: string;
    placeholder?: string;
    searchable?: boolean;
    className?: string;
}

export const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder = "Select an option",
    className,
}: CommandSelectProps) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const selectedOption = options.find((option) => option.value === value);

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className={cn(
                    "h-11 justify-between font-normal px-3 w-full",
                    !selectedOption && "text-muted-foreground",
                    className
                )}
                onClick={() => setOpen(true)}
            >
                <div>
                    {selectedOption ? selectedOption.children : placeholder}
                </div>
                <ChevronsUpDownIcon />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogTitle className="sr-only">Select Option</DialogTitle>
                    <div className="space-y-4">
                        <Input 
                            placeholder="Search" 
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                                onSearch?.(e.target.value);
                            }}
                        />
                        <div className="max-h-64 overflow-y-auto">
                            {options.length === 0 ? (
                                <div className="text-muted-foreground text-sm text-center py-4">
                                    No options found.
                                </div>
                            ) : (
                                options.map((option) => (
                                    <div
                                        key={option.id}
                                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                                        onClick={() => {
                                            onSelect(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        {option.children}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

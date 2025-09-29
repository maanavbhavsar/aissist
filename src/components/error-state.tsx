import { AlertCircleIcon } from "lucide-react";

interface Props {
    title: string;
    description: string;
}

export const ErrorState = ({ title, description }: Props) => {
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center h-screen">
            <AlertCircleIcon className="w-10 h-10" />
            <h6 className="text-2xl font-bold">{title}</h6>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        </div>
    );
};
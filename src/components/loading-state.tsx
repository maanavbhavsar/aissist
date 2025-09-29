import { Loader2 } from "lucide-react";

interface Props {
    title: string;
    description: string;
}

export const LoadingState = ({ title, description }: Props) => {
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center h-screen">
            <Loader2 className="w-10 h-10 animate-spin" />
            <h6 className="text-2xl font-bold">{title}</h6>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        </div>
    );
};
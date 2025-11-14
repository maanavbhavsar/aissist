import Image from "next/image";

interface Props {
    title: string;
    description: string;
}

export const LoadingState = ({ title, description }: Props) => {
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Image 
                src="/Science.png" 
                alt="Loading" 
                width={80} 
                height={80}
                className="animate-spin-slow"
                style={{ animationDuration: '3s' }}
            />
            <h6 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{title}</h6>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
        </div>
    );
};
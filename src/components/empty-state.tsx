import Image from "next/image";

interface Props {
    title: string;
    description: string;
    image?: string;
}

export const EmptyState = ({ title, description, image = "/coloredempty.png" }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <Image src={image} alt="Empty State" width={240} height={240} className="mb-8" />
            <div className="flex flex-col gap-y-4 max-w-md">
                <h6 className="text-2xl font-bold text-white">{title}</h6>
                <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
            </div>  
        </div>
    );
};
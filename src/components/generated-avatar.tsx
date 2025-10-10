import { cn } from "@/lib/utils";

interface GeneratedAvatarProps {
  variant?: "bot-neutral" | "bot-blue" | "bot-green" | "bot-purple" | "bot-red";
  seed: string;
  className?: string;
}

const colorVariants = {
  "bot-neutral": "bg-gray-100 text-gray-700",
  "bot-blue": "bg-blue-100 text-blue-700",
  "bot-green": "bg-green-100 text-green-700",
  "bot-purple": "bg-purple-100 text-purple-700",
  "bot-red": "bg-red-100 text-red-700",
};

export function GeneratedAvatar({ 
  variant = "bot-neutral", 
  seed, 
  className 
}: GeneratedAvatarProps) {
  // Generate initials from seed (name)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-medium",
        colorVariants[variant],
        className
      )}
    >
      {getInitials(seed)}
    </div>
  );
}

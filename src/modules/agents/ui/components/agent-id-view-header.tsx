import Link from "next/link";
import { ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Props {
  agentId: string;
  agentName: string;
  onEdit: () => void;
  onRemove: () => void;
}

export function AgentIdViewHeader({
  agentId,
  agentName,
  onEdit,
  onRemove,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/agents" className="font-medium text-xl text-white hover:text-cyan-400 transition-colors">
                My Agents
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-white text-xl font-medium [&>svg]:size-4">
            <ChevronRight />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/agents/${agentId}`} className="text-white hover:text-cyan-400 transition-colors">
                {agentName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <MoreVertical className="text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
          <DropdownMenuItem onClick={onEdit} className="text-white hover:bg-slate-700 focus:bg-slate-700">
            <Pencil className="size-4 text-blue-400" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove} className="text-white hover:bg-slate-700 focus:bg-slate-700">
            <Trash2 className="size-4 text-red-400" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

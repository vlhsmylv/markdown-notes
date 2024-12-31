import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";
import { IconTrash, IconFolderPlus, IconEdit } from "@tabler/icons-react";

interface TreeContextMenuProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onMove?: () => void;
  type: "folder" | "note";
}

export function TreeContextMenu({
  children,
  onDelete,
  onEdit,
  onMove,
  type,
}: TreeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
        {onEdit && (
          <ContextMenuItem
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            onClick={onEdit}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            <span>Edit {type}</span>
          </ContextMenuItem>
        )}
        {onMove && (
          <ContextMenuItem
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            onClick={onMove}
          >
            <IconFolderPlus className="mr-2 h-4 w-4" />
            <span>Move to folder</span>
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500 hover:text-red-600"
            onClick={onDelete}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            <span>Delete {type}</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

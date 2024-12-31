import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config";
import { IconFolder } from "@tabler/icons-react";

interface Folder {
  id: string;
  name: string;
  color: string;
}

interface FolderSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string | null) => void;
  title?: string;
}

export function FolderSelectDialog({
  isOpen,
  onClose,
  onSelect,
  title = "Select Folder",
}: FolderSelectDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.folders);
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <div
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
            >
              <IconFolder className="h-4 w-4" />
              <span>No Folder (Root)</span>
            </div>
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer"
                onClick={() => {
                  onSelect(folder.id);
                  onClose();
                }}
              >
                <IconFolder
                  className="h-4 w-4"
                  style={{ color: folder.color }}
                />
                <span>{folder.name}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS } from "@/config";

interface FolderRenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  currentName: string;
  onSuccess: () => void;
}

export function FolderRenameDialog({
  isOpen,
  onClose,
  folderId,
  currentName,
  onSuccess,
}: FolderRenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_ENDPOINTS.folders}/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename folder");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error renaming folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!name.trim() || isLoading}>
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

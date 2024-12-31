import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFolder,
  IconFile,
  IconFilePlus,
  IconFolderPlus,
  IconDots,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "@/components/theme-provider";
import { API_ENDPOINTS } from "@/config";
import { FileUploadModal } from "./ui/file-upload-modal";
import { FolderSelectDialog } from "./ui/folder-select-dialog";
import { FolderRenameDialog } from "./ui/folder-rename-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback } from "react";

interface Item {
  id: string;
  title?: string;
  name?: string;
  type: "folder" | "note";
  color?: string;
  fileType?: string;
}

interface NoteResponse {
  id: string;
  title: string;
  content?: string;
  fileType?: string;
  folderId?: string | null;
}

interface FolderResponse {
  id: string;
  name: string;
  color?: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>();
  const [isFolderSelectOpen, setIsFolderSelectOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notesRes, foldersRes] = await Promise.all([
        fetch(API_ENDPOINTS.notes),
        fetch(API_ENDPOINTS.folders),
      ]);

      if (!notesRes.ok || !foldersRes.ok) {
        throw new Error("Failed to fetch items");
      }

      const notes: NoteResponse[] = await notesRes.json();
      const folders: FolderResponse[] = await foldersRes.json();

      const formattedNotes = notes.map((note) => ({
        ...note,
        type: "note" as const,
      }));

      const formattedFolders = folders.map((folder) => ({
        ...folder,
        type: "folder" as const,
      }));

      setItems([...formattedFolders, ...formattedNotes]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch items";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleItemClick = (item: Item) => {
    if (item.type === "folder") {
      setSelectedFolderId(item.id);
      navigate(`/folders/${item.id}`);
    } else {
      navigate(`/notes/${item.id}`);
    }
  };

  const handleMoveNote = async (noteId: string, newFolderId: string | null) => {
    try {
      const note = items.find(
        (item) => item.id === noteId && item.type === "note"
      );
      if (!note) return;

      const response = await fetch(`${API_ENDPOINTS.notes}/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: note.title,
          content: "",
          folderId: newFolderId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to move note");
      }

      toast({
        title: "Success",
        description: "Note moved successfully",
      });

      fetchItems();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to move note";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="h-screen flex">
      <div
        className={`border-r transition-all duration-200 flex flex-col ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">Markdown Notes</h1>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <IconSun className="h-4 w-4" />
              ) : (
                <IconMoon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <IconChevronRight className="h-4 w-4" />
              ) : (
                <IconChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer group"
              >
                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  onClick={() => handleItemClick(item)}
                >
                  {item.type === "folder" ? (
                    <IconFolder
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: item.color }}
                    />
                  ) : (
                    <IconFile className="h-4 w-4 flex-shrink-0" />
                  )}
                  {!isCollapsed && (
                    <span className="truncate">
                      {item.type === "folder" ? item.name : item.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <IconDots className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.type === "folder" ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedItem(item);
                            setIsRenameDialogOpen(true);
                          }}
                        >
                          Rename
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedItem(item);
                            setIsFolderSelectOpen(true);
                          }}
                        >
                          Move to Folder
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t flex gap-2">
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            onClick={() => setIsUploadModalOpen(true)}
          >
            {isCollapsed ? (
              <IconFilePlus className="h-4 w-4" />
            ) : (
              <>
                <IconFilePlus className="h-4 w-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>
          {!isCollapsed && (
            <Button variant="outline">
              <IconFolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">{children}</div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={selectedFolderId}
        onSuccess={() => {
          fetchItems();
          toast({
            title: "Success",
            description: "File uploaded successfully",
          });
        }}
      />

      {selectedItem?.type === "note" && (
        <FolderSelectDialog
          isOpen={isFolderSelectOpen}
          onClose={() => {
            setIsFolderSelectOpen(false);
            setSelectedItem(null);
          }}
          onSelect={(folderId) => handleMoveNote(selectedItem.id, folderId)}
          title="Move Note to Folder"
        />
      )}

      {selectedItem?.type === "folder" && (
        <FolderRenameDialog
          isOpen={isRenameDialogOpen}
          onClose={() => {
            setIsRenameDialogOpen(false);
            setSelectedItem(null);
          }}
          folderId={selectedItem.id}
          currentName={selectedItem.name || ""}
          onSuccess={() => {
            fetchItems();
            toast({
              title: "Success",
              description: "Folder renamed successfully",
            });
          }}
        />
      )}
    </div>
  );
}

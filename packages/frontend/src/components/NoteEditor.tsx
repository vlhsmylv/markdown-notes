import React, { useEffect, useState, useCallback } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { API_ENDPOINTS } from "@/config";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  fileUrl?: string;
  fileType?: string;
}

export default function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<
    string | undefined
  >();
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const fetchNote = useCallback(
    async (noteId: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_ENDPOINTS.notes}/${noteId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch note");
        }
        const data = await response.json();
        setNote(data);
        setSelectedFolderId(data.folderId);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch note";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (id) {
      fetchNote(id);
    }
  }, [id, fetchNote]);

  const saveNote = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        id ? `${API_ENDPOINTS.notes}/${id}` : API_ENDPOINTS.notes,
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...note,
            folderId: selectedFolderId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      toast({
        title: "Success",
        description: "Note saved successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save note";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const deleteNote = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.notes}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete note";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(html);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!note) {
    return <div>Loading...</div>;
  }

  if (note.fileType === "pdf") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">{note.title}</h1>
          <Button variant="destructive" onClick={deleteNote}>
            Delete
          </Button>
        </div>
        <div className="flex-1">
          <iframe
            src={note.fileUrl}
            className="w-full h-full"
            title={note.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <input
          type="text"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          className="text-xl font-semibold bg-transparent border-none outline-none flex-1"
          placeholder="Note title"
        />
        <div className="flex gap-2">
          <Button onClick={saveNote}>Save</Button>
          <Button variant="destructive" onClick={deleteNote}>
            Delete
          </Button>
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={50} minSize={30}>
          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="w-full h-full p-4 resize-none bg-transparent"
            placeholder="Write your markdown here..."
          />
        </Panel>

        <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors" />

        <Panel defaultSize={50} minSize={30}>
          <div className="relative h-full">
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              >
                {isPreviewExpanded ? (
                  <IconMinimize className="h-4 w-4" />
                ) : (
                  <IconMaximize className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div
              className={`prose prose-sm dark:prose-invert max-w-none p-4 ${
                isPreviewExpanded ? "h-screen overflow-y-auto" : "h-full"
              }`}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(note.content),
              }}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

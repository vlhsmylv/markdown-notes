import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config";
import { useToast } from "@/hooks/use-toast";
import { IconFile } from "@tabler/icons-react";

interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function FolderView() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.notes);
        const folderNotes = response.data.filter(
          (note: Note) => note.folderId === folderId
        );
        setNotes(folderNotes);
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch notes",
          variant: "destructive",
        });
      }
    };

    fetchNotes();
  }, [folderId, toast]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Folder Notes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => navigate(`/notes/${note.id}`)}
            className="p-4 border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <IconFile size={20} />
              <h3 className="font-semibold">{note.title || "Untitled"}</h3>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {note.content || "No content"}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No notes in this folder
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { IconPlus, IconFolder } from "@tabler/icons-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config";

interface Folder {
  id: string;
  name: string;
  color: string;
}

interface Note {
  id: string;
  title: string;
  folderId: string | null;
}

const Sidebar = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetchFolders();
    fetchNotes();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.folders);
      setFolders(response.data);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.notes);
      setNotes(response.data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName) return;

    try {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      await axios.post(API_ENDPOINTS.folders, {
        name: newFolderName,
        color,
      });
      setNewFolderName("");
      fetchFolders();
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          onClick={createFolder}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <IconPlus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {folders.map((folder) => (
          <button
            key={folder.id}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <IconFolder className="w-4 h-4" style={{ color: folder.color }} />
            <span className="text-gray-900 dark:text-white">{folder.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Notes
        </h2>
        <div className="space-y-1">
          {notes.map((note) => (
            <button
              key={note.id}
              className="w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-900 dark:text-white"
            >
              {note.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

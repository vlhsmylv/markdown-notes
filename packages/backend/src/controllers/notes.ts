import { Request, Response } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";
import { Note } from "../models/Note";
import multer from "multer";
import fs from "fs";

const dbPath = path.join(__dirname, "../../notes.db");
const uploadsDir = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let db: Database.Database;

try {
  db = new Database(dbPath);
  console.log("Successfully connected to database at:", dbPath);

  // Initialize database
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      folderId TEXT,
      fileUrl TEXT,
      fileType TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folderId) REFERENCES folders(id)
    );
  `);
  console.log("Database tables initialized successfully");
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = db.prepare("SELECT * FROM notes").all();
    res.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as
      | Note
      | undefined;

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    console.log("Successfully fetched note:", note.id);
    res.json(note);
  } catch (error) {
    console.error("Failed to fetch note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, folderId } = req.body;
    const id = uuidv4();

    db.prepare(
      `INSERT INTO notes (id, title, content, folderId)
       VALUES (?, ?, ?, ?)`
    ).run(id, title, content, folderId);

    res.status(201).json({ id, title, content, folderId });
  } catch (error) {
    console.error("Failed to create note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, folderId } = req.body;

    db.prepare(
      `UPDATE notes 
       SET title = ?, content = ?, folderId = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(title, content, folderId, id);

    res.json({ id, title, content, folderId });
  } catch (error) {
    console.error("Failed to update note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM notes WHERE id = ?").run(id);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const folders = db.prepare("SELECT * FROM folders").all();
    console.log("Successfully fetched folders:", folders.length);
    res.json(folders);
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    const id = uuidv4();

    db.prepare(
      `INSERT INTO folders (id, name, color)
       VALUES (?, ?, ?)`
    ).run(id, name, color);

    res.status(201).json({ id, name, color });
  } catch (error) {
    console.error("Failed to create folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, folderId } = req.body;
    const id = uuidv4();
    const fileUrl = `/uploads/${req.file.filename}`;

    db.prepare(
      `INSERT INTO notes (id, title, content, folderId, fileUrl, fileType)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, title || req.file.originalname, "", folderId, fileUrl, "pdf");

    res.status(201).json({
      id,
      title: title || req.file.originalname,
      content: "",
      folderId,
      fileUrl,
      fileType: "pdf",
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    db.prepare(
      `UPDATE folders 
       SET name = ?
       WHERE id = ?`
    ).run(name, id);

    res.json({ id, name });
  } catch (error) {
    console.error("Failed to update folder:", error);
    res.status(500).json({ error: "Failed to update folder" });
  }
};

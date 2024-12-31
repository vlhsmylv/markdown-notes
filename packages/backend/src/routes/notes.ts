import { Router } from "express";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getFolders,
  createFolder,
  updateFolder,
  uploadFile,
  upload,
} from "../controllers/notes";

const router = Router();

/**
 * @swagger
 * /api/notes/folders:
 *   get:
 *     summary: Get all folders
 *     tags: [Folders]
 *     responses:
 *       200:
 *         description: List of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   color:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/folders", getFolders);

/**
 * @swagger
 * /api/notes/folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created folder
 *       500:
 *         description: Server error
 */
router.post("/folders", createFolder);

/**
 * @swagger
 * /api/notes/folders/{id}:
 *   put:
 *     summary: Rename a folder
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder renamed successfully
 *       500:
 *         description: Server error
 */
router.put("/folders/:id", updateFolder);

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   folderId:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/", getNotes);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note details
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getNote);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created note
 *       500:
 *         description: Server error
 */
router.post("/", createNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated note
 *       500:
 *         description: Server error
 */
router.put("/:id", updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Note deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteNote);

/**
 * @swagger
 * /api/notes/upload:
 *   post:
 *     summary: Upload a PDF file
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or missing required fields
 *       500:
 *         description: Server error
 */
router.post("/upload", upload.single("file"), uploadFile);

export default router;

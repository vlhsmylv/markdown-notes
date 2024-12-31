import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import NoteEditor from "@/components/NoteEditor";
import FolderView from "@/components/FolderView";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <Routes>
          <Route index element={<div>Select a note or create one</div>} />
          <Route path="/notes/:id" element={<NoteEditor />} />
          <Route path="/folders/:id" element={<FolderView />} />
        </Routes>
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

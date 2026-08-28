import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { readDB, writeDB } from './db.js';
import {
  UPLOADS_DIR,
  SUB_DIRS,
  ensureUploadDirectories,
  getFileCategory,
  formatBytes,
  deleteLocalFile
} from './storage/storageAdapter.js';
import {
  initialProfile,
  initialCv,
  initialProjects,
  initialArticles,
  initialExperiences,
  initialSkills,
  initialMessages,
  initialSettings
} from '../src/data/seedData.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload directories exist
ensureUploadDirectories();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = getFileCategory(file.mimetype, file.originalname);
    const destDir = SUB_DIRS[category] || SUB_DIRS.others;
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    // Generate clean sanitized filename with timestamp
    const ext = path.extname(file.originalname).toLowerCase();
    const rawBaseName = path.basename(file.originalname, ext);
    const cleanBaseName = rawBaseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanBaseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max limit per file
  }
});

// Helper SEO Slug Generator
const createSeoSlug = (title) => {
  if (!title) return `post-${Date.now()}`;
  const clean = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return clean || `post-${Date.now()}`;
};

// GET Full Portfolio Dataset
app.get('/api/data', (req, res) => {
  const db = readDB();
  res.json(db);
});

// ==========================================
// MEDIA FILE MANAGEMENT REST API
// ==========================================

// GET /api/media - List all uploaded media files
app.get('/api/media', (req, res) => {
  const db = readDB();
  const mediaList = db.media || [];
  const { category, search } = req.query;

  let filtered = [...mediaList];

  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(item =>
      item.originalName.toLowerCase().includes(q) ||
      item.filename.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// POST /api/media/upload - Upload single or multiple files
app.post('/api/media/upload', upload.array('files', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const db = readDB();
    const currentMedia = db.media || [];
    const newItems = [];

    for (const file of req.files) {
      const category = getFileCategory(file.mimetype, file.filename);
      const relativeUrl = `/uploads/${category}/${file.filename}`;

      const mediaItem = {
        id: `media-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
        filename: file.filename,
        originalName: file.originalname,
        category, // 'images' | 'videos' | 'documents' | 'others'
        mimetype: file.mimetype,
        size: file.size,
        formattedSize: formatBytes(file.size),
        url: relativeUrl,
        storageDriver: 'local', // 'local' | 's3'
        uploadedAt: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      newItems.push(mediaItem);
      currentMedia.unshift(mediaItem);
    }

    db.media = currentMedia;
    writeDB(db);

    res.status(201).json({
      success: true,
      count: newItems.length,
      media: newItems
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// DELETE /api/media/:id - Delete a media file from disk and database
app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const mediaList = db.media || [];

  const targetIndex = mediaList.findIndex(item => item.id === id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Media file not found' });
  }

  const targetFile = mediaList[targetIndex];

  // Delete physical file if local driver
  if (targetFile.storageDriver === 'local') {
    const physicalPath = path.join(SUB_DIRS[targetFile.category] || SUB_DIRS.others, targetFile.filename);
    deleteLocalFile(physicalPath);
  }

  // Remove from database list
  mediaList.splice(targetIndex, 1);
  db.media = mediaList;
  writeDB(db);

  res.json({ success: true, message: 'Media file deleted successfully', id });
});

// PROFILE & SETTINGS
app.put('/api/profile', (req, res) => {
  const db = readDB();
  db.profile = req.body;
  writeDB(db);
  res.json({ success: true, profile: db.profile });
});

// DEDICATED CV REST API
app.get('/api/cv', (req, res) => {
  const db = readDB();
  res.json(db.cv || initialCv);
});

app.put('/api/cv', (req, res) => {
  const db = readDB();
  db.cv = req.body;
  writeDB(db);
  res.json({ success: true, cv: db.cv });
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = req.body;
  writeDB(db);
  res.json({ success: true, settings: db.settings });
});

// ARTICLES CRUD
app.get('/api/articles', (req, res) => {
  const db = readDB();
  res.json(db.articles || []);
});

app.post('/api/articles', (req, res) => {
  const db = readDB();
  const newArt = req.body;
  const seoSlug = createSeoSlug(newArt.title || 'artikel-baru');
  const artWithId = {
    ...newArt,
    id: seoSlug,
    date: newArt.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  };
  db.articles = [artWithId, ...(db.articles || [])];
  writeDB(db);
  res.status(201).json(artWithId);
});

app.put('/api/articles/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedData = req.body;
  db.articles = (db.articles || []).map(a => (a.id === id ? { ...a, ...updatedData } : a));
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/articles/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.articles = (db.articles || []).filter(a => a.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// PROJECTS CRUD
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects || []);
});

app.post('/api/projects', (req, res) => {
  const db = readDB();
  const newProj = req.body;
  const seoSlug = createSeoSlug(newProj.title || 'proyek-baru');
  const projWithId = {
    ...newProj,
    id: seoSlug,
    featured: newProj.featured || false
  };
  db.projects = [projWithId, ...(db.projects || [])];
  writeDB(db);
  res.status(201).json(projWithId);
});

app.put('/api/projects/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedData = req.body;
  db.projects = (db.projects || []).map(p => (p.id === id ? { ...p, ...updatedData } : p));
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/projects/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.projects = (db.projects || []).filter(p => p.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// EXPERIENCES CRUD
app.post('/api/experiences', (req, res) => {
  const db = readDB();
  const exp = { ...req.body, id: `exp-${Date.now()}` };
  db.experiences = [exp, ...(db.experiences || [])];
  writeDB(db);
  res.status(201).json(exp);
});

app.put('/api/experiences/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.experiences = (db.experiences || []).map(e => (e.id === id ? { ...e, ...req.body } : e));
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/experiences/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.experiences = (db.experiences || []).filter(e => e.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// SKILLS CRUD
app.post('/api/skills', (req, res) => {
  const db = readDB();
  const sk = { ...req.body, id: `sk-${Date.now()}` };
  db.skills = [...(db.skills || []), sk];
  writeDB(db);
  res.status(201).json(sk);
});

app.put('/api/skills/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updated = req.body;
  db.skills = (db.skills || []).map(s => (s.id === id ? { ...s, ...updated } : s));
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/skills/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.skills = (db.skills || []).filter(s => s.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// MESSAGES CRUD
app.post('/api/messages', (req, res) => {
  const db = readDB();
  const newMsg = {
    ...req.body,
    id: `msg-${Date.now()}`,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    read: false
  };
  db.messages = [newMsg, ...(db.messages || [])];
  writeDB(db);
  res.status(201).json(newMsg);
});

app.put('/api/messages/:id/read', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.messages = (db.messages || []).map(m => (m.id === id ? { ...m, read: true } : m));
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/messages/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.messages = (db.messages || []).filter(m => m.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// RESET TO SEED DEFAULT
app.post('/api/reset', (req, res) => {
  const defaultState = {
    profile: initialProfile,
    cv: initialCv,
    projects: initialProjects,
    articles: initialArticles,
    experiences: initialExperiences,
    skills: initialSkills,
    messages: initialMessages,
    settings: initialSettings,
    media: []
  };
  writeDB(defaultState);
  res.json({ success: true, data: defaultState });
});

app.listen(PORT, () => {
  console.log(`🚀 Database Backend Server running on http://localhost:${PORT}`);
});

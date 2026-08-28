import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  initialProfile,
  initialProjects,
  initialArticles,
  initialExperiences,
  initialSkills,
  initialMessages,
  initialSettings
} from '../src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'portfolio_db.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Default Seed State
const defaultState = {
  profile: initialProfile,
  projects: initialProjects,
  articles: initialArticles,
  experiences: initialExperiences,
  skills: initialSkills,
  messages: initialMessages,
  settings: initialSettings
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf-8');
  console.log('✅ Database file created and initialized with seed data at:', DB_FILE);
}

export const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file:', error);
    return defaultState;
  }
};

export const writeDB = (data) => {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
};

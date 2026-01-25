import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read JSON file
export async function readDB(filename) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

// Write JSON file
export async function writeDB(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize database files with default data
export async function initDB() {
  const files = {
    'users.json': [],
    'pets.json': [],
    'applications.json': [],
    'favorites.json': [],
    'appointments.json': [],
    'quizResults.json': []
  };

  for (const [filename, defaultData] of Object.entries(files)) {
    const existing = await readDB(filename);
    if (existing === null) {
      await writeDB(filename, defaultData);
    }
  }
}

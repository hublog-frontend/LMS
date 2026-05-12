import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate a unique version based on current timestamp
const version = new Date().getTime().toString();
const releaseDate = new Date().toISOString().split('T')[0];
const versionData = { version, releaseDate };

const filePath = join(__dirname, 'public', 'version.json');

try {
  fs.writeFileSync(filePath, JSON.stringify(versionData, null, 2));
  console.log(`✅ Version updated to: ${version}`);
} catch (err) {
  console.error('❌ Failed to update version.json:', err);
  process.exit(1);
}

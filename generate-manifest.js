import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const cheatsheetDir = path.join(publicDir, 'Cheatsheet-Info');
const manifestPath = path.join(publicDir, 'manifest.json');

// Files to exclude from the manifest
const excludeFiles = ['manifest.json', 'Example.json', '_redirects', 'README.txt'];

try {
  // Check if Cheatsheet-Info folder exists, if not use public directory
  const targetDir = fs.existsSync(cheatsheetDir) ? cheatsheetDir : publicDir;
  
  // Read all files in the target directory
  const files = fs.readdirSync(targetDir);
  
  // Filter for JSON files and exclude specific files
  const jsonFiles = files
    .filter(file => file.endsWith('.json') && !excludeFiles.includes(file))
    .map(file => {
      const name = file.replace('.json', '');
      // Convert kebab-case or snake_case to Display Name
      const displayName = name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return {
        name: name,
        displayName: displayName
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Create manifest object
  const manifest = {
    cheatsheets: jsonFiles
  };

  // Write manifest file
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Manifest generated successfully!');
  console.log(`📋 Found ${jsonFiles.length} cheatsheet(s):`);
  jsonFiles.forEach(cs => {
    console.log(`   - ${cs.displayName} (${cs.name}.json)`);
  });
} catch (error) {
  console.error('❌ Error generating manifest:', error);
  process.exit(1);
}


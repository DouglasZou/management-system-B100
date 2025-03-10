require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to fix model imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix User model imports
  if (content.includes("require('../models/user')") || content.includes("require('../models/User')")) {
    // Standardize to User with capital U
    content = content.replace(/require\(['"]\.\.\/models\/user['"]\)/g, "require('../models/User')");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Function to scan and fix files
function scanAndFixFiles(directory) {
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js')) {
        fixImportsInFile(filePath);
      }
    }
  }
  
  scanDirectory(directory);
}

// Main function
function fixModelImports() {
  console.log('Fixing model imports...');
  
  const serverDir = path.resolve(__dirname, '..');
  scanAndFixFiles(serverDir);
  
  console.log('Done fixing model imports.');
}

fixModelImports(); 
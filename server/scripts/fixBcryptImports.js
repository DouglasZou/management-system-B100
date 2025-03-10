const fs = require('fs');
const path = require('path');

// Function to fix bcrypt imports in a file
function fixBcryptImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace bcryptjs with bcrypt
  if (content.includes("require('bcrypt')") || content.includes('require('bcrypt')')) {
    content = content.replace(/require\(['"]bcryptjs['"]\)/g, "require('bcrypt')");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed bcrypt imports in: ${filePath}`);
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
        fixBcryptImports(filePath);
      }
    }
  }
  
  scanDirectory(directory);
}

// Main function
function fixImports() {
  console.log('Fixing bcrypt imports...');
  
  const serverDir = path.resolve(__dirname, '..');
  scanAndFixFiles(serverDir);
  
  console.log('Done fixing bcrypt imports.');
}

fixImports(); 
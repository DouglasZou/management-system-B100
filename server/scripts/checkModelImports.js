require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to scan files for model imports
function scanFiles(directory) {
  const modelImports = {};
  
  function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for require statements that import models
      if (line.includes('require') && line.includes('models/')) {
        const match = line.match(/require\(['"](.+?)['"]\)/);
        if (match) {
          const importPath = match[1];
          if (importPath.includes('models/')) {
            const modelName = path.basename(importPath);
            if (!modelImports[modelName]) {
              modelImports[modelName] = [];
            }
            modelImports[modelName].push(filePath);
          }
        }
      }
    }
  }
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js')) {
        processFile(filePath);
      }
    }
  }
  
  scanDirectory(directory);
  return modelImports;
}

// Main function
function checkModelImports() {
  console.log('Checking for model imports...');
  
  const serverDir = path.resolve(__dirname, '..');
  const modelImports = scanFiles(serverDir);
  
  console.log('\nModel import summary:');
  
  let hasDuplicateCase = false;
  
  for (const [model, files] of Object.entries(modelImports)) {
    console.log(`\n${model} is imported in ${files.length} files:`);
    
    // Check for case sensitivity issues
    const lowerModel = model.toLowerCase();
    for (const otherModel of Object.keys(modelImports)) {
      if (model !== otherModel && lowerModel === otherModel.toLowerCase()) {
        console.log(`⚠️ WARNING: Case sensitivity issue detected between '${model}' and '${otherModel}'`);
        hasDuplicateCase = true;
      }
    }
    
    // List files
    files.forEach(file => {
      const relativePath = path.relative(serverDir, file);
      console.log(`  - ${relativePath}`);
    });
  }
  
  if (hasDuplicateCase) {
    console.log('\n⚠️ Case sensitivity issues detected! This can cause the "OverwriteModelError" in Mongoose.');
    console.log('   Make sure all imports use the same casing for model names.');
  } else {
    console.log('\nNo case sensitivity issues detected.');
  }
}

checkModelImports(); 
const fs = require('fs');
const path = require('path');

// Function to check for model definitions in a file
function checkModelDefinitions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const modelDefinitions = [];
  
  // Look for mongoose.model calls
  const modelRegex = /mongoose\.model\(['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = modelRegex.exec(content)) !== null) {
    modelDefinitions.push({
      model: match[1],
      file: filePath
    });
  }
  
  return modelDefinitions;
}

// Function to scan all JS files in a directory
function scanDirectory(dir, definitions = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      scanDirectory(filePath, definitions);
    } else if (file.endsWith('.js')) {
      const fileDefinitions = checkModelDefinitions(filePath);
      definitions.push(...fileDefinitions);
    }
  }
  
  return definitions;
}

// Main function
function checkModels() {
  console.log('Checking for duplicate model definitions...');
  
  const serverDir = path.resolve(__dirname, '..');
  const modelDefinitions = scanDirectory(serverDir);
  
  console.log(`\nFound ${modelDefinitions.length} model definitions.`);
  
  // Group by model name
  const modelGroups = {};
  modelDefinitions.forEach(def => {
    if (!modelGroups[def.model]) {
      modelGroups[def.model] = [];
    }
    modelGroups[def.model].push(def.file);
  });
  
  // Check for duplicates
  let hasDuplicates = false;
  
  for (const [model, files] of Object.entries(modelGroups)) {
    if (files.length > 1) {
      hasDuplicates = true;
      console.log(`\n⚠️ Model '${model}' is defined in ${files.length} files:`);
      files.forEach(file => {
        const relativePath = path.relative(serverDir, file);
        console.log(`  - ${relativePath}`);
      });
    }
  }
  
  if (!hasDuplicates) {
    console.log('\n✅ No duplicate model definitions found!');
  } else {
    console.log('\n⚠️ Duplicate model definitions can cause the "OverwriteModelError" in Mongoose.');
    console.log('   Consider using the pattern: const Model = mongoose.models.ModelName || mongoose.model("ModelName", schema)');
  }
}

checkModels(); 
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to extract all require statements from a file
function extractRequires(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const requireRegex = /require\(['"]([^'"./][^'"]*)['"]\)/g;
  const requires = [];
  let match;
  
  while ((match = requireRegex.exec(content)) !== null) {
    // Skip node built-in modules
    const moduleName = match[1].split('/')[0];
    if (!isNodeBuiltIn(moduleName)) {
      requires.push(moduleName);
    }
  }
  
  return requires;
}

// Check if a module is a Node.js built-in module
function isNodeBuiltIn(moduleName) {
  const builtins = [
    'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 
    'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 
    'module', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 
    'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty', 
    'url', 'util', 'v8', 'vm', 'zlib'
  ];
  
  return builtins.includes(moduleName);
}

// Function to scan all JS files in a directory
function scanDirectory(dir, requires = new Set()) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      scanDirectory(filePath, requires);
    } else if (file.endsWith('.js')) {
      const fileRequires = extractRequires(filePath);
      fileRequires.forEach(req => requires.add(req));
    }
  }
  
  return requires;
}

// Get installed dependencies from package.json
function getInstalledDependencies() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  return new Set([...Object.keys(dependencies), ...Object.keys(devDependencies)]);
}

// Main function
function checkDependencies() {
  console.log('Checking dependencies...');
  
  const serverDir = path.resolve(__dirname, '..');
  const requiredModules = scanDirectory(serverDir);
  const installedModules = getInstalledDependencies();
  
  console.log(`\nFound ${requiredModules.size} required modules in code.`);
  console.log(`Found ${installedModules.size} installed modules in package.json.`);
  
  // Find missing dependencies
  const missingDependencies = [...requiredModules].filter(mod => !installedModules.has(mod));
  
  if (missingDependencies.length > 0) {
    console.log('\n⚠️ Missing dependencies:');
    missingDependencies.forEach(dep => console.log(`  - ${dep}`));
    
    // Suggest installation command
    console.log('\nTo install missing dependencies, run:');
    console.log(`npm install ${missingDependencies.join(' ')}`);
  } else {
    console.log('\n✅ All required dependencies are installed!');
  }
  
  // Check for unused dependencies
  const unusedDependencies = [...installedModules].filter(mod => !requiredModules.has(mod));
  
  if (unusedDependencies.length > 0) {
    console.log('\nℹ️ Potentially unused dependencies:');
    unusedDependencies.forEach(dep => console.log(`  - ${dep}`));
    
    console.log('\nNote: Some of these might be used indirectly or in scripts.');
  }
}

checkDependencies(); 
const fs = require('fs');
const path = require('path');

// Create the .next directory structure and required manifest files
const nextDir = path.join(__dirname, '.next');
const serverDir = path.join(nextDir, 'server');

// List of manifest files to create
const manifestFiles = [
  'middleware-manifest.json',
  'app-paths-manifest.json',
  'pages-manifest.json',
  'app-build-manifest.json',
  'build-manifest.json'
];

// Create empty objects for each manifest file
const emptyManifests = {
  'middleware-manifest.json': {
    version: 1,
    sortedMiddleware: [],
    middleware: {},
    functions: {},
    matchers: {}
  },
  'app-paths-manifest.json': {},
  'pages-manifest.json': {},
  'app-build-manifest.json': {
    pages: {},
    devFiles: [],
    ampDevFiles: [],
    polyfillFiles: [],
    lowPriorityFiles: [],
    rootMainFiles: [],
    ampFirstPages: []
  },
  'build-manifest.json': {
    polyfillFiles: [],
    devFiles: [],
    ampDevFiles: [],
    lowPriorityFiles: [],
    rootMainFiles: [],
    pages: {},
    ampFirstPages: []
  }
};

try {
  // Create directories if they don't exist
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir);
    console.log(`Created directory: ${nextDir}`);
  }

  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir);
    console.log(`Created directory: ${serverDir}`);
  }

  // Create each manifest file
  manifestFiles.forEach(file => {
    const filePath = path.join(serverDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(emptyManifests[file], null, 2));
      console.log(`Created manifest file: ${filePath}`);
    } else {
      console.log(`Manifest file already exists: ${filePath}`);
    }
  });

  console.log('Next.js cache repair completed successfully.');
} catch (error) {
  console.error('Error repairing Next.js cache:', error);
}

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let frontendDir = '';

if (fs.existsSync(path.join(__dirname, 'frontend', 'package.json'))) {
  frontendDir = path.join(__dirname, 'frontend');
} else if (fs.existsSync(path.join(__dirname, '..', 'frontend', 'package.json'))) {
  frontendDir = path.join(__dirname, '..', 'frontend');
} else if (fs.existsSync(path.join(__dirname, 'package.json')) && fs.existsSync(path.join(__dirname, 'src'))) {
  frontendDir = __dirname;
}

if (frontendDir) {
  console.log(`🔨 Building frontend located at: ${frontendDir}`);
  execSync('npm install && npm run build', { cwd: frontendDir, stdio: 'inherit' });
  console.log('✅ Frontend production bundle built successfully!');
} else {
  console.log('ℹ️ No frontend directory to build. Backend ready.');
}

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let frontendDir = '';
let rootDir = __dirname;

if (fs.existsSync(path.join(__dirname, 'frontend', 'package.json'))) {
  frontendDir = path.join(__dirname, 'frontend');
  rootDir = __dirname;
} else if (fs.existsSync(path.join(__dirname, '..', 'frontend', 'package.json'))) {
  frontendDir = path.join(__dirname, '..', 'frontend');
  rootDir = path.join(__dirname, '..');
} else if (fs.existsSync(path.join(__dirname, 'package.json')) && fs.existsSync(path.join(__dirname, 'src'))) {
  frontendDir = __dirname;
  rootDir = path.join(__dirname, '..');
}

if (frontendDir) {
  console.log(`🔨 Building frontend located at: ${frontendDir}`);
  execSync('npm install && npm run build', { cwd: frontendDir, stdio: 'inherit' });
  console.log('✅ Frontend production bundle built successfully!');

  const srcDist = path.join(frontendDir, 'dist');
  if (fs.existsSync(srcDist)) {
    const targets = [
      path.join(rootDir, 'frontend', 'dist'),
      path.join(rootDir, 'backend', 'frontend', 'dist'),
      path.join(rootDir, 'dist'),
      path.join(rootDir, 'backend', 'dist'),
    ];

    targets.forEach((target) => {
      if (target !== srcDist) {
        try {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.cpSync(srcDist, target, { recursive: true, force: true });
          console.log(`📦 Synced build artifacts to: ${target}`);
        } catch (e) {
          // ignore
        }
      }
    });
  }
} else {
  console.log('ℹ️ No frontend directory to build. Backend ready.');
}

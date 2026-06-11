import fs from 'fs';
import path from 'path';

// 1. Resolve %localappdata% on Windows (with fallbacks for Mac/Linux just in case)
const localAppData = process.env.LOCALAPPDATA
  || (process.platform === 'darwin'
    ? path.join(process.env.HOME, 'Library/Application Support')
    : path.join(process.env.HOME, '.local/share'));

// 2. Define source and destination paths
const srcScriptsDir = path.resolve('dist/src/scripts');
const srcScriptFile = path.resolve('dist/src/script.js');

const destModuleDir = path.join(localAppData, 'FoundryVTT/Data/modules/alternate-classes-55e');
const destScriptsDir = path.join(destModuleDir, 'scripts');

try {
  // 3. Ensure the destination module folder exists
  fs.mkdirSync(destModuleDir, { recursive: true });
  console.log(`Verified module directory: ${destModuleDir}`);

  // 4. Copy dist/script.js if it exists
  if (fs.existsSync(srcScriptFile)) {
    fs.copyFileSync(srcScriptFile, path.join(destModuleDir, 'script.js'));
    console.log('✓ Successfully copied dist/script.js');
  }
  else {
    console.warn('⚠ Warning: dist/src/script.js not found.');
  }

  // 5. Copy dist/scripts/ folder and contents if it exists
  if (fs.existsSync(srcScriptsDir)) {
    // cpSync copies folders recursively (requires Node.js v16.7.0+)
    fs.cpSync(srcScriptsDir, destScriptsDir, { recursive: true, force: true });
    console.log('✓ Successfully copied dist/scripts/ folder contents');
  }
  else {
    console.warn('⚠ Warning: dist/src/scripts folder not found.');
  }

  console.log('\n🎉 Copy operation completed successfully!');
}
catch (error) {
  console.error('❌ Error copying build files:', error.message);
  process.exit(1);
}

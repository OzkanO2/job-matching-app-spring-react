const fs = require('fs');
const path = require('path');

const dirToSearch = './'; // racine du projet
const matchString = 'process.env.REACT_APP_BACKEND_URL';
const replaceWith = 'process.env.REACT_APP_BACKEND_URL';

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(matchString)) {
    const updated = content.replaceAll(matchString, replaceWith);
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Modifié : ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDir(fullPath);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      replaceInFile(fullPath);
    }
  });
}

walkDir(dirToSearch);
console.log('🎉 Terminé ! Tous les localhost remplacés.');

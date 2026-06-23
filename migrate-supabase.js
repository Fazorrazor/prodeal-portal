const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
        if(f !== 'node_modules' && f !== '.next' && f !== '.git') {
            walkDir(dirPath, callback);
        }
    } else {
      if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        callback(path.join(dir, f));
      }
    }
  });
}

walkDir('.', function(filePath) {
  if (filePath.includes('server.ts') && filePath.includes('supabase')) return; // Skip the file where it's defined
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('createServer()')) {
    // Replace createServer() with await createServer() unless it already has await
    const regex = /(?<!await\s)createServer\(\)/g;
    const newContent = content.replace(regex, 'await createServer()');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});

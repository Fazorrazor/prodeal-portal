const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && f !== 'node_modules' && f !== '.next' && f !== '.git') {
            walkDir(dirPath, callback);
        } else if (!isDirectory && (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx'))) {
            callback(path.join(dir, f));
        }
    });
}

walkDir('.', function(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/Pro Deal/g, 'Prodeal').replace(/PRO DEAL/g, 'PRODEAL');
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated ' + filePath);
    }
});

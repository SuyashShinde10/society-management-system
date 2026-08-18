const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/Projects/society-management-system/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace box shadows
    content = content.replace(/boxShadow:\s*[`'"].*?[`'"]/g, `boxShadow: '0 4px 12px rgba(0,0,0,0.05)'`);
    
    // Fix ternary operators that got broken
    content = content.replace(/boxShadow: \(!isVerified \|\| loading\) \? 'none' : '0 4px 12px rgba\(0,0,0,0\.05\)'/g, `boxShadow: (!isVerified || loading) ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'`);
    content = content.replace(/boxShadow: \(!isVerified \|\| loading\) \? 'none' : `.*`/g, `boxShadow: (!isVerified || loading) ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'`);

    // Fix harsh borders
    content = content.replace(/border:\s*`1px solid #1A1A1A`/g, `border: '1px solid #E8E4D9'`);
    content = content.replace(/border:\s*'1px solid #1A1A1A'/g, `border: '1px solid #E8E4D9'`);
    content = content.replace(/border:\s*`2px solid \$\{theme\.border\}`/g, `border: \`1px solid \${theme.border}\``);
    content = content.replace(/borderLeft:\s*`12px solid \$\{theme\.textMain\}`/g, `borderLeft: \`6px solid \${theme.textMain}\``);
    content = content.replace(/borderLeft:\s*`8px solid \$\{theme\.textMain\}`/g, `borderLeft: \`4px solid \${theme.textMain}\``);
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});

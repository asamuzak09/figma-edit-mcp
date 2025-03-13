const fs = require('fs');
const esbuild = require('esbuild');

// code.tsのビルド
esbuild.buildSync({
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'code.js',
});

// ui.tsからHTMLを生成
const html = fs.readFileSync('src/ui.ts', 'utf8')
  .replace('export default html;', '')
  .replace('const html = `', '')
  .replace('`;', '');

fs.writeFileSync('ui.html', html); 
import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'public');

const outputFile = path.join(process.cwd(), 'src/assetList.json');

const srcDir = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

const getImagePaths = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getImagePaths(filePath));
    } else if (/\.(png|jpg|jpeg|gif|svg|json)$/i.test(file)) {
      results.push(filePath.replace(/\\/g, '/').replace(`${process.cwd()}/public`, '')); 
    }
  });

  return results;
};

const imagePaths = getImagePaths(assetsDir);

fs.writeFile(outputFile, JSON.stringify(imagePaths, null, 2), (err) => {
  if (err) {
    return console.error('Error writing file:', err);
  }
});

const fs = require('fs');
const path = require('path');

// Función para obtener el tamaño de un directorio
function getDirectorySize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stat.size;
    }
  }

  return size;
}

// Función para formatear el tamaño en bytes a un formato legible
function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Directorio base de los paquetes
const packagesDir = path.join(__dirname, '..', 'packages');

// Leer todos los directorios de paquetes
const packages = fs.readdirSync(packagesDir)
  .filter(item => {
    const itemPath = path.join(packagesDir, item);
    return fs.statSync(itemPath).isDirectory() && item.startsWith('xchain-');
  });

// Array para almacenar los resultados
const results = [];

packages.forEach(pkg => {
  const libPath = path.join(packagesDir, pkg, 'lib');
  
  if (fs.existsSync(libPath)) {
    const size = getDirectorySize(libPath);
    results.push({
      name: pkg,
      size: size,
      formattedSize: formatSize(size)
    });
  } else {
    results.push({
      name: pkg,
      size: 0,
      formattedSize: 'No existe carpeta lib'
    });
  }
});

// Ordenar resultados por tamaño
results.sort((a, b) => a.size - b.size);

console.log('Tamaño de las carpetas lib por paquete (ordenado de menor a mayor):');
console.log('----------------------------------------');

results.forEach(result => {
  console.log(`${result.name}: ${result.formattedSize}`);
}); 
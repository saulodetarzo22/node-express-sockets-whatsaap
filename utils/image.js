import path from 'path';

export function getFilePath(file) {
  if (!file || !file.path) {
    throw new Error("Archivo no válido");
  }

  const filePath = file.path;
  const fileSplit = filePath.split(path.sep);

  if (fileSplit.length < 2) {
    throw new Error("Ruta del archivo no válida");
  }

  return path.join(fileSplit[fileSplit.length - 2], fileSplit[fileSplit.length - 1]);
}

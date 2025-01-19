const FS = require("fs");
const PATH = require("path");

// Функция для рекурсивного копирования содержимого
async function copyDir(SRC, DEST) {
  try {
    // Создаём папку назначения, если её нет
    await FS.promises.mkdir(DEST, { recursive: true });

    // Читаем содержимое исходной папки
    const ITEMS = await FS.promises.readdir(SRC, { withFileTypes: true });

    for (const ITEM of ITEMS) {
      const SRC_PATH = PATH.join(SRC, ITEM.name); // Путь к исходному объекту
      const DEST_PATH = PATH.join(DEST, ITEM.name); // Путь к целевому объекту

      if (ITEM.isFile()) {
        // Копируем файл
        await FS.promises.copyFile(SRC_PATH, DEST_PATH);
      } else if (ITEM.isDirectory()) {
        // Если это папка, вызываем функцию рекурсивно
        await copyDir(SRC_PATH, DEST_PATH);
      }
    }
  } catch (ERR) {
    console.error("Ошибка при копировании:", ERR);
  }
}

// Функция для очистки папки перед копированием
async function clearDir(DEST) {
  try {
    const ITEMS = await FS.promises.readdir(DEST, { withFileTypes: true });

    for (const ITEM of ITEMS) {
      const DEST_PATH = PATH.join(DEST, ITEM.name);

      if (ITEM.isFile()) {
        // Удаляем файл
        await FS.promises.unlink(DEST_PATH);
      } else if (ITEM.isDirectory()) {
        // Удаляем папку рекурсивно
        await FS.promises.rm(DEST_PATH, { recursive: true, force: true });
      }
    }
  } catch (ERR) {
    // Если папка ещё не существует, ничего не делаем
    if (ERR.code !== "ENOENT") {
      console.error("Ошибка при очистке папки:", ERR);
    }
  }
}

// Главная функция
async function main() {
  const SRC_FOLDER = PATH.join(__dirname, "files"); // Исходная папка
  const DEST_FOLDER = PATH.join(__dirname, "files-copy"); // Папка для копирования

  // Очищаем папку назначения
  await clearDir(DEST_FOLDER);

  // Копируем файлы и папки
  await copyDir(SRC_FOLDER, DEST_FOLDER);

  console.log("Копирование завершено!");
}

main();

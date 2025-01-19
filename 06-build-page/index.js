const FS = require("fs");
const PATH = require("path");

// Пути
const TEMPLATE_PATH = PATH.join(__dirname, "template.html");
const COMPONENTS_DIR = PATH.join(__dirname, "components");
const STYLES_DIR = PATH.join(__dirname, "styles");
const ASSETS_DIR = PATH.join(__dirname, "assets");
const DIST_DIR = PATH.join(__dirname, "project-dist");
const BUNDLE_PATH = PATH.join(DIST_DIR, "style.css");
const INDEX_PATH = PATH.join(DIST_DIR, "index.html");

// Функция для создания папки project-dist, если она не существует
async function createDistFolder() {
  try {
    await FS.promises.mkdir(DIST_DIR, { recursive: true });
  } catch (err) {
    console.error("Ошибка при создании папки project-dist:", err);
  }
}

// Чтение шаблона и замена тегов на содержимое файлов компонентов
async function createHtml() {
  try {
    let templateContent = await FS.promises.readFile(TEMPLATE_PATH, "utf-8");
    const COMPONENT_FILES = await FS.promises.readdir(COMPONENTS_DIR);

    for (let file of COMPONENT_FILES) {
      const filePath = PATH.join(COMPONENTS_DIR, file);
      const TAG_NAME = PATH.parse(file).name;
      const COMPONENT_CONTENT = await FS.promises.readFile(filePath, "utf-8");

      // Заменяем все вхождения {{TAG_NAME}} на содержимое компонента
      const TAG_PATTERN = new RegExp(`{{${TAG_NAME}}}`, "g");
      templateContent = templateContent.replace(TAG_PATTERN, COMPONENT_CONTENT);
    }

    // Записываем результат в index.html
    await FS.promises.writeFile(INDEX_PATH, templateContent);
    console.log("Файл index.html создан!");
  } catch (err) {
    console.error("Ошибка при создании HTML:", err);
  }
}

async function mergeStyles() {
  try {
    // Получаем список файлов в папке styles
    const FILES = await FS.promises.readdir(STYLES_DIR, {
      withFileTypes: true,
    });

    // Массив для хранения данных стилей
    let stylesContent = "";

    // Проходим по всем файлам в папке
    for (const file of FILES) {
      const filePath = PATH.join(STYLES_DIR, file.name);

      // Проверяем, что это файл с расширением .css
      if (file.isFile() && PATH.extname(file.name) === ".css") {
        // Читаем содержимое CSS файла
        const fileContent = await FS.promises.readFile(filePath, "utf-8");
        // Добавляем содержимое файла в общий массив стилей
        stylesContent += fileContent + "\n"; // Добавляем перенос строки для разделения файлов
      }
    }

    // Записываем все стили в файл bundle.css
    await FS.promises.writeFile(BUNDLE_PATH, stylesContent);

    console.log("Стили объединены и записаны в bundle.css");
  } catch (err) {
    console.error("Ошибка при объединении стилей:", err);
  }
}

// Функция для рекурсивного копирования папки assets
async function copyAssets() {
  try {
    const assetFiles = await FS.promises.readdir(ASSETS_DIR, {
      withFileTypes: true,
    });

    // Создаем папку assets в проекте, если она еще не существует
    await FS.promises.mkdir(PATH.join(DIST_DIR, "assets"), { recursive: true });

    // Проходим по всем файлам и папкам в папке assets
    for (let file of assetFiles) {
      const srcPath = PATH.join(ASSETS_DIR, file.name); // Исходный путь
      const destPath = PATH.join(DIST_DIR, "assets", file.name); // Путь назначения

      if (file.isDirectory()) {
        // Если это директория, рекурсивно копируем её содержимое
        await copyDirectory(srcPath, destPath);
      } else {
        // Если это файл, просто копируем его
        await FS.promises.copyFile(srcPath, destPath);
      }
    }

    console.log("Папка assets скопирована!");
  } catch (err) {
    console.error("Ошибка при копировании папки assets:", err);
  }
}

// Функция для рекурсивного копирования содержимого папки
async function copyDirectory(srcDir, destDir) {
  try {
    // Создаем директорию, если она не существует
    await FS.promises.mkdir(destDir, { recursive: true });

    const files = await FS.promises.readdir(srcDir, { withFileTypes: true });

    // Проходим по всем файлам и папкам в текущей директории
    for (const file of files) {
      const srcPath = PATH.join(srcDir, file.name);
      const destPath = PATH.join(destDir, file.name);

      if (file.isDirectory()) {
        // Если это директория, рекурсивно копируем её
        await copyDirectory(srcPath, destPath);
      } else {
        // Если это файл, копируем его
        await FS.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error("Ошибка при копировании директории:", err);
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
async function Builder() {
  await clearDir(DIST_DIR);

  console.log("Папка проекта очищена!");

  await createDistFolder();
  await createHtml();
  await mergeStyles();
  await copyAssets();

  console.log("Cоздание завершено!");
}

Builder();

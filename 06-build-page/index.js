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

    // // Создаем директорию project-dist, если она не существует
    // await FS.promises.mkdir(DIST_DIR, { recursive: true });

    // Записываем все стили в файл bundle.css
    await FS.promises.writeFile(BUNDLE_PATH, stylesContent);

    console.log("Стиль объединен и записан в bundle.css");
  } catch (err) {
    console.error("Ошибка при объединении стилей:", err);
  }
}

async function copyDir(SRC, DEST) {
  try {
    // Создаём папку назначения, если её нет
    await FS.promises.mkdir(DEST, { recursive: true });

    // Читаем содержимое исходной папки
    const ITEMS = await FS.promises.readdir(SRC, { withFileTypes: true });

    for (let ITEM of ITEMS) {
      const SRC_PATH = PATH.join(SRC, ITEM.name); // Путь к исходному объекту
      const DEST_PATH = PATH.join(DIST_DIR, "assets", ITEM.name); // Путь к целевому объекту

      if (ITEM.isDirectory()) {
        // Если это директория, рекурсивно копируем
        await FS.promises.mkdir(DEST_PATH, { recursive: true });
        await copyDir(SRC_PATH, DEST_PATH);
      } else {
        // Если это файл, просто копируем
        await FS.promises.copyFile(SRC_PATH, DEST_PATH);
      }
    }

    console.log("Папка assets скопирована!");
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
  await createDistFolder();
  await createHtml();
  await mergeStyles();

  // Очищаем папку назначения
  // await clearDir(DIST_DIR);

  // Копируем файлы и папки
  await copyDir(ASSETS_DIR, DIST_DIR);

  // console.log("Копирование завершено!");
}

main();

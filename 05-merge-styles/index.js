const fs = require("fs");
const path = require("path");

// Папка с исходными стилями
const STYLES_DIR = path.join(__dirname, "styles");
// Папка для конечного файла
const DIST_DIR = path.join(__dirname, "project-dist");
// Путь к конечному файлу
const BUNDLE_PATH = path.join(DIST_DIR, "bundle.css");

// Функция для объединения стилей
async function mergeStyles() {
  try {
    // Получаем список файлов в папке styles
    const files = await fs.promises.readdir(STYLES_DIR, {
      withFileTypes: true,
    });

    // Массив для хранения данных стилей
    let stylesContent = "";

    // Проходим по всем файлам в папке
    for (const file of files) {
      const filePath = path.join(STYLES_DIR, file.name);

      // Проверяем, что это файл с расширением .css
      if (file.isFile() && path.extname(file.name) === ".css") {
        // Читаем содержимое CSS файла
        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        // Добавляем содержимое файла в общий массив стилей
        stylesContent += fileContent + "\n"; // Добавляем перенос строки для разделения файлов
      }
    }

    // Создаем директорию project-dist, если она не существует
    await fs.promises.mkdir(DIST_DIR, { recursive: true });

    // Записываем все стили в файл bundle.css
    await fs.promises.writeFile(BUNDLE_PATH, stylesContent);

    console.log("Стиль объединен и записан в bundle.css");
  } catch (err) {
    console.error("Ошибка при объединении стилей:", err);
  }
}

// Вызываем функцию объединения стилей
mergeStyles();

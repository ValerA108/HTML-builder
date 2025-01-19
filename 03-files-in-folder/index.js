const PATH = require("path");
const { readdir, stat } = require("fs/promises");

(async () => {
  try {
    // Полный путь к папке "secret-folder"
    const FOLDER_PATH = PATH.join(__dirname, "secret-folder");

    // Чтение содержимого папки с опцией { withFileTypes: true }
    // Это позволяет получить дополнительные данные о каждом объекте
    const FILES = await readdir(FOLDER_PATH, { withFileTypes: true });

    // Перебираем только файлы, отфильтровав директории
    for (const FILE of FILES.filter((file) => file.isFile())) {
      // Полный путь к текущему файлу
      const FILE_PATH = PATH.join(FOLDER_PATH, FILE.name);

      // Извлекаем имя файла (без расширения) и его расширение
      const { name: FILE_NAME, ext: FILE_EXTENSION } = PATH.parse(FILE.name);

      // Получаем размер файла в байтах
      const { size: FILE_SIZE } = await stat(FILE_PATH);

      // Выводим информацию о файле в формате: "имя - расширение - размер"
      console.log(
        `${FILE_NAME} - ${FILE_EXTENSION.slice(1)} - ${FILE_SIZE} bytes`
      );
    }
  } catch (ERR) {
    // Обработка ошибок, например, если папка не существует
    console.error("Ошибка при обработке файлов:", ERR);
  }
})();

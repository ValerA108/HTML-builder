const fs = require("fs");
const path = require("path");
const { stdin, stdout } = process;

// Путь к файлу
const FILE_PATH = path.join(__dirname, "text.txt");

// Создаем (или перезаписываем) файл изначально
fs.writeFile(FILE_PATH, "", (err) => {
  if (err) throw err;
});

// Приветственное сообщение
stdout.write("Введите любой текст (или напишите 'exit' для выхода):\n");

// Обработка ввода пользователя
stdin.on("data", (data) => {
  const INPUT = data.toString().trim();

  // Проверяем, ввел ли пользователь команду выхода
  if (INPUT === "exit") {
    farewellAndExit();
  } else {
    // Добавляем текст в файл
    fs.appendFile(FILE_PATH, INPUT + "\n", (err) => {
      if (err) throw err;
      stdout.write("Запись добавлена. Введите следующий текст:\n");
    });
  }
});

// Обработка сигнала SIGINT (Ctrl+C)
process.on("SIGINT", farewellAndExit);

// Функция для вывода прощального сообщения и завершения процесса
function farewellAndExit() {
  console.log("Всего доброго, выход из приложения!");
  process.exit();
}

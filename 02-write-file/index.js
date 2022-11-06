const fs = require("fs");
const path = require("path");
const { stdin, stdout, exit } = process;

fs.writeFile(path.join(__dirname, "text.txt"), "", (err) => {
  if (err) throw err;
});

stdout.write("Введите любой текст\n");
stdin.on("data", (data) => {
  const text = data.toString();
  fs.appendFile(path.join(__dirname, "text.txt"), data, (err) => {
    if (err) throw err;
    // console.log("добавил вашу запись!");
  });

  process.stdin.on("data", (data) => {
    if (data.toString().trim() === "exit") {
      console.log("Всего доброго, выход из приложения!");
      process.exit();
    }

    process.on("SIGINT", function () {
      console.log("Bye-bye, выход из приложения!");
      process.exit();
    });
  });
});

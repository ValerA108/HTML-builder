const fs = require("fs");
const path = require("path");
const { readdir, stat } = require("fs/promises");

let fName = path.join(__dirname, "secret-folder");

fs.readdir(fName, (err, data) => {
  data.forEach((file) => {
    fs.stat(fName, (err, stats) => {
      if (err) {
        console.log(err);
      }
      console.log(
        file.split(".").slice(0, -1).join(".") +
          ` ===> Расширение файла: ` +
          file.split(".").pop() +
          ` ==> ` +
          stats.size +
          " bytes"
      );
    });
  });
});

const fs = require('fs');

const deleteFiles = (paths = [], callback = () => {}) => {
  paths.forEach(path => {
    fs.existsSync(path) && fs.unlinkSync(path);
  });

  callback();
}

const writeFile = (name, data) => {
  fs.writeFileSync(name, data);
}

module.exports = {
  deleteFiles,
  writeFile
}
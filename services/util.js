const fs = require('fs');

exports.createPhotoDirectory = async (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

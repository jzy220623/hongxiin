const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB for avatar (client-side crop will reduce size)
  }
});

module.exports = upload;
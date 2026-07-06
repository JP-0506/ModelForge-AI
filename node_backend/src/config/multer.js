import multer from "multer";

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_PATH,

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export default upload;
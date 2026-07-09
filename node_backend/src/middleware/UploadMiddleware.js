import multer from "multer";

// Store file in memory (temporary)
const storage = multer.memoryStorage();

// Allowed MIME Types
const allowedMimeTypes = [
  "text/csv",
  "application/json",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// File Filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only .csv, .xlsx, .xls and .json files are allowed."
      ),
      false
    );
  }
};

// Multer Configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

export default upload;
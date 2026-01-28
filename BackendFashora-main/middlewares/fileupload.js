const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const filename = `${file.fieldname}-${uuidv4()}.${ext}`;
    cb(null, filename);
  }
});


const profileImageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG images are allowed for profile"), false);
  }
};

// Generic file filter (any image)
const genericImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};


const uploadProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: profileImageFilter
});

const uploadGeneric = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: genericImageFilter
});

module.exports = {
  profile: (fieldName) => uploadProfile.single(fieldName),
  single: (fieldName) => uploadGeneric.single(fieldName),
  array: (fieldName, maxCount) => uploadGeneric.array(fieldName, maxCount),
  fields: (fieldsArray) => uploadGeneric.fields(fieldsArray)
};

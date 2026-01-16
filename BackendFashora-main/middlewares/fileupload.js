const multer = require("multer")
const { v4: uuidv4 } = require("uuid")

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop()
        const filename = `${file.fieldname}-${uuidv4()}.${ext}`
        cb(null, filename)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true)
    else cb(new Error("Only image allowed"), false)
}
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },// byte// optional
    fileFilter // optional
})

module.exports = {
    single: (fieldName) =>
        upload.single(fieldName),
    array: (fieldName, maxCount) =>
        upload.array(
            fieldName, maxCount
        ),
    fields: (fieldsArray) =>
        upload.fields(fieldsArray)
}
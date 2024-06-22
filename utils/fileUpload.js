const multer = require('multer');

const FILE_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storageFile = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValidFormat = FILE_TYPE[file.mimetype]
        let uploadError = new Error('Invalid image format')
        if (isValidFormat) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extension = FILE_TYPE[file.mimetype]
        const uniqueFileImage = `image-${Date.now()}.${extension}`
        
        cb(null, uniqueFileImage)
    }
})

exports.uploadOption = multer({ storage: storageFile })


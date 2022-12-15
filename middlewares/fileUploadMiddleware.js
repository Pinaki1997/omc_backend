const multer = require('multer');
const path = require('path');


// Image Filter
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload an image.', 400), false);
    }
};

// Handle Author Profile Images
const authorProfileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../', 'images', 'author/'));
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${Date.now()}.${ext}`);
    },
});

const authorProfile = multer({
    fileFilter: multerFilter,
    storage: authorProfileImageStorage,
});

// Handle Book Images

const BookImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../', 'images', 'book/'));
        console.log(file);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${Math.floor(Math.random() * 10000)}${Date.now()}.${ext}`);
    },
});

const BookImage = multer({
    fileFilter: multerFilter,
    storage: BookImageStorage,
});

exports.uploadAuthorProfileImage = authorProfile.single('profile_photo');

exports.uploadBookImage = BookImage.fields([
    { name: 'f_image', maxCount: 1 },
    { name: 'b_image', maxCount: 1 },
]);
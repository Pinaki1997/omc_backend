const catchAsync = require("../../utils/catchAsync");
const BookMaster = require("../../models/admin/BookMaster");
const BookDetailsMaster = require("../../models/admin/BookDetailsMaster");
const BookReferenceUniqueNumberMaster = require("../../models/admin/BookReferenceUniqueNumberMaster");
const AppError = require("../../utils/appError");
const AppSuccess = require("../../utils/appSuccess");
const qrCode = require("qrcode");

let userId = '';
let imgFrontData = '';
let imgBackData = '';

exports.store = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    const existingBookByOtherDetails = await BookMaster.findOne({
        title: req.body.title,
        authorID: req.body.author,
        genreID: req.body.genres,
        edition: req.body.edition,
        publisherID: req.body.publisher,
        status: 1,
        deleted: 0
    });

    if (existingBookByOtherDetails) {
        return next(
            new AppError("Book already exists", 400, { type: "duplicate book" })
        );
    }

    const url = req.protocol + "://" + req.get("host");

    if (req.files.f_image == undefined) {
        imgFrontData = null;
    } else {
        imgFrontData = url + "/images/book/" + req.files.f_image[0].filename;
    }

    if (req.files.b_image == undefined) {
        imgBackData = null;
    } else {
        imgBackData = url + "/images/book/" + req.files.b_image[0].filename;
    }

    const newBook = await BookMaster.create({
        title: req.body.title,
        isbn: req.body.isbn,
        authorID: req.body.author,
        genreID: req.body.genres,
        edition: req.body.edition,
        pages: req.body.pages,
        publisherID: req.body.publisher,
        publishedYear: req.body.publishedYear,
        description: req.body.description,
        front_image: imgFrontData,
        back_image: imgBackData,
        created_by: userId
    });

    if (newBook) {

        const data = {
            title: newBook.title,
            id: newBook._id,
        };

        response.createResponse({
            message: "Book successfully added",
            book: data,
        });
    } else {
        return next(new AppError("Something went wrong", 500));
    }
});

exports.bookList = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);
    const books = await BookMaster.find({
        status: 1,
        deleted: 0,
    }, {
        "title": 1,
        "edition": 1,
        "pages": 1,
        "publishedYear": 1,
        "description": 1,
        "front_image": 1,
        "back_image": 1,
    }).populate({
        path: 'authorID',
        select: ['first_name', 'middle_name', 'last_name', 'profile_image', 'description']
    }).populate({
        path: 'publisherID',
        select: ['title']
    }).populate({
        path: 'genreID',
        select: ['title']
    }).sort({ createdAt: -1 });

    response.successResponse({
        message: `Total books count= ${ books.length }`,
        bookList: books
    });

});

exports.bookUpdate = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.bookId == "") {
        return next(new AppError("Book details not found", 500));
    }

    const checkbookID = await BookMaster.findById(req.body.bookId, {
        deleted: 0
    });

    const existingBookByOtherDetails = await BookMaster.find({
        _id: { $ne: req.body.publisherID },
        title: req.body.title,
        authorID: req.body.author,
        genreID: req.body.genres,
        edition: req.body.edition,
        publisherID: req.body.publisher,
        status: 1,
        deleted: 0
    });

    if (existingBookByOtherDetails.length > 0) {
        return next(
            new AppError("Book already exists", 400, { type: "duplicate book" })
        );
    }

    if (checkbookID) {
        try {

            const url = req.protocol + "://" + req.get("host");

            if (req.files.f_image == undefined) {
                imgFrontData = null;
            } else {
                imgFrontData = url + "/images/book/" + req.files.f_image[0].filename;
            }

            if (req.files.b_image == undefined) {
                imgBackData = null;
            } else {
                imgBackData = url + "/images/book/" + req.files.b_image[0].filename;
            }

            const updateBook = await BookMaster.findByIdAndUpdate(req.body.bookId, {
                title: req.body.title,
                isbn: req.body.isbn,
                authorID: req.body.author,
                genreID: req.body.genres,
                edition: req.body.edition,
                pages: req.body.pages,
                publisherID: req.body.publisher,
                publishedYear: req.body.publishedYear,
                description: req.body.description,
                front_image: imgFrontData,
                back_image: imgBackData,
                updated_by: userId
            });

            if (updateBook) {

                const data = {
                    id: updateBook._id,
                };

                response.createResponse({
                    message: "Book details update successfully.",
                    book: data,
                });
            } else {
                return next(new AppError("Something went wrong", 500));
            }
        } catch (err) {
            return next(new AppError("Something went wrong.", 500));
        }
    } else {
        return next(new AppError("Book details not found.", 500));
    }
});


exports.storeBookStock = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);
    let bookQuantity = '';
    const getBookQuantity = +req.body.quantity;

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.bookId == "") {
        return next(new AppError("Book details not found", 500));
    }

    const checkbookID = await BookMaster.findById(req.body.bookId, {
        deleted: 0
    });

    if (checkbookID) {
        // try {

        if (checkbookID.quantity == "" || checkbookID.quantity == null) {
            bookQuantity = getBookQuantity;
        } else {
            bookQuantity = getBookQuantity + (+checkbookID.quantity);
        }

        const updateBook = await BookMaster.findByIdAndUpdate(req.body.bookId, {
            quantity: bookQuantity,
            updated_by: userId
        });

        if (updateBook) {

            const url = req.protocol + "://" + req.get("host");

            let i = 1;
            let refNumber = '';

            while (i <= getBookQuantity) {

                const bookRefMasterCheck = await BookDetailsMaster.find({});

                if (bookRefMasterCheck.length > 0) {
                    const lastRecordBookDetails = await BookDetailsMaster.findOne({}, {
                        'bookReferenceNumber': 1
                    }).sort({ createdAt: -1 });
                    refNumber = lastRecordBookDetails.bookReferenceNumber;
                } else {
                    refNumber = 11111;
                }

                newReferenceNumber = refNumber + 1;

                let textNewReferenceNumber = newReferenceNumber.toString();

                // Get the base64 url
                qrCode.toDataURL(textNewReferenceNumber, (err, src) => {
                    if (err) return console.log(err);

                    let base64Data = src.replace(/^data:image\/png;base64,/, "");

                    let imageName = `${Math.floor(Math.random() * 10000)}${Date.now()}.png`;
                    let imagePath = url + "/images/qrCode/" + imageName;

                    require("fs").writeFile("images/qrCode/" + imageName, base64Data, 'base64', function(err) {
                        if (err) console.log(err);
                    });

                    const bookStockDetails = BookDetailsMaster.create({
                        bookID: req.body.bookId,
                        bookReferenceNumber: 12365456,
                        qrCodePath: imagePath,
                        bookStatus: 1,
                        created_by: userId
                    });

                });

                i++;

            }

            const data = {
                id: updateBook._id,
                bookName: updateBook.title,
                totalQuantity: bookQuantity
            };

            response.createResponse({
                message: "Book stock added successfully.",
                book: data,
            });
        } else {
            return next(new AppError("Something went wrong", 500));
        }
        // } catch (err) {
        //     return next(new AppError("Something went wrong.", 500));
        // }
    } else {
        return next(new AppError("Book details not found.", 500));
    }
});

exports.findBook = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const bookDetails = await BookMaster.find({
        _id: req.params.id,
        deleted: 0
    }, {
        "title": 1,
        "edition": 1,
        "pages": 1,
        "publishedYear": 1,
        "description": 1,
        "front_image": 1,
        "back_image": 1,
    }).populate({
        path: 'authorID',
        select: ['first_name', 'middle_name', 'last_name', 'profile_image', 'description']
    }).populate({
        path: 'publisherID',
        select: ['title']
    }).populate({
        path: 'genreID',
        select: ['title']
    }).sort({ createdAt: -1 });

    if (bookDetails.length > 0) {
        response.successResponse({
            message: `Book Details`,
            bookData: bookDetails
        });
    } else {
        return next(new AppError("Book details not found.", 500));
    }

});
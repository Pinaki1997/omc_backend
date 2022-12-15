const catchAsync = require("../../utils/catchAsync");
const AuthorMaster = require("../../models/admin/authorMaster");
const BookMaster = require("../../models/admin/BookMaster");
const AppError = require("../../utils/appError");
const AppSuccess = require("../../utils/appSuccess");

let imgData = '';
let userId = '';

exports.store = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const url = req.protocol + "://" + req.get("host");

    if (req.file == undefined) {
        imgData = null;
    } else {
        imgData = url + "/images/author/" + req.file.filename;
    }

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    const newAuthor = await AuthorMaster.create({
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        profile_image: imgData,
        description: req.body.description,
        created_by: userId
    });

    if (newAuthor) {

        const data = {
            name: `${newAuthor.first_name} ${newAuthor.middle_name} ${newAuthor.last_name}`,
            id: newAuthor._id,
        };

        response.createResponse({
            message: "Author successfully added",
            author: data,
        });
    } else {
        return next(new AppError("Something went wrong", 500));
    }
});

exports.authorList = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    const authorDetails = await AuthorMaster.find({
            status: 1,
            deleted: 0,
        }, {
            'first_name': 1,
            'middle_name': 1,
            'last_name': 1,
            'profile_image': 1,
            'description': 1,
        }).sort({ createdAt: -1 })
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);

    response.successResponse({
        message: `Total authors count= ${ authorDetails.length }`,
        authorList: authorDetails
    });

});

exports.authorDestroy = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.authorId == "") {
        return next(new AppError("Author details not found", 500));
    }

    try {

        const checkAuthorTransactionData = await BookMaster.find({
            authorID: req.body.authorId,
            deleted: 0
        });

        if (checkAuthorTransactionData && checkAuthorTransactionData.length > 0) {

            return next(
                new AppError(
                    "Unable to delete the data. Transactional data already exist",
                    500, {
                        type: "author_transaction_exist",
                    }
                )
            );
        }

        const deleteAuthor = await AuthorMaster.findByIdAndUpdate(req.body.authorId, {
            deleted: 1,
            updated_by: userId
        });

        if (deleteAuthor) {

            const data = {
                id: deleteAuthor._id,
            };

            response.createResponse({
                message: "Author deleted successfully.",
                author: data,
            });
        } else {
            return next(new AppError("Something went wrong", 500));
        }
    } catch (err) {
        return next(new AppError("Something went wrong.", 500));
    }
});

exports.authorUpdate = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.authorId == "") {
        return next(new AppError("Author details not found", 500));
    }

    const checkAuthorID = await AuthorMaster.findById(req.body.authorId, {
        deleted: 0
    });

    if (checkAuthorID) {
        try {

            const url = req.protocol + "://" + req.get("host");

            if (req.file == undefined) {
                imgData = null;
            } else {
                imgData = url + "/images/author/" + req.file.filename;
            }

            const updateAuthor = await AuthorMaster.findByIdAndUpdate(req.body.authorId, {
                first_name: req.body.first_name,
                middle_name: req.body.middle_name,
                last_name: req.body.last_name,
                profile_image: imgData,
                description: req.body.description,
                updated_by: userId
            });

            if (updateAuthor) {

                const data = {
                    id: updateAuthor._id,
                };

                response.createResponse({
                    message: "Author details update successfully.",
                    author: data,
                });
            } else {
                return next(new AppError("Something went wrong", 500));
            }
        } catch (err) {
            return next(new AppError("Something went wrong.", 500));
        }
    } else {
        return next(new AppError("Author details not found.", 500));
    }
});

exports.findAuthor = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const authorDetails = await AuthorMaster.find({
        _id: req.params.id,
        deleted: 0
    }, {
        'first_name': 1,
        'middle_name': 1,
        'last_name': 1,
        'profile_image': 1,
        'description': 1
    });

    if (authorDetails.length > 0) {
        response.successResponse({
            message: `Author Details`,
            authorData: authorDetails
        });
    } else {
        return next(new AppError("Author details not found.", 500));
    }

});
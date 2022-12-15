const catchAsync = require("../../utils/catchAsync");
const GenreMaster = require("../../models/admin/genreMaster");
const BookMaster = require("../../models/admin/BookMaster");
const AppError = require("../../utils/appError");
const AppSuccess = require("../../utils/appSuccess");

exports.store = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);
    let userId = '';

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    const existingGenreByTitle = await GenreMaster.findOne({
        title: req.body.title,
        status: 1,
        deleted: 0
    });

    if (existingGenreByTitle) {
        return next(
            new AppError("Genre already exists", 400, { type: "duplicate genre" })
        );
    }

    const newGenre = await GenreMaster.create({
        title: req.body.title,
        created_by: userId
    });

    if (newGenre) {

        const data = {
            title: newGenre.title,
            id: newGenre._id,
        };

        response.createResponse({
            message: "Genre successfully added",
            genre: data,
        });
    } else {
        return next(new AppError("Something went wrong", 500));
    }
});

exports.genreList = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const genreDetails = await GenreMaster.find({
        status: 1,
        deleted: 0,
    }, {
        'title': 1
    }).sort({ createdAt: -1 });

    response.successResponse({
        message: `Total genre count= ${ genreDetails.length }`,
        genreList: genreDetails
    });

});

exports.genreUpdate = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.genreID == "") {
        return next(new AppError("Genre details not found", 500));
    }

    const checkGenreID = await GenreMaster.findById(req.body.genreID, {
        deleted: 0
    });

    const checkDuplicateGenre = await GenreMaster.find({
        _id: { $ne: req.body.genreID },
        title: req.body.title,
        deleted: 0
    });

    if (checkDuplicateGenre.length > 0) {
        return next(
            new AppError("Genre name already exists", 400, { type: "duplicate genre" })
        );
    }

    if (checkGenreID) {
        try {

            const updateGenre = await GenreMaster.findByIdAndUpdate(req.body.genreID, {
                title: req.body.title,
                updated_by: userId
            });

            if (updateGenre) {

                const data = {
                    id: updateGenre._id,
                };

                response.createResponse({
                    message: "Genre details update successfully.",
                    genre: data,
                });
            } else {
                return next(new AppError("Something went wrong", 500));
            }
        } catch (err) {
            return next(new AppError("Something went wrong.", 500));
        }
    } else {
        return next(new AppError("Genre details not found.", 500));
    }
});

exports.genreDestroy = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.genreID == "") {
        return next(new AppError("Genre details not found", 500));
    }

    try {

        const checkGenreTransactionData = await BookMaster.find({
            genreID: req.body.genreID,
            deleted: 0
        });

        if (checkGenreTransactionData && checkGenreTransactionData.length > 0) {

            return next(
                new AppError(
                    "Unable to delete the data. Transactional data already exist",
                    500, {
                        type: "genre_transaction_exist",
                    }
                )
            );
        }

        const deleteGenre = await GenreMaster.findByIdAndUpdate(req.body.genreID, {
            deleted: 1,
            updated_by: userId
        });

        if (deleteGenre) {

            const data = {
                id: deleteGenre._id,
            };

            response.createResponse({
                message: "Genre deleted successfully.",
                genre: data,
            });
        } else {
            return next(new AppError("Something went wrong", 500));
        }
    } catch (err) {
        return next(new AppError("Something went wrong.", 500));
    }
});

exports.findGenre = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const genreDetails = await GenreMaster.find({
        _id: req.params.id,
        deleted: 0
    }, {
        'title': 1
    });

    if (genreDetails.length > 0) {
        response.successResponse({
            message: `Genre Details`,
            genreData: genreDetails
        });
    } else {
        return next(new AppError("Genre details not found.", 500));
    }

});
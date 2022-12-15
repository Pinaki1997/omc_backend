const catchAsync = require("../../utils/catchAsync");
const PublisherMaster = require("../../models/admin/publisherMaster");
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

    const existingPublisherByTitle = await PublisherMaster.findOne({
        title: req.body.title,
        status: 1,
        deleted: 0
    });

    if (existingPublisherByTitle) {
        return next(
            new AppError("Publisher name already exists", 400, { type: "duplicate publisher" })
        );
    }

    const newPublisher = await PublisherMaster.create({
        title: req.body.title,
        created_by: userId
    });

    if (newPublisher) {

        const data = {
            title: newPublisher.title,
            id: newPublisher._id,
        };

        response.createResponse({
            message: "Publisher successfully added",
            publisher: data,
        });
    } else {
        return next(new AppError("Something went wrong", 500));
    }
});

exports.publisherList = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const publisherDetails = await PublisherMaster.find({
        status: 1,
        deleted: 0,
    }, {
        'title': 1
    }).sort({ createdAt: -1 });

    response.successResponse({
        message: `Total publisher count= ${ publisherDetails.length }`,
        publisherList: publisherDetails
    });

});

exports.publisherDestroy = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.publisherId == "") {
        return next(new AppError("Publisher details not found", 500));
    }

    try {

        const checkPublisherTransactionData = await BookMaster.find({
            publisherID: req.body.publisherId,
            deleted: 0
        });

        if (checkPublisherTransactionData && checkPublisherTransactionData.length > 0) {

            return next(
                new AppError(
                    "Unable to delete the data. Transactional data already exist",
                    500, {
                        type: "publisher_transaction_exist",
                    }
                )
            );
        }

        const deletePublisher = await PublisherMaster.findByIdAndUpdate(req.body.publisherId, {
            deleted: 1,
            updated_by: userId
        });

        if (deletePublisher) {

            const data = {
                id: deletePublisher._id,
            };

            response.createResponse({
                message: "Publisher deleted successfully.",
                publisher: data,
            });
        } else {
            return next(new AppError("Something went wrong", 500));
        }
    } catch (err) {
        return next(new AppError("Something went wrong.", 500));
    }
});

exports.publisherUpdate = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    if (req.body.publisherID == "") {
        return next(new AppError("Publisher details not found", 500));
    }

    const checkPublisherID = await PublisherMaster.findById(req.body.publisherID, {
        deleted: 0
    });

    const checkDuplicatePublisher = await PublisherMaster.find({
        _id: { $ne: req.body.publisherID },
        title: req.body.title,
        deleted: 0
    });

    if (checkDuplicatePublisher.length > 0) {
        return next(
            new AppError("Publisher name already exists", 400, { type: "duplicate publisher" })
        );
    }

    if (checkPublisherID) {
        try {

            const updatePublisher = await PublisherMaster.findByIdAndUpdate(req.body.publisherID, {
                title: req.body.title,
                updated_by: userId
            });

            if (updatePublisher) {

                const data = {
                    id: updatePublisher._id,
                };

                response.createResponse({
                    message: "Publisher details update successfully.",
                    publisher: data,
                });
            } else {
                return next(new AppError("Something went wrong", 500));
            }
        } catch (err) {
            return next(new AppError("Something went wrong.", 500));
        }
    } else {
        return next(new AppError("Publisher details not found.", 500));
    }
});

exports.findPublisher = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const publisherDetails = await PublisherMaster.find({
        _id: req.params.id,
        deleted: 0
    }, {
        'title': 1
    });

    if (publisherDetails.length > 0) {
        response.successResponse({
            message: `Publisher Details`,
            publisherData: publisherDetails
        });
    } else {
        return next(new AppError("Publisher details not found.", 500));
    }

});
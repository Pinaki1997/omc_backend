const catchAsync = require("../../utils/catchAsync");
const ShelfMaster = require("../../models/admin/shelfMaster");
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

    const existingShelfByName = await ShelfMaster.findOne({
        shelfName: req.body.shelf_name,
        rackID: req.body.rack_name,
        status: 1,
        deleted: 0
    });

    if (existingShelfByName) {
        return next(
            new AppError("Shelf already exists", 400, { type: "duplicate shelf name" })
        );
    }

    const newShelf = await ShelfMaster.create({
        shelfName: req.body.shelf_name,
        rackID: req.body.rack_name,
        libraryID: req.body.library_name,
        created_by: userId
    });

    if (newShelf) {

        const data = {
            shelfName: newShelf.shelfName,
            id: newShelf._id,
        };

        response.createResponse({
            message: "Shelf successfully added",
            shelf: data,
        });
    } else {
        return next(new AppError("Something went wrong", 500));
    }
});

exports.shelfList = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const shelfDetails = await ShelfMaster.aggregate([{
            $lookup: {
                from: "rackmasters",
                localField: "rackID",
                foreignField: "_id",
                as: "rackDetails"
            },
        },
        {
            $lookup: {
                from: "librarymasters",
                localField: "libraryID",
                foreignField: "_id",
                as: "libraryDetails"
            },
        },
        {
            $project: {
                "shelfName": 1,
                "rackDetails.rackName": 1,
                "libraryDetails.libraryName": 1,
            }
        },
        { $unwind: { path: "$rackDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$libraryDetails", preserveNullAndEmptyArrays: true } },
    ]).sort({ createdAt: -1 });

    response.successResponse({
        message: `Total rack count= ${ shelfDetails.length }`,
        shelfList: shelfDetails
    });

});

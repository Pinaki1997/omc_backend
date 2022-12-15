const catchAsync = require("../../utils/catchAsync");
const RackMaster = require("../../models/admin/rackMaster");
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

    const existingRackByName = await RackMaster.findOne({
        rackName: req.body.rack_name,
        libraryID: req.body.library_name,
        status: 1,
        deleted: 0
    });

    if (existingRackByName) {
        return next(
            new AppError("Rack already exists", 400, { type: "duplicate rack name" })
        );
    }

    const newRack = await RackMaster.create({
        rackName: req.body.rack_name,
        libraryID: req.body.library_name,
        created_by: userId
    });

    if (newRack) {

        const data = {
            title: newRack.rackName,
            id: newRack._id,
        };

        response.createResponse({
            message: "Rack successfully added",
            rack: data,
        });
    } else {
        return next(new AppError("Something went wrong", 500));
    }
});

exports.rackList = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);

    const rackDetails = await RackMaster.aggregate([{
            $lookup: {
                from: "librarymasters",
                localField: "libraryID",
                foreignField: "_id",
                as: "libraryDetails"
            },
        },
        {
            $project: {
                "rackName": 1,
                "libraryDetails.libraryName": 1
            }
        },
        { $unwind: { path: "$libraryDetails", preserveNullAndEmptyArrays: true } }
    ]).sort({ createdAt: -1 });

    response.successResponse({
        message: `Total rack count= ${ rackDetails.length }`,
        rackList: rackDetails
    });

});

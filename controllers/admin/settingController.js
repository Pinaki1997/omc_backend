const catchAsync = require("../../utils/catchAsync");
const SettingMaster = require("../../models/admin/settingMaster");
const BookReturnDaysHistory = require("../../models/admin/bookReturnDaysHistory");
const MaximumBookIssuedHistory = require("../../models/admin/maximumBookIssuedHistory");
const AppError = require("../../utils/appError");
const AppSuccess = require("../../utils/appSuccess");

exports.store = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);
    let userId = '';
    let bookReturnValue = '';

    if (req.user) {
        userId = req.user._id;
    } else {
        userId = "";
    }

    const existingSettingByDetails = await SettingMaster.findOne({
        status: 1,
        deleted: 0
    });

    if (existingSettingByDetails) {
        try {

            const updateSetting = await SettingMaster.findByIdAndUpdate(existingSettingByDetails.id, {
                bookReturnDays: req.body.bookReturnDays,
                maximumBookIssued: req.body.maximumBookIssued,
                updated_by: userId
            });

            await BookReturnDaysHistory.create({
                bookReturnDays: req.body.bookReturnDays,
                created_by: userId
            });

            await MaximumBookIssuedHistory.create({
                maximumBookIssued: req.body.maximumBookIssued,
                created_by: userId
            });

            if (updateSetting) {

                const data = {
                    id: updateSetting._id,
                };

                response.createResponse({
                    message: "Setting successfully updated.",
                    setting: data,
                });
            } else {
                return next(new AppError("Something went wrong", 500));
            }
        } catch (err) {
            return next(new AppError("Something went wrong.", 500));
        }

    } else {

        if (req.body.bookReturnDays == null || req.body.bookReturnDays == "" || req.body.bookReturnDays == undefined) {
            bookReturnValue = "";
        } else {
            bookReturnValue = req.body.bookReturnDays;
        }

        if (req.body.maximumBookIssued == null || req.body.maximumBookIssued == "" || req.body.maximumBookIssued == undefined) {
            maximumBookIssuedValue = "";
        } else {
            maximumBookIssuedValue = req.body.maximumBookIssued;
        }

        const newSetting = await SettingMaster.create({
            bookReturnDays: bookReturnValue,
            maximumBookIssued: maximumBookIssuedValue,
            created_by: userId
        });

        await BookReturnDaysHistory.create({
            bookReturnDays: bookReturnValue,
            created_by: userId
        });

        await MaximumBookIssuedHistory.create({
            maximumBookIssued: maximumBookIssuedValue,
            created_by: userId
        });

        if (newSetting) {

            const data = {
                id: newSetting._id,
            };

            response.createResponse({
                message: "Setting successfully added",
                setting: data,
            });
        } else {
            return next(new AppError("Something went wrong", 500));
        }
    }

});

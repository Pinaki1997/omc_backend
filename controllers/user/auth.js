const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../../models/auth/user");
const OTPHistory = require("../../models/auth/otp-history");
const AppError = require("../../utils/appError");
const AppSuccess = require("../../utils/appSuccess");
const helper = require("../../utils/helper");

exports.register = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);
    const randomNumber = helper.createRandomNumber();

    const existingUserByEmail = await User.findOne({
        email: req.body.empEmail,
        status: 1,
        deleted: 0,
    });

    if (existingUserByEmail && existingUserByEmail.verified === true) {
        return next(new AppError("Email already exists", 400, { type: "email" }));
    }

    if (existingUserByEmail && existingUserByEmail.verified === false) {
        const otpHistories = await OTPHistory.find({
            user: existingUserByEmail.id,
            createdAt: {
                // 15 minutes ago (from now)
                $gte: new Date(new Date().getTime() - 1000 * 60 * 15),
            },
        });

        if (otpHistories && otpHistories.length >= 3) {
            const expireTime = new Date(existingUserByEmail.otp_created_time).getMinutes() + 15;

            const currentTime = new Date().getMinutes();

            let minuteValue = "";

            const timeLeft = expireTime - currentTime;

            if (timeLeft === 1) minuteValue = "minute";
            else minuteValue = "minutes";

            return next(
                new AppError(
                    `Maximum OTP limit exceed. Please try after ${timeLeft} ${minuteValue}`,
                    400, {
                        type: "otp",
                    }
                )
            );
        }
        const historyData = await OTPHistory.create({
            user: existingUserByEmail.id,
            otp: randomNumber,
        });

        const d = await User.findByIdAndUpdate(existingUserByEmail.id, {
            otp_value: randomNumber,
            otp_created_time: historyData.createdAt,
        });

        const userExistingData = {
            id: existingUserByEmail._id,
            name: existingUserByEmail.name,
            email: existingUserByEmail.email
        };

        response.createResponse({
            message: "User successfully created",
            user: userExistingData,
        });
        return;
    }

    const existingUserByMobile = await User.findOne({
        mobile: req.body.empMobile,
        status: 1,
        deleted: 0,
        verified: true,
    });

    if (existingUserByMobile) {
        return next(
            new AppError("Mobile number already exists", 400, { type: "phone" })
        );
    }

    const existingUserByEmpId = await User.findOne({
        employee_id: req.body.empId,
        status: 1,
        deleted: 0,
        verified: true,
    });

    if (existingUserByEmpId) {
        return next(
            new AppError("Employee ID already exists", 400, { type: "emp_id" })
        );
    }

    if (req.body.empPassword === req.body.empConfirmPassword) {
        //return next(new AppSuccess('Password matched', 200, req.body))
        const newuser = await User.create({
            name: req.body.empName,
            designation: req.body.empDesignation,
            mobile: req.body.empMobile,
            email: req.body.empEmail,
            department: req.body.empDepartment,
            employee_id: req.body.empId,
            address: req.body.empAddress,
            password: req.body.empPassword,
            user_role: 3,
            otp_value: randomNumber,
            otp_created_time: new Date().toISOString(),
        });

        await OTPHistory.create({
            user: newuser.id,
            otp: randomNumber,
        });

        if (newuser) {

            const userNewData = {
                id: newuser._id,
                name: newuser.name,
                email: newuser.email
            };

            response.createResponse({
                message: "User successfully created",
                user: userNewData,
            });
        } else {
            return next(new AppError("Something went wrong", 500));
        }
    } else {
        return next(
            new AppError("Password does not matched", 400, { type: "password" })
        );
    }

    // res.status(201).json({
    //     status: "success",
    //     data: newuser
    // })
});

exports.login = catchAsync(async(req, res, next) => {
    const response = new AppSuccess(res);
    // TODO: Business logic goes here
    let fetchedUser;

    User.findOne({ email: req.body.UserId, status: 1, deleted: 0, verified: true, })
        .then((user) => {
            if (!user) {
                return next(new AppError("User not found.", 400));
            }
            fetchedUser = user;
            bcrypt.compare(req.body.Password, user.password, (err, ret) => {
                if (ret) {
                    const data = {
                        email: fetchedUser.email,
                        id: fetchedUser._id,
                    };
                    req["user_details"] = {
                        ...data,
                        role: fetchedUser.user_role
                    };

                    const token = jwt.sign(data, "secret_this_should_be_longer", {
                        expiresIn: "10d",
                    });

                    response.successResponse({
                        message: "Login Successful.",
                        user_info: data,
                        token: token,
                    });
                } else {
                    return next(new AppError("Invalid Credentials.", 400));
                }
            });
        })
        .catch((err) => {
            return next(new AppError("Authentication failed.", 400));
        });
});

exports.verifyOtp = catchAsync(async(req, res, next) => {
    const userId = "";
    await User.findByIdAndUpdate();
});
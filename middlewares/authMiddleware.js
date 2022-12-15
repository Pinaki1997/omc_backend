const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require("./../models/auth/user");
const { promisify } = require('util');

exports.isAuthenticated = (req, res, next) => {
    if (req.user_details && req.user_details.id) {
        next()
    } else {
        return next(new AppError('notloggedIn', 401))
    }
}

exports.hasPermission = (...roles) => (req, res, next) => {
    if (roles.includes(req["user_details"]['user_role'])) {
        next()
    } else {
        return next(new AppError('noAccess', 401))
    }
}


exports.protect = catchAsync(async(req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401
            )
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, 'secret_this_should_be_longer');

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

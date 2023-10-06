// const { read } = require('fs');
const crypto = require('crypto');
const util = require('util');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const validator = require('../utils/validator');

const User = require('./../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    // expiresIn: 5,
  });
};

/* const createSendToken = (user, statusCode, res) => {
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
} */

const removeExpiredJWT = cron.schedule(
  '*/5 * * * *',
  async () => {
    let users = await User.find().select('+userJWTs');
    let dateStamp = parseInt(Date.now() / 1000, 10);
    for (const el of users) {
      for (const [index, val] of el.userJWTs.entries()) {
        const decoded = jwt.decode(val);
        if (decoded.exp < dateStamp) {
          el.userJWTs.splice(index, 1);
        }
      }
      await el.save();
      // console.log(el);
    }
  },
  {
    scheduled: true,
  }
);
removeExpiredJWT.start();

// exports.removeExpiredJWT = catchAsync(async (req, res, next) => {});

exports.signup = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string', isEmail: true },
    password: {
      required: true,
      type: 'string',
      minlength: [8, 'Your password must be at least 8 characters long.'],
    },
    passwordConfirm: { required: true, type: 'string' },
    photo: { type: 'string' },
    role: { type: 'string', enum: ['user', 'guide', 'lead-guide', 'admin'] },
  });

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    // passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    role: req.body.role,
  });

  const token = signToken(newUser._id);
  newUser.userJWTs.push(token);
  await newUser.save();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: false, //only be sent via https
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  newUser.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    email: { required: true, type: 'string', isEmail: true },
    password: {
      required: true,
      type: 'string',
      minlength: [8, 'Your password must be at least 8 characters long.'],
    },
  });

  const { email, password } = req.body; // ~ email = req.body.email

  // 2) Check if user exists ** password is correct
  const user = await User.findOne({ email: email }).select(
    '+password +userJWTs'
  ); //+ láy fields password,userJWTs đang có select là false
  if (!user || !(await user.correctPassword(password, user.password))) {
    //nếu !user true thì cả vế true và bỏ qua throwError, nếu false thì sẽ check vế sau(user có tồn tại)
    return next(new AppError('Incorrect email or password', 401)); // 401 = unauthorized
  }

  // console.log(user);
  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  user.userJWTs.push(token);
  await user.save();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: false, //only be sent via https
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
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
      new AppError('You are not logged in! Please log in to get accesss.', 401)
    );
  }

  // 2) Verification token
  // console.log(token);
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // console.log(decoded);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+userJWTs'); // user từ payload
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exist.',
        401
      )
    );
  }
  // DTO
  if (!currentUser.userJWTs.includes(token)) {
    return next(new AppError('Token does not match', 401));
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles['admin', 'lead-guide']
    if (roles.includes(req.user.role)) {
      return next();
    }
    next(
      new AppError('You do not have permission to perform this action', 403) //403~ forbidden
    );
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    email: { required: true, type: 'string', isEmail: true },
  });

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // await user.save();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    password: { required: true, type: 'string', minlength: 8 },
    passwordConfirm: { required: true, type: 'string' },
  });

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user

  // 4) Log the users in, send JWT
  // const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    // token: token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    currentPassword: { required: true, type: 'string' },
    newPassword: { required: true, type: 'string', minlength: 8 },
    newPasswordConfirm: { required: true, type: 'string' },
  });

  // console.log(req.user);
  const user = await User.findById(req.user.id).select('+password');
  // console.log(req.user);
  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your password is incorrect!', 401));
  }
  // 3) If so, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  // console.log(user.password, user.passwordConfirm);
  await user.save();
  // 4) Log user in, send JWT

  // const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    // token,
  });
});

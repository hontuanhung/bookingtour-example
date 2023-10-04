const AppError = require('./appError');

const checkTypeof = (inputFields, field) => {
  const isError = [true];
  const fieldKeys = Object.keys(inputFields);
  if (fieldKeys.includes(field) && typeof inputFields.field !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  return isError;
};

exports.isPasswordMatched = (password, passwordConfirm) => {
  // const fieldKeys = Object.keys(inputFields);
  const isError = [true];

  // password
  if (typeof password !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // passwordConfirm
  if (password !== passwordConfirm) {
    isError[0] = false;
    isError.push(new AppError('Passwords does not match', 400));
    return isError;
  }
  return isError;
};

exports.validateSignup = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  const isError = [true];

  // name
  if (fieldKeys.includes('name') && typeof inputFields.name !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data', 400));
    return isError;
  }
  // email
  if (fieldKeys.includes('email') && typeof inputFields.email !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }

  // password
  if (fieldKeys.includes('password')) {
    const isMatch = this.isPasswordMatched(
      inputFields.password,
      inputFields.passwordConfirm
    );
    if (!isMatch[0]) {
      return isMatch;
    }
  }
  // photo
  if (fieldKeys.includes('photo') && typeof inputFields.photo !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // role
  if (fieldKeys.includes('role') && typeof inputFields.role !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  return isError;
};

exports.validateLogin = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  const isError = [true];

  //   email
  if (fieldKeys.includes('email') && typeof inputFields.email !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data', 400));
    return isError;
  }
  //   password
  if (
    fieldKeys.includes('password') &&
    typeof inputFields.password !== 'string'
  ) {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }

  return isError;
};

exports.validateForgotPassword = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  const isError = [true];

  // email
  if (fieldKeys.includes('email') && typeof inputFields.email !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data', 400));
    return isError;
  }

  return isError;
};

exports.validateUpdatePassword = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  const isError = [true];
  // currentPassword
  if (
    fieldKeys.includes('currentPassword') &&
    typeof inputFields.currentPassword !== 'string'
  ) {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // password
  if (fieldKeys.includes('password')) {
    const isMatch = this.isPasswordMatched(
      inputFields.newPassword,
      inputFields.newPasswordConfirm
    );
    if (!isMatch[0]) {
      return isMatch;
    }
  }
  return isError;
};

exports.validateUpdateMe = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  const isError = [true];
  // name
  if (fieldKeys.includes('name') && typeof inputFields.name !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // email
  if (fieldKeys.includes('email') && typeof inputFields.email !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // photo
  if (fieldKeys.includes('photo') && typeof inputFields.photo !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }

  return isError;
};

exports.validateUpdateMe = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  const isError = [true];
  // name
  if (fieldKeys.includes('name') && typeof inputFields.name !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // email
  if (fieldKeys.includes('email') && typeof inputFields.email !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // photo
  if (fieldKeys.includes('photo') && typeof inputFields.photo !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }

  return isError;
};

exports.validateUpdateUser = (inputFields) => {
  const fieldKeys = Object.keys(inputFields);
  let isError = [true];
  // name
  if (fieldKeys.includes('name') && typeof inputFields.name !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // email
  if (fieldKeys.includes('email') && typeof inputFields.email !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // photo
  if (fieldKeys.includes('photo') && typeof inputFields.photo !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  // role
  if (fieldKeys.includes('role') && typeof inputFields.role !== 'string') {
    isError[0] = false;
    isError.push(new AppError('Invalid input data ', 400));
    return isError;
  }
  return isError;
};

const Validators = require('./validatorFeatures');
const AppError = require('./appError');

let password;

const validateFieldRule = (value, fieldRules, field) => {
  if (fieldRules.required && !value) {
    throw new AppError(`Please provide ${field}.`, 400);
  }
  if (value !== 0 && !value) {
    return;
  }
  for (const rule of Object.keys(fieldRules)) {
    switch (rule) {
      case 'type':
        if (!Validators.isValidType(value, fieldRules.type)) {
          throw new AppError(`Invalid typeof ${field} value`, 400);
        }
        break;
      case 'maxlength':
        if (!Validators.isGreater(fieldRules.maxlength[0], value.length)) {
          throw new AppError(fieldRules.maxlength[1], 400);
        }
        break;
      case 'minlength':
        if (!Validators.isLessThan(fieldRules.minlength[0], value.length)) {
          throw new AppError(fieldRules.minlength[1], 400);
        }
        break;
      case 'max':
        if (!Validators.isGreater(fieldRules.max, value)) {
          throw new AppError(
            `Field "${field}" have value (${value}) is more than maximum allowed value (${fieldRules.max}).`,
            400
          );
        }
        break;
      case 'min':
        if (!Validators.isLessThan(fieldRules.min, value)) {
          throw new AppError(
            `Field "${field}" have value (${value}) is less than minimum allowed value (${fieldRules.min}).`,
            400
          );
        }
        break;
      case 'enum':
        if (!fieldRules.enum.includes(value)) {
          throw new AppError(
            `There is no "${value}" role! Please fill out one of 4 default roles`,
            400
          );
        }
        break;
      case 'isEmail':
        if (fieldRules.isEmail && !Validators.isValidEmail(value)) {
          throw new AppError(`Invalid email!`, 400);
        }
        break;
    }
  }
  if (field === 'passwordConfirm' && !Validators.isMatch(password, value)) {
    throw new AppError('Passwords do not match', 400);
  }
};
// {email: "admin@gmail.com", password:"test1234"}
// {email: {required: true, type: 'string'}, password: {required: true, type: 'string'}}
exports.validateData = (input, rules) => {
  if (input.password) {
    password = input.password;
  }
  for (const field in rules) {
    fieldRules = rules[field];
    fieldValue = input[field];

    validateFieldRule(fieldValue, fieldRules, field);
  }
};

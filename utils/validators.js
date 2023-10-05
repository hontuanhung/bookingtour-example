const Validators = require('./validator');
const AppError = require('../utils/appError');

const validateFieldRule = (input, rules) => {
  const validator = new Validators(input);
  for (const rule of Object.keys(rules)) {
    switch (rule) {
      case 'required':
        validator.isNotEmpty();
        break;
      case 'type':
        validator.checkIsType(rules.type);
        break;
    }
  }

  return validator.getComparison();
};
// {email: {required: true, type: 'string'}, password: {required: true, type: 'string'}}
exports.validateData = (input, rules) => {
  let isValid;
  for (const field in rules) {
    fieldRules = rules[field];
    fieldInput = input[field];
    isValid = validateFieldRule(fieldInput, fieldRules);
    if (!isValid) return new AppError('Invalid data input', 400);
  }
};

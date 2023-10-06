// const validator = require('validator');

class Validatetor {
  static isValidType(data, type) {
    return type && typeof data === type;
  }

  static isMatch(password, passwordConfirm) {
    return password === passwordConfirm ? true : false;
  }

  static isGreater(max, input) {
    return input <= max ? true : false;
  }

  static isLessThan(min, input) {
    return input >= min ? true : false;
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  // static isNotEmpty(data) {
  //   data = data || null;
  //   return typeof data !== 'undefined' && data !== null;
  // }
}

module.exports = Validatetor;

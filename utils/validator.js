class Validatetor {
  constructor(data) {
    this.data = data;
    this.comparison = [];
  }

  checkIsType(type) {
    this.comparison.push(type && typeof this.data === type);
    return this;
  }

  isNotEmpty() {
    const data = this.data || null;
    this.comparison.push(!(typeof data === 'undefined' || data === null));
    return this;
  }

  getComparison() {
    const arr = this.comparison;
    const isTrue = arr.every((val) => val == true);
    return isTrue;
  }
}

module.exports = Validatetor;

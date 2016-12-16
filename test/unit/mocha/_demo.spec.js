import chai from 'chai'

const should = chai.should()
var assert = require('chai').assert;
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      should.equal(0, [1,2,3].indexOf(1));
      should.equal(-1, [1,2,3].indexOf(5));
    });
  });
});

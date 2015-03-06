var frugal = require('../'),
assert = require('assert');

describe('Request All', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var f = frugal.requestPricing();
      f.on('end',done);
    })
  })
})

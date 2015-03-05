var frugal = require('../');

describe('Test1', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      var f = frugal.requestPricing();
      f.on('end',done);
    })
  })
})

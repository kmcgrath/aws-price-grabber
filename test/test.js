var frugal = require('../');

describe('Test1', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      var f = frugal.requestPricing();
      // f.on('pricesheet',function(a){console.log(a)});
      f.on('end',done);
    })
  })
})

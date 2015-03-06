var frugal = require('../');

describe('rds Request', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var f = frugal.requestPricing({services:['rds']});
      f.on('end',done);
    })
  })
});

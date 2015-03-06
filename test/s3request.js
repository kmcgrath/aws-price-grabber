var frugal = require('../');

describe('S3 Request', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var f = frugal.requestPricing({services:['s3']});
      f.on('end',done);
    })
  })
});

var awsPriceGrabber = require('../');

describe('rds Request', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var grabber = awsPriceGrabber.requestPricing({services:['rds']});
      grabber.on('end',done);
    })
  })
});

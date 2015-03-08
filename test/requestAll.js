var awsPriceGrabber = require('../'),
assert = require('assert');

describe('Request All', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var grabber = awsPriceGrabber.requestPricing();
      grabber.on('end',done);
    })
  })
})

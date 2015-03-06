var frugal = require('../');
var assert = require('assert');

describe('ec2 Request', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var f = frugal.requestPricing({services:['ec2']});
      f.on('pricemap:received',function(pricemap) {
        assert.equal(pricemap.serviceName, 'ec2');
      });
      f.on('end',done);
    })
  })
});

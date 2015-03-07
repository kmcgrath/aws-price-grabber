#!/usr/bin/env node

var awsPriceGrabber = require('../');

var count = 0;

var f = awsPriceGrabber.requestPricing();
f.on('pricemap:received',function(a){
  count = count + 1;
});
f.on('end',function() {
  console.log(count);
});

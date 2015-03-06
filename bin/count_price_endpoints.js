#!/usr/bin/env node

var frugal = require('../');

var count = 0;

var f = frugal.requestPricing();
f.on('pricemap:received',function(a){
  count = count + 1;
});
f.on('end',function() {
  console.log(count);
});

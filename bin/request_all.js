#!/usr/bin/env node

var frugal = require('../');

var all = {};

var f = frugal.requestPricing();
f.on('pricesheet',function(a){
  all[a.name] = a.sheet;
});
f.on('end',function() {
  console.log(JSON.stringify(all,null,2));
});

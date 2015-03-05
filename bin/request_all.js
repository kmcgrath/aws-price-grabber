#!/usr/bin/env node

var frugal = require('../');

var all = [];

var f = frugal.requestPricing();
f.on('pricemap:received',function(a){
  all.push(a);
});
f.on('end',function() {
  console.log(JSON.stringify(all,null,2));
});

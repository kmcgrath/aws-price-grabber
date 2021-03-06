# aws-price-grabber

[![NPM](https://nodei.co/npm/aws-price-grabber.png)](https://nodei.co/npm/aws-price-grabber/)

[![Build Status](https://travis-ci.org/kmcgrath/aws-price-grabber.svg?branch=develop)](https://travis-ci.org/kmcgrath/aws-price-grabber)
[![Code Climate](https://codeclimate.com/github/kmcgrath/aws-price-grabber/badges/gpa.svg)](https://codeclimate.com/github/kmcgrath/aws-price-grabber)
[![Coverage Status](https://coveralls.io/repos/kmcgrath/aws-price-grabber/badge.svg?branch=develop)](https://coveralls.io/r/kmcgrath/aws-price-grabber?branch=develop)
[![Dependency Status](https://david-dm.org/kmcgrath/aws-price-grabber.svg?branch=develop)](https://david-dm.org/kmcgrath/aws-price-grabber?branch=develop)

Capture AWS pricing as JSON

Based on a Stack Overflow [answer](http://stackoverflow.com/a/7334197)

## Description
AWS does not have an API for pricing.  Most of the pricing pages however
load their data via jsonp.  Those jsonp endpoints can and do change.
This project will scan a pricing page for the jsonp endpoints it relies
on then process those endpoints into JSON.

For each endpoint (pricemap) *aws-price-grabber* will emit an event
allowing the consuerm to parse or store the raw data as they see fit.

Since AWS does not support pulling prices this way, *aws-price_grabber*
will not attempt to manipulate, normalize, or change data in any way.
That will be the job of the consming application/module.  This will
hopefully keep any breaking changes made by AWS to a minimum.


## Services that work
* ec2
* elasticloadbalancing
* s3
* glacier
* ebs
* storagegateway
* rds
* elasticache
* dynamodb
* redshift
* sqs
* sns
* swf
* cloudsearch
* elastictranscoder
* elasticmapreduce
* kinesis

## Services that DO NOT work

The following services embed pricing as HTML and do not use jsonp.

* ses
* directconnect
* vpc
* lambda
* cloudfront
* route53
* appstream


## Use

    var awsPriceGrabber = require('awsPriceGrabber-ec2');

    // grab all services
    var grabber = awsPriceGrabber.requestPricing;
    grabber.on('pricemap:received',doSomething);
    grabber.on('end',finishSomething);

    // grab specific services
    var grabber2 = awsPriceGrabber.requestPricing({services:['ec2']});;
    ...


## Scripts

### request\_all.js
Script that dumps all pricing in JSON to STDOUT

    > ./scripts/request_all.js

### count\_price\_endpoints.js
Counts the total number of jsonp endpoints that can be collected

    > ./scripts/count_price_endpoints.js



## Other useful ec2 pricing projects

* https://github.com/erans/ec2instancespricing
* https://github.com/CloudHealth/amazon-pricing

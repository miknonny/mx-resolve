#!/usr/bin/env node
'use strict'

const dns = require('dns-then')
const readline = require('linebyline')
const process = require('process')
const colors = require('colors')
const fs = require('fs')
const RateLimiter = require('limiter').RateLimiter
const limiter = new RateLimiter(1, 250)

if (process.argv.length < 3 ) {
  console.log('Usage: mx-resolve <searchTerm> <sourceFile> <destFile>')
  process.exit(1)
}

const domain = process.argv[2]
const rl = readline(process.argv[3])
const destFile = process.argv[4]



rl.on('line', (line, linecount) => {
  limiter.removeTokens(1, () => {
    dns.resolveMx(line.split('@')[1])
    .then(address => {
      // console.log(address[1].exchange)
      // console.log(line, address[1].exchange.includes(domain))
      if (address[1].exchange.includes(domain)) {
        console.log(line.green, address[1].exchange.green)
        fs.appendFile(destFile, line + '\n', function (err) {
          if (err) throw err;
        })
      } else {
        console.log(line.red, address[1].exchange)
      }
    })
  })
})
.on('error', e => {
  console.log(e)
})

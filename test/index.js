/* eslint-env mocha */
'use strict'

var should = require('should')

var sqsClient = require('./sqs-client-mock')
var SQSPush = require('../index')

describe('sqs-push', function () {
  var sqs

  before(function () {
    sqs = SQSPush(sqsClient)
  })

  describe('#_getQueueURL', function () {
    it('should return the url of the queue', function (done) {
      sqs._getQueueURL('QUEUE_NAME', function (err, queueURL) {
        should.not.exist(err)
        should.exist(queueURL)

        queueURL.should.be.a.String
        queueURL.should.be.exactly('QUEUE_URL')

        done(err)
      })
    })
  })

  describe('#_pushMessage', function () {
    it('should push a string message body', function (done) {
      sqs._pushMessage('QUEUE_URL', 'messageBody', function (err) {
        should.not.exist(err)

        done(err)
      })
    })

    it('should push an object message body', function (done) {
      var messageBody = {foo: 'bar'}
      sqs._pushMessage('QUEUE_URL', messageBody, function (err) {
        should.not.exist(err)

        done(err)
      })
    })
  })

  describe('#push', function () {
    it('should push a string message body', function (done) {
      sqs.push('QUEUE_NAME', 'messageBody', function (err) {
        should.not.exist(err)

        done(err)
      })
    })

    it('should push an object message body', function (done) {
      var messageBody = {foo: 'bar'}
      sqs.push('QUEUE_NAME', messageBody, function (err) {
        should.not.exist(err)

        done(err)
      })
    })
  })
})

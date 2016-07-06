'use strict'

var async = require('async')
var debug = require('debug')('sqs-push')
var LRU = require('lru')

var SQS = function (sqsClient, options) {
  if (!(this instanceof SQS)) {
    return new SQS(sqsClient, options)
  }

  this._sqsClient = sqsClient

  options = options || {}
  this._cacheSize = options.cacheSize || 10
  this._cacheMaxAge = options.cacheMaxAge || 1 * 60 * 1000 // 1 min.

  this._queueURLCache = new LRU({
    max: this._cacheSize,
    maxAge: this._cacheMaxAge
  })
}

SQS.prototype._getQueueURL = function (queueName, cb) {
  var self = this
  debug('getting queue url (queue_name="%s")', queueName)

  // First try to find queue url in cache.
  var queueURLCached = this._queueURLCache.get(queueName)
  if (typeof queueURLCached !== 'undefined') { // Cache hit.
    debug('found queue url in local cache (queue_name="%s", queue_url="%s")', queueName, queueURLCached)
    process.nextTick(function () {
      cb(null, queueURLCached)
    })
    return
  }

  // Cache miss.
  var params = {
    'QueueName': queueName
  }

  self._sqsClient.getQueueUrl(params, function (err, data) {
    if (err) {
      debug('failed to get queue url (queue_name="%s")', queueName)
      cb(err)
      return
    }

    var queueURL = data.QueueUrl
    debug('found queue url (queue_name="%s", queue_url="%s")', queueName, queueURL)
    self._queueURLCache.set(queueName, queueURL) // Store in local cache.
    cb(null, queueURL)
  })
}

SQS.prototype._pushMessage = function (queueURL, messageBody, cb) {
  debug('pushing message (queue_url="%s")', queueURL)

  if (typeof messageBody !== 'string') {
    debug('message body is not a string, trying to stringify it')
    messageBody = JSON.stringify(messageBody)
  }

  var params = {
    'messageBody': messageBody,
    'QueueUrl': queueURL,
    'DelaySeconds': 0
  }

  this._sqsClient.sendMessage(params, function (err) {
    if (err) {
      debug('failed to push message (queue_url="%s")', queueURL)
      cb(err)
      return
    }

    debug('pushed message (queue_url="%s")', queueURL)
    cb()
  })
}

SQS.prototype.push = function (queueName, messageBody, cb) {
  var self = this
  debug('pushing message (queue_name="%s")', queueName)

  // 1. Retrieve queue url.
  // 2. Push message to queue.
  var fnsWaterfall = [
    function retrieveQueueURL (_cb) {
      async.retry({
        times: 3,
        interval: 200
      },
      self._getQueueURL.bind(self, queueName),
      _cb)
    },
    function pushMessage (queueURL, _cb) {
      async.retry({
        times: 3,
        interval: 200
      },
      function (_cb) {
        self._pushMessage(queueURL, messageBody, function (err) {
          if (err) {
            self._queueURLCache.remove(queueName) // Remove url from cache
          }

          _cb(err)
        })
      },
      _cb)
    }
  ]

  async.waterfall(fnsWaterfall, cb)
}

module.exports = SQS

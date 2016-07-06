'use strict'

var sqsClientMock = {
  getQueueUrl: function (params, cb) {
    process.nextTick(function () {
      cb(null, {
        'QueueUrl': 'QUEUE_URL'
      })
    })
  },
  sendMessage: function (params, cb) {
    process.nextTick(cb.bind(null))
  }
}

module.exports = sqsClientMock

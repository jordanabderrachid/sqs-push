'use strict'

var sqsClientMock = {
  getQueueUrl: function (params, cb) {
    if (!params.hasOwnProperty('QueueName')) {
      process.nextTick(cb.bind(null, new Error('missing QueueName parameter')))
      return
    }

    process.nextTick(function () {
      cb(null, {
        'QueueUrl': 'QUEUE_URL'
      })
    })
  },
  sendMessage: function (params, cb) {
    if (!params.hasOwnProperty('QueueUrl')) {
      process.nextTick(cb.bind(null, new Error('missing QueueUrl parameter')))
      return
    }

    if (!params.hasOwnProperty('MessageBody')) {
      process.nextTick(cb.bind(null, new Error('missing MessageBody parameter')))
      return
    }

    process.nextTick(cb.bind(null))
  }
}

module.exports = sqsClientMock

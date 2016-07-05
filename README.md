### Usage

```js
var sqs = require('sqs-push')(sqsClient);

var queueName = 'queue';
sqs.push(queueName, message, function afterPush(err, messageID) {
  // ...
});
```

##### This library is still WIP

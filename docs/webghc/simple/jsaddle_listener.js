var jsaddleChannelPort;
var jsaddle_input_msg_queue = [];
var jsaddleMsgBufArray;
var jsaddleMsgBufArray32;
var dec = new TextDecoder();


function handleMessageFromJSaddle (msg) {
  // var m = dec.decode(msg.data.buf);
  // console.log('jsaddle_listener m:', m);

  var bb = new Uint8Array (msg.data.buf);

  // Add directly to shared buffer if it is empty, else push to queue
  var isMsgBufEmpty = jsaddleMsgBufArray32[0] === 0;
  if (isMsgBufEmpty) {
    // console.log('Adding message to array');
    var len = bb.byteLength;
    var i = len;
    while (i--) jsaddleMsgBufArray[i + 4] = bb[i];
    jsaddleMsgBufArray32[0] = len;

    // var check = new Uint8Array(len);
    // i = len;
    // while (i--) check[i] = jsaddleMsgBufArray[i + 4];
    // // console.log(bb);
    // // while (i--) check[i] = bb[i];
    // var checkstr = dec.decode(check);

    // console.log('Copied ', checkstr, check);
  } else {
    // console.log('pushing message on queue');
    jsaddle_input_msg_queue.push(bb);
  }
}

onmessage = function(msg) {
  switch (msg.data.type) {
  case 'init':
    jsaddleChannelPort = msg.data.jsaddleChannelPort;
    jsaddleChannelPort.onmessage = handleMessageFromJSaddle;
    jsaddleMsgBufArray32 = msg.data.jsaddleMsgBufArray32;
    jsaddleMsgBufArray = msg.data.jsaddleMsgBufArray;
    break;

  case 'write':
    jsaddleChannelPort.postMessage(
      {type: 'a', buf: msg.data.buf}
      , [msg.data.buf]);
    break;

  case 'read':
    // console.log('Current queue length:', jsaddle_input_msg_queue.length);
    if (jsaddle_input_msg_queue.length > 0) {
      var b = jsaddle_input_msg_queue.shift();
      var len = b.byteLength;
      var i = len;
      while (i--) jsaddleMsgBufArray[i + 4] = b[i];
      jsaddleMsgBufArray32[0] = len;
      // console.log('Added shared buf msg :', len);
    }
    break;

  default:
    throw 'Invalid msg type for jsaddle_listener';
  }
}

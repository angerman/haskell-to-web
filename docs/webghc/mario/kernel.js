function kernel(progName, options) {
  const worker = new Worker("./wasm.js");

  // The JS side of JSaddle
  // The channel is used for bidirectional communication via jsaddleListener worker
  var channelPort2 = jsaddleInit();

  worker.postMessage(
    { progName: progName, options: options, jsaddleChannelPort: channelPort2 }
    , [channelPort2]);
}

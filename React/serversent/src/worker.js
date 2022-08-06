onmessage = async function (bound) {
  // Create WebSocket connection.
  const socket = new WebSocket("ws://localhost:8000/websocket");
  let k = 0;
  var intervalID;
  // Connection opened
  socket.addEventListener("open", function (event) {
    intervalID = setInterval(() => {
      socket.send(JSON.stringify(bound.data));
    }, Number(bound.data.interval));
  });
  socket.onmessage = function (event) {
    if (k === Number(bound.data.valueCount)) {
      clearInterval(intervalID);
      socket.close();
      postMessage("Socket closed after 10 generated values");
      return;
    }
    postMessage(event.data);
    k++;
  };
};

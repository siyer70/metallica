var socket = io('http://localhost:3050');

socket.on('connect', function() {
  console.log("Connected to the server");
});

socket.on('trade event', function(data) {
  displayTradeDataMessage(`Trade event arrived -> Body: ${data}`);
});

socket.on('market data event', function(data) {
  displayMarketDataMessage(`Market data event arrived -> Body: ${data}`);
});

socket.on('disconnect', function() {
  console.log('Disconnected from the server');
});

function displayTradeDataMessage(message) {
  var divItem = document.getElementById('tradeChanges');
  console.log(message);
  if(divItem!==undefined) {
    divItem.innerHTML = message;
  }
}

function displayMarketDataMessage(message) {
  var divItem = document.getElementById('marketDataChanges');
  console.log(message);
  if(divItem!==undefined) {
    divItem.innerHTML = message;
  }
}

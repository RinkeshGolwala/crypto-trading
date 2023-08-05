"use strict";

const { PeerRPCClient } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const { v4: uuid } = require("uuid");

const link = new Link({
  grape: "http://127.0.0.1:30001",
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

// Function to add an order to the orderbook
const placeOrder = (order) => {
  peer.request("trade", order, { timeout: 10000 }, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    console.log(data);
  });
};

// Function to remove an order from the orderbook
const removeOrder = (order) => {
  clientOrderBook[order.clientId][order.orderId].isActive = false;
};

placeOrder({
  orderId: uuid(),
  clientId: 1,
  type: "buy",
  price: 10,
  tokenName: "dogecoin",
  quantity: 100,
});

placeOrder({
  orderId: uuid(),
  clientId: 2,
  type: "sell",
  price: 10,
  tokenName: "dogecoin",
  quantity: 50,
});

// placeOrder({
//   orderId: uuid(),
//   clientId: 1,
//   type: "buy",
//   price: 25,
//   tokenName: "shibainu",
//   quantity: 37,
// });

// placeOrder({
//   orderId: uuid(),
//   clientId: 2,
//   type: "sell",
//   price: 20,
//   tokenName: "shibainu",
//   quantity: 50,
// });

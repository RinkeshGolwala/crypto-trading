"use strict";

const { PeerRPCServer } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const { matchOrders } = require("./trade.service");

const link = new Link({
  grape: "http://127.0.0.1:30001",
});
link.start();

const peer = new PeerRPCServer(link, {
  timeout: 300000,
});
peer.init();

const port = 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport("server");
service.listen(port);

setInterval(function () {
  link.announce("trade", service.port, {});
}, 1000);

service.on("request", (rid, key, order, handler) => {
  if (key === "trade" && order.type) {
    const { type } = order;
    switch (type) {
      case "buy":
        console.log(`New buy order: ${JSON.stringify(order)}`);
        matchOrders(order, handler);
        break;

      case "sell":
        console.log(`New sell order: ${JSON.stringify(order)}`);
        matchOrders(order, handler);
        break;

      default:
        break;
    }
  }
});

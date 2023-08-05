const { v4: uuid } = require("uuid");

// global order book instace to store client instances of orderbooks
const clientOrderBook = {};

// tradebook to mimic blockchain ledger
const tradebook = {};

// creating a local orderbook instance in server for easier data structure
const orderbook = {};

// Function to match orders in the orderbook
const matchOrders = (order, handler) => {
  // push order to corresponding client order book instance
  if (!clientOrderBook[order.clientId]) {
    clientOrderBook[order.clientId] = {};
  }
  clientOrderBook[order.clientId][order.orderId] = { ...order, isActive: true };

  // push order to the trading order book
  orderbook[order.orderId] = { ...order, isActive: true };
  const buyOrders = Object.values(orderbook).filter(
    (order) => order.type === "buy" && order.isActive === true
  );
  const sellOrders = Object.values(orderbook).filter(
    (order) => order.type === "sell" && order.isActive === true
  );

  for (let buyOrder of buyOrders) {
    for (let sellOrder of sellOrders) {
      if (
        buyOrder.price >= sellOrder.price &&
        buyOrder.quantity > 0 &&
        sellOrder.quantity > 0 &&
        buyOrder.clientId !== sellOrder.clientId &&
        buyOrder.tokenName === sellOrder.tokenName
      ) {
        const tradeQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
        const tradePrice = sellOrder.price;
        const tradeId = uuid();

        // Execute the trade
        console.log(
          `Trade executed: ${tradeQuantity} ${buyOrder.tokenName} at $${tradePrice}`
        );
        buyOrder.quantity -= tradeQuantity;
        sellOrder.quantity -= tradeQuantity;

        // update the blockchain with the transaction
        tradebook[tradeId] = {
          tradeId,
          tradePrice,
          tradeQuantity,
          tokenName: buyOrder.tokenName,
          time: new Date().toJSON(),
        };
        // Add remainder to the orderbook & client instance orderbook
        if (buyOrder.quantity === 0) {
          orderbook[buyOrder.orderId].isActive = false;
          clientOrderBook[buyOrder.clientId][buyOrder.orderId].isActive = false;
        } else {
          const newBuyOrder = {
            ...buyOrder,
            isActive: true,
            orderId: uuid(),
          };
          orderbook[buyOrder.orderId].isActive = false;
          orderbook[newBuyOrder.orderId] = newBuyOrder;
          clientOrderBook[buyOrder.clientId][buyOrder.orderId].isActive = false;
          clientOrderBook[buyOrder.clientId][newBuyOrder.orderId] = newBuyOrder;
        }
        if (sellOrder.quantity === 0) {
          orderbook[sellOrder.orderId].isActive = false;
          clientOrderBook[sellOrder.clientId][
            sellOrder.orderId
          ].isActive = false;
        } else {
          const newSellOrder = {
            ...sellOrder,
            isActive: true,
            orderId: uuid(),
          };
          orderbook[sellOrder.orderId].isActive = false;
          orderbook[newSellOrder.orderId] = newSellOrder;
          clientOrderBook[sellOrder.clientId][
            sellOrder.orderId
          ].isActive = false;
          clientOrderBook[sellOrder.clientId][newSellOrder.orderId] =
            newSellOrder;
        }
        console.log("===>>>> trade book : ", tradebook);
        console.log("===>>>> order book : ", orderbook);
        console.log("===>>> client instance order book: ", clientOrderBook);
      }
    }
  }

  handler.reply(null, { msg: "order placed successfully", order });
};

module.exports = { matchOrders };

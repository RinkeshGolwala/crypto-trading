The task is to create a simplified distributed exchange

- Each client will have its own instance of the orderbook.
- Clients submit orders to their own instance of orderbook. The order is distributed to other instances, too.
- If a client's order matches with another order, any remainer is added to the orderbook, too.

Requirement:

- Code in Javascript
- Use Grenache for communication between nodes
- Simple order matching engine
- You don't need to create a UI or HTTP API

### Setting up the DHT

```
npm i -g grenache-grape
```

```
# boot two grape servers

grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

### Project setup

```
npm install
cd src
npm run server // run in a separate terminal
npm run client // run in a separate terminal
```

Once you execute `client.js`, you'll be able to see the client specific order books.

---

### Project Structure

- `server.js` file contains RPC server specific code.
- `trade.service.js` file contains the trading logic. Apart from the trade logic, I've kept the orderbook instances in the same file to narrow down the complexity.
- `client.js` file contains function to place trade orders.

### Logic Explanation

- You can place an order using `placeOrder` function inside `src/client.js` file.
- Once you place an order, the order is registered in the `clientOrderBook`, as well as in the `Orderbook`.
- `clientOrderBook` is created to mimic the client's instance of the orderbooks. Clients can access their version of orderbook like `clientOrderBook[clientId]`.
- `orderbook` constant is used to reduce loops of calculation logic. However, we can use the same `clientOrderBook` to achieve the functionality.
- Each time a new order is placed, `matchOrders` function is executed. This function checks all the active orders to find if the same token is present in the order book, and the buying price is same or higher than the selling price. If all conditions are satisfied, then we execute trade and create a new transaction in the `tradebook`. (`tradebook` object is used to mimic the actual blockchain.)
- After a successful trade, if any quantity is left then we place another order with the remaining quantity.

- For example, client 1 places an order to buy 100 dogecoins.

```
New buy order: {"orderId":"21eae0e9-fbbd-4020-93fd-9abbd7d46e28","clientId":1,"type":"buy","price":10,"tokenName":"dogecoin","quantity":100}
```

- The orderbook will look like

```
order book:  {
  '1': {
    '21eae0e9-fbbd-4020-93fd-9abbd7d46e28': {
      orderId: '21eae0e9-fbbd-4020-93fd-9abbd7d46e28',
      clientId: 1,
      type: 'buy',
      price: 10,
      tokenName: 'dogecoin',
      quantity: 100,
      isActive: true
    }
  }
}
```

- Then client 2 places a sell order of 50 dogecoins for $10 each. The quantity is matching for both of them and the price are also tradable, hence a transaction will be placed and the updated orderbooks will look like this.

```
===>>> order book:  {
  '1': {
    '21eae0e9-fbbd-4020-93fd-9abbd7d46e28': {
      orderId: '21eae0e9-fbbd-4020-93fd-9abbd7d46e28',
      clientId: 1,
      type: 'buy',
      price: 10,
      tokenName: 'dogecoin',
      quantity: 100,
      isActive: false
    },
    'd4fcdc0b-3ca0-4786-9ecb-95449275f552': {
      orderId: 'd4fcdc0b-3ca0-4786-9ecb-95449275f552',
      clientId: 1,
      type: 'buy',
      price: 10,
      tokenName: 'dogecoin',
      quantity: 50,
      isActive: true
    }
  },
  '2': {
    '1d33fc43-10c3-4b24-a5fc-9d241ab5dbd0': {
      orderId: '1d33fc43-10c3-4b24-a5fc-9d241ab5dbd0',
      clientId: 2,
      type: 'sell',
      price: 10,
      tokenName: 'dogecoin',
      quantity: 50,
      isActive: false
    }
  }
}
```

- orders with id `'21eae0e9-fbbd-4020-93fd-9abbd7d46e28'` & `'1d33fc43-10c3-4b24-a5fc-9d241ab5dbd0'` are closed to create a transaction, and a new order is placed for client 1 to buy remaining 50 dogecoins with id `'d4fcdc0b-3ca0-4786-9ecb-95449275f552'`.

- After the transaction, the `tradebook` will look like this.

```
===>>>> trade book :  {
  'cff9d54d-401f-49d6-9351-85c8febc13e5': {
    tradeId: 'cff9d54d-401f-49d6-9351-85c8febc13e5',
    tradePrice: 10,
    tradeQuantity: 50,
    tokenName: 'dogecoin',
    time: '2023-08-05T12:09:28.607Z'
  }
}
```

import DataProvider from '../classes/DataProvider.js';
import Poloniex from 'poloniex-api-node';
import Order from '../classes/Order.js';
let poloniex = new Poloniex();

class PoloniexProvider extends DataProvider{
    constructor(){
        super('Poloniex');
    }

    connect(){
        return poloniex.returnTicker()
            .then(function(ticker){
                return true;
            }).catch((err) => {
                console.log(err);
                return false;
            });
    }

    getSingleOrder()
    {
        return poloniex.returnOrderBook(this.getActiveCurrency(), null).then((response)=>{
            if (response.asks.length > 0)
                return this._createRecord(response.asks[0], 'ask');
            if (response.bids.length > 0)
                return this._createRecord(response.asks[0], 'bid');

            return false;
        }).catch((err) => {
            console.log(err);
            return false;
        });
    }

    getOpenOrders()
    {
        return poloniex.returnOrderBook(this.getActiveCurrency(), null).then((response) => {
            let orders = response.asks.map((row) => {
                return this._createRecord(row, 'ask');
            });
            return orders.concat(response.bids.map((row) => {
                return this._createRecord(row, 'bid');
            }));
        }).catch(function(err){
            console.log(err);
            return false;
        });
    }

    _createRecord(data, type)
    {
        return new Order(Number(data[0]), Number(data[1]), type, this.name, this.getActiveCurrency());
    }

}

module.exports = PoloniexProvider;
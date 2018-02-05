import DataProvider from '../classes/DataProvider.js';
import Order from '../classes/Order.js';
import request from 'request-promise';
import os from 'os';

class BittrexProvider extends DataProvider{
    constructor(){
        super('Bittrex');
        this.baseURL = 'https://bittrex.com/api/v1.1/public/getorderbook?market=%s&type=both';
        this.currencyMap = {
            0: 'BTC-ETH',
            1: 'BTC-LTC',
            2: 'ETH-LTC'
        };
    }

    connect(){
        let fullPath = 'http://' + os.hostname()+ '/proxy/' + btoa(this.baseURL.replace('%s', this.getActiveCurrency()));
        return request(fullPath).then(function(response){
            return true;
        }).catch(function(err){
            console.log(err);
            return false;
        });
    }

    getSingleOrder()
    {
        let fullPath = 'http://' + os.hostname()+ '/proxy/' + btoa(this.baseURL.replace('%s', this.getActiveCurrency()));
        return request({
            'uri': fullPath,
            'json': true,
        }).then(function(response){
            if (response.result)
            {
                let rawOrder = {};
                let orderType = '';
                if (response.result.buy.length > 0)
                {
                    rawOrder = response.result.buy[0];
                    orderType = 'bid';
                }
                else if (response.result.sell.length > 0)
                {
                    rawOrder = response.result.sell[0];
                    orderType = 'ask';
                }
                else
                    return false;

                return new Order(Number(rawOrder.Rate), Number(rawOrder.Quantity), orderType, this.name, this.getActiveCurrency());
            }
        }).catch(function(err){
            console.log(err);
            return false;
        });
    }

    getOpenOrders()
    {
        var provider = this;
        let fullPath = 'http://' + os.hostname()+ '/proxy/' + btoa(this.baseURL.replace('%s', this.getActiveCurrency()));
        return request({
            'uri': fullPath,
            'json': true,
            }).then(function(response){
                if (response.result)
                {
                    let orders = response.result.buy.map((rawOrder) => {
                        return provider._createRecord(rawOrder, 'bid');
                    });
                    return orders.concat(response.result.sell.map((rawOrder) => {
                        return provider._createRecord(rawOrder, 'ask');
                    }));
                }
                else
                    return false;
        }).catch(function(err){
            console.log(err);
            return false;
        });
    }

    _createRecord(data, type)
    {
        return new Order(Number(data.Rate), Number(data.Quantity), type, this.name, this.getActiveCurrency());
    }
}

module.exports = BittrexProvider;
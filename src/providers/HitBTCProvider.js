import DataProvider from '../classes/DataProvider.js';
import Order from '../classes/Order';
import request from 'request-promise';
import os from 'os';

class HitBTCProvider extends DataProvider{
    constructor()
    {
        super('HitBTC');
        this.baseURL = 'https://api.hitbtc.com/api/2/public';
        this.currencyMap = {
            0: 'ETHBTC',
            1: 'LTCBTC',
            2: 'LTCETH'
        };
    }

    connect(){
        let fullPath = 'https://' + os.hostname()+ '/proxy/' + btoa(this.baseURL + '/ticker');
        request(fullPath).then(function(response){
            return true;
        }).catch(function(err){
            console.log(err);
            return false;
        });
    }

    getOpenOrders()
    {
        var provider = this;
        let fullPath = 'https://' + os.hostname()+ '/proxy/' + btoa(this.baseURL + '/orderbook/' + this.getActiveCurrency());
        return request({
            'uri': fullPath,
            'json': true,
        }).then(function(response){
            if (response)
            {
                let orders = response.ask.map((rawOrder) => {
                    return provider._createRecord(rawOrder, 'ask');
                });
                return orders.concat(response.bid.map((rawOrder) => {
                    return provider._createRecord(rawOrder, 'bid');
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
        return new Order(Number(data.price), Number(data.size), type, this.name, this.getActiveCurrency());
    }
}

module.exports = HitBTCProvider;
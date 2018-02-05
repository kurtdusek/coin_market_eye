'use strict';

import DataProvider from './DataProvider.js';
import Order from './Order.js';
import PoloniexProvider from '../providers/PoloniexProvider.js'
import BittrexProvider from '../providers/BittrexProvider.js'

describe('Poloniext Data Provider Test Suite', function(){
    let poloProvider = new BittrexProvider();
    it ('should be able to connect to the server', function(){
        return poloProvider.connect().then(function(result){
            expect(result).toBe(true);
        });
    });

    it('should return valid order objects', function(){
        return poloProvider.getSingleOrder().then(function(order){
            expect(Object.getPrototypeOf(order)).toBe(Order.prototype);
            expect(typeof order.price).toBe('number');
            expect(typeof order.volume).toBe('number');
            expect(typeof order.type).toBe('string');
            expect(typeof order.exchange).toBe('string');
            expect(order.exchange).toBe(poloProvider.name);
        });
    });

    it ('should return an array with a length greater than 0', function(){
        return poloProvider.getOpenOrders().then((orders) => {
            expect(Array.isArray(orders)).toBe(true);
            expect(orders.length).toBeGreaterThan(0);
        });
    });
});
'use strict';

import DataStore from './DataStore.js';
import PoloniexProvider from '../providers/PoloniexProvider.js'
import BittrexProvider from '../providers/BittrexProvider.js'
import MarketPrice from './MarketPrice';
import MockProvider from '../providers/MockProvider';
import Order from './Order';

import Promise from 'bluebird';

describe('DataStore Test Suite', function(){
    let storage = new DataStore([new PoloniexProvider(), new BittrexProvider()]);

    it("Should return data", () => {
        return storage.refreshData().then(() => {
            let marketPrices = storage.getMarketPrices();
            expect(marketPrices.length).toBeGreaterThan(0);
        });
    });

    it ('Should Return the names of its providers', function(){
        expect(storage.getProviderNames()).toContain('Poloniex');
        expect(storage.getProviderNames()).toContain('Bittrex');
    });

    it ('Should have an active currency', function(){
        expect(storage.getActiveCurrency()).not.toBeUndefined(undefined);
    });

    it('Should be able to change it\'s active currency and the currency of it\'s providers', function(){
        storage.setActiveCurrency(1);
        expect(storage.getActiveCurrency()).toBe('BTC_LTC');
        expect(storage.getProviders()[0].getActiveCurrency()).toBe('BTC_LTC');
        expect(storage.getProviders()[1].getActiveCurrency()).toBe('BTC-LTC');
    });

    it('Should have a database', function(){
        expect(storage.getData()).not.toBeUndefined();
    });

    it('Should be able to be cleared and refreshed', function(){
        storage.clear();
        return storage.refreshData().then((refreshedData)=>{
            expect(refreshedData).not.toBe(false);
            expect(storage.countRows()).toBeGreaterThan(0);
        });
    });


    it('Should find overlapping orders', function(){
        storage.clear();
        let marketPrice = new MarketPrice(100, 0);
        let sampleOrder = new Order(100, 4, "bid", "Poloniex", "BTC_ETH");
        let sampleOrder2 = new Order(100, 4, "ask", "Bittrex", "BTC_ETH");
        let sampleOrder3 = new Order(100, 4, "bid", "Kraken", "BTC_ETH");
        marketPrice.addOrder(sampleOrder);
        marketPrice.addOrder(sampleOrder2);
        marketPrice.addOrder(sampleOrder3);
    });

    it('Should return data for a given exchange', function(){
        return storage.refreshData().then(() => {
            let sampleRows = storage.orders.find({'exchange': 'Poloniex'});
            let poloniexRows = storage.getDataByExchange('Poloniex');
            expect(poloniexRows[0]).toMatchObject(sampleRows[0]);
            expect(poloniexRows.length).toEqual(sampleRows.length);

            let bittrexSampleRows = storage.orders.find({'exchange': 'Bittrex'});
            let bittrexRows = storage.getDataByExchange('Bittrex');
            expect(bittrexRows[0]).toMatchObject(bittrexSampleRows[0]);
            expect(bittrexRows.length).toEqual(bittrexSampleRows.length);
        });
    });
});

describe('Market Price Test Suite', function(){

    xit('Should find matches', function(){
        let mockProvider = new MockProvider();
        mockProvider.addMockOrder({price:100, volume: 5}, 'bid');
        mockProvider.addMockOrder({price:101, volume:2}, 'bid');
        mockProvider.addMockOrder({price:102, volume:2}, 'ask');
        mockProvider.addMockOrder({price:103, volume:2}, 'ask');
        let mockProvider2 = new MockProvider(1);
        mockProvider2.addMockOrder({price:100, volume:3}, 'ask');
        mockProvider2.addMockOrder({price:101, volume:9}, 'bid');
        mockProvider2.addMockOrder({price:103, volume:4}, 'ask');
        let storage = new DataStore([mockProvider, mockProvider2]);
        return storage.refreshData().then(() =>{
            let marketPrices = storage.getMarketPrices();

            let matchingmockMarketPrice = marketPrices[0];
            expect(matchingmockMarketPrice.orders.MOCK_0.bid.isMatch).toBe(true);
            expect(matchingmockMarketPrice.orders.MOCK_1.ask.isMatch).toBe(true);
            expect(matchingmockMarketPrice.overlap).toBe(true);

            let nonMatchingmockMarketPrice = marketPrices[1];
            expect(nonMatchingmockMarketPrice.orders.MOCK_1.bid.isMatch).toBe(false);

            let nonMatchingmockMarketPrice2 = marketPrices[2];
            expect(nonMatchingmockMarketPrice2.orders.MOCK_0.ask.isMatch).toBe(false);
        });
    });

   let marketPrice = new MarketPrice(100, 0);
    it ('Should update the total volume', function(){
        let sampleOrder = new Order(100, 4, "bid", "Poloniex", "BTC_ETH");
        let sampleOrder2 = new Order(100, 4, "bid", "Bittrex", "BTC_ETH");
        let sampleOrder3 = new Order(100, 4, "bid", "Kraken", "BTC_ETH");
        marketPrice.addOrder(sampleOrder);
        marketPrice.addOrder(sampleOrder2);
        marketPrice.addOrder(sampleOrder3);
        expect(marketPrice.volume).toBe(12);
    });

    it('Should now allow orders at a different price', function(){
        let sampleOrder = new Order(101, 4, "bid", "Poloniex", "BTC_ETH");
        expect(marketPrice.addOrder(sampleOrder)).toBe(false);
        expect(marketPrice.volume).toBe(12);
    });

   it ('Reset should clear the orders and volume, but not the price', function(){
       marketPrice.reset();
       expect(marketPrice.orders.length).toBe(0);
       expect(marketPrice.volume).toBe(0);
       expect(marketPrice.price).toBe(100);
   });
});
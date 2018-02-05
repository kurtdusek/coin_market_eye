import LokiJs from 'lokijs';
import Promise from 'bluebird';
import MarketPrice from "./MarketPrice";

/**
 * Wraps the various data providers into a unified data store of order objects and uses the getMarketPrices() function
 * to return an array of MarketPrice objects which specifies the price, volume and contains individual orders from the
 * each data provider which supports the active symbol (defined as activeCurrency)
 * Assumes the data store will only carry orders and prices of one given symbol (BTC_ETH) at a time.
 */
class DataStore{
    constructor (providers)
    {
        this.currencyMap = {
            0: 'BTC_ETH',
            1: 'BTC_LTC',
            2: 'ETH_LTC'
        };
        this.activeCurrency = 0; //default to BTC_ETH market
        this.providers = [];
        this.lastRefresh = 0;
        let i = 0;
        providers.forEach((provider) => {
            this.providers[i] = Object.create(provider);
            this.providers[i].setCurrency(0);
            i++;
        }, this);
        this.db = new LokiJs('markets.json');
        this.orders = this.db.addCollection('orders', {
            'indicies': ['price'],
            'autoupdate': true
        });
        this.ready = false;
        this.refreshData();
    }

    getDataByExchange(exchange)
    {
        return this.orders.find({'exchange': exchange});
    }

    /**
     * Returns all orders
     * @returns {Array}
     */
    getData()
    {
        return this.orders.chain().find({}).simplesort('price').data();
    }

    countRows()
    {
        return this.orders.count();
    }

    getProviders(){
        return this.providers;
    }

    /**
     * Returns the active currency
     * @returns {*}
     */
    getActiveCurrency() {
        return this.currencyMap[this.activeCurrency];
    }

    /**
     * Sets the active currency for the datastore and its injected dataproviders
     * @param currency
     */
    setActiveCurrency(currency)
    {
        this.activeCurrency = currency;
        this.providers.forEach((provider) => {
            provider.setCurrency(this.activeCurrency);
        });
    }

    /**
     * Returns an array of currently enabled providers
     * @returns {any[]}
     */
    getProviderNames()
    {
        return this.providers.map((provider) => {
            return(provider.name);
        });
    }

    /**
     * Flags orders which are a match for each other - a buy and sell at the same price point.
     * Uses a bit of roll your own groupBy aggregation and simple logic to find matches
     * @private
     */
    _findMatches()
    {
        let priceGrouping = {};
        this.getData().forEach((order) =>{
             if (!(order.price in priceGrouping))
                 priceGrouping[order.price] = 0;

             priceGrouping[order.price]++;
        });
        priceGrouping = Object.keys(priceGrouping).filter((price) =>{
            if (priceGrouping[price] > 1)
                return true;
        });
        priceGrouping.forEach((pricePoint) => {
            let ordersAtPrice = this.orders.find({price: Number(pricePoint)});
            let bidOrders = 0;
            let askOrders = 0;
            ordersAtPrice.forEach((order) =>{
                if (order.type === 'bid')
                    bidOrders++;
                if (order.type === 'ask')
                    askOrders++;
            });
            if (bidOrders > 0 && askOrders > 0)
            {
                ordersAtPrice.forEach((order) =>{
                    order.isMatch = true;
                });
            }
        });
    }

    /**
     * Roll-my-own mapReduce to restructure orders into market-at-price-point data
     * @returns {Array}
     */
    getMarketPrices()
    {
        let market = {};
        this.getData().forEach(function(order){
            if (!(order.price in market))
                market[order.price] = [];

            market[order.price].push(order);
        });

        return Object.keys(market).reduce((output, marketPrice) => {
            let marketPricePoint = new MarketPrice(marketPrice, this.activeCurrency);
            market[marketPrice].forEach((marketOrder) =>{
                if (marketOrder.isMatch)
                    marketPricePoint.overlap = true;
                marketPricePoint.addOrder(marketOrder);
            });
            output.push(marketPricePoint);
            return output;
        }, []);
    }

    /**
     * Clears all orders
     */
    clear()
    {
        this.orders.clear();
    }

    /**
     * Refreshes the data store from the various providers, also calls _findMatches to flag matching (overlapping) orders
     * @returns {Promise<void>}
     */
    async refreshData()
    {
        this.orders.clear();
        await Promise.each(this.providers, (provider) =>{
            return provider.getOpenOrders().then((orders) => {
                this.orders.insert(orders);
            }).catch((err) => {
                console.log(err);
                return false;
            });
        });
        this._findMatches();
        this.ready = true;
        this.lastRefresh = Date.now();
        return true;
    }
}

module.exports = DataStore;
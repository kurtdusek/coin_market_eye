import Order from './Order';

/**
 * Object for structuring price and volume data for open orders
 */
class MarketPrice{
    constructor(marketPrice, currency)
    {
        this.price = Number(marketPrice);
        this.volume = 0;
        this.orders = {};
        this.currencyMap = {
            0: 'BTC_ETH',
            1: 'BTC_LTC',
            2: 'ETH_LTC'
        };
        this.activeCurrency = currency;
        this.overlap = false;
    }

    /**
     * Adds an order to the collection and implicitly updates the volume
     *
     * @param order
     * @returns {boolean}
     */
    addOrder(order)
    {
        if (Object.getPrototypeOf(order) !== Order.prototype)
            return false;

        if (order.price !== this.price)
            return false;

        if (!this.orders[order.exchange])
        {
            this.orders[order.exchange] = {};
        }
        this.orders[order.exchange][order.type] = order;
        this._updateVolume();
    }

    getActiveCurrency()
    {
        return this.currencyMap[this.activeCurrency];
    }

    /**
     * Clears orders and volume
     */
    reset()
    {
        this.orders = [];
        this._updateVolume();
    }
    _updateVolume()
    {
        this.volume = 0;
        for(let provider in this.orders)
        {
            if (this.orders[provider].bid)
                this.volume += this.orders[provider].bid.volume;
            if (this.orders[provider].ask)
                this.volume += this.orders[provider].ask.volume;
        }
    }
}

module.exports = MarketPrice;
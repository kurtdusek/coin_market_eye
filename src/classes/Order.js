/**
 * Common Class for storing individual order data
 * @constructor
 */
class Order{
    constructor(price, volume, type, exchange, currency)
    {
        this.price = Number(price);
        this.volume = Number(volume);
        this.type = type;
        this.exchange = exchange;
        this.currency = currency;
        this.isMatch = false;
    }
}

module.exports = Order;
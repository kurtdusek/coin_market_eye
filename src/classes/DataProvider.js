/**
 * DataProvider acts as an abstract class to provide structure to create wrapper objects for various exchange API's
 * to return a consistent dataset for further processing
 * @constructor
 */
class DataProvider{
    constructor (name){
        this.name = name;
        this.currencyMap = {
            0: 'BTC_ETH',
            1: 'BTC_LTC',
            2: 'ETH_LTC'
        };
        this.activeCurrency = 0;
    }
    connect()
    {
        console.log('Connect to Server');
        throw new Error('Not Implemented');
    }
    setCurrencyMap(newCurrencyMap)
    {
        this.currencyMap = newCurrencyMap;
    }

    /**
     * Sets the active currency
     * @param currency
     */
    setCurrency(currency)
    {
        if (this.currencyMap[currency] === undefined)
            throw new Error("Invalid currency");
        else
            this.activeCurrency = currency;
    }
    getActiveCurrency()
    {
        return this.currencyMap[this.activeCurrency];
    }
    /**
     * A debugging function used to validate order object formatting
     */
    getSingleOrder(){
        console.log("Get Single Order");
        throw new Error('Not Implimented');

    }

    /**
     * Conversion function for translating API data to Order Objects.
     * @param data the record to be converted to an object
     * @param type Order type (bid or ask)
     * @private
     */
    _createRecord(data, type)
    {
        console.log("Create Record");
        throw new Error('Not Implemented');
    }
    /**
     * Primary function used to hydrate the local dataset, returns a collection of Orders
     */
    getOpenOrders(){
        console.log('Collect open orders');
        throw new Error('Not Implemented');
    }
}

module.exports = DataProvider;
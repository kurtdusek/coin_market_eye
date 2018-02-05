import DataProvider from '../classes/DataProvider.js';
import Order from '../classes/Order';

class MockProvider extends DataProvider{
    constructor(instance) {
        if (instance === undefined)
            instance = 0;
        super('MOCK_' + instance);
        this.currencyMap = {
            0: 'BTC_ETH',
            1: 'BTC_LTC',
            2: 'ETH_LTC'
        };
        this.orders = [];
    }

    connect(){
        return true;
    }

    addMockOrder(data, type)
    {
        this.orders.push(this._createRecord(data, type));
    }

    /**
     * Mock async call just for the promise.
     * @returns {Promise<Array>}
     */
    async getOpenOrders()
    {
        return this.orders;
    }

    _createRecord(data, type)
    {
        return new Order(Number(data.price), Number(data.volume), type, this.name, this.getActiveCurrency());
    }
}

module.exports = MockProvider;
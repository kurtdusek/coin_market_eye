import React from 'react';
import ReactTable from 'react-table';

import DataStore from '../classes/DataStore.js';
import PoloniexProvider from '../providers/PoloniexProvider.js';
import BittrexProvider from '../providers/BittrexProvider.js';
import HitBTCProvider from '../providers/HitBTCProvider.js';
//import MockProvider from "../providers/MockProvider";

/***
 * React.js UI component, utilizes the DataStore and its functions to display market data within the ReactTable component
 */
class MarketComponent extends React.Component{
    constructor(props){
        super(props);
        let dataStore = new DataStore([new PoloniexProvider(), new BittrexProvider(), new HitBTCProvider()]);

        /*let mockProvider = new MockProvider();
        mockProvider.addMockOrder({price:100, volume: 5}, 'bid');
        mockProvider.addMockOrder({price:101, volume:2}, 'bid');
        mockProvider.addMockOrder({price:102, volume:2}, 'ask');
        mockProvider.addMockOrder({price:103, volume:2}, 'ask');
        let mockProvider2 = new MockProvider(1);
        mockProvider2.addMockOrder({price:100, volume:3}, 'ask');
        mockProvider2.addMockOrder({price:101, volume:9}, 'bid');
        mockProvider.addMockOrder({price:103, volume:2}, 'ask');
        let dataStore = new DataStore([mockProvider, mockProvider2]);*/

        this.state = {
            refreshInterval: 20,
            dataStore: dataStore,
            activeCurrency: 0,
            data: null,
            ready: false,
            columns: [
                {
                    "Header": 'Overlap',
                    "accessor": "overlap",
                    Cell: row => (
                        <div style={{
                            border: row.value !== true ? 'solid 1px red' : 'solid 1px green'
                        }}>
                            {
                                row.value !== true ? `None` : `YES`
                            }
                        </div>
                    )
                },
                {
                    "Header": 'Price',
                    "accessor": 'price'
                },
                {
                    "Header": 'Volume',
                    "accessor": 'volume',
                },
                {
                    "Header": "Poloniex",
                    "columns": [
                        {
                            "Header": "Bid",
                            "accessor": 'orders.Poloniex.bid.volume',
                            Cell: row => (
                                <div style={{
                                    color: row.original.overlap === true && (row.value !== undefined && row.value !== 0) ? 'green' : ''
                                }}>{
                                        row.value !== undefined ? `${row.value}` : 0

                                    }</div>
                            )
                        },
                        {
                            "Header": "Ask",
                            "accessor": 'orders.Poloniex.ask.volume',
                            Cell: row => (
                                <div style={{
                                    color: row.original.overlap === true && (row.value !== undefined && row.value !== 0) ? 'green' : ''
                                }}>{
                                    row.value !== undefined ? `${row.value}` : 0

                                }</div>
                            )
                        }
                    ]
                },
                {
                    "Header": "Bittrex",
                    "columns": [
                        {
                            "Header": "Bid",
                            "accessor": 'orders.Bittrex.bid.volume',
                            Cell: row => (
                                <div style={{
                                    color: row.original.overlap === true && (row.value !== undefined && row.value !== 0) ? 'green' : ''
                                }}>{
                                    row.value !== undefined ? `${row.value}` : 0

                                }</div>
                            )
                        },
                        {
                            "Header": "Ask",
                            "accessor": 'orders.Bittrex.ask.volume',
                            Cell: row => (
                                <div style={{
                                    color: row.original.overlap === true && (row.value !== undefined && row.value !== 0) ? 'green' : ''
                                }}>{
                                    row.value !== undefined ? `${row.value}` : 0

                                }</div>
                            )
                        }
                    ]
                },
                {
                    "Header": "HitBTC",
                    "columns": [
                        {
                            "Header": "Bid",
                            "accessor": 'orders.HitBTC.bid.volume',
                            Cell: row => (
                                <div style={{
                                    color: row.original.overlap === true && (row.value !== undefined && row.value !== 0) ? 'green' : ''
                                }}>{
                                    row.value !== undefined ? `${row.value}` : 0

                                }</div>
                            )
                        },
                        {
                            "Header": "Ask",
                            "accessor": 'orders.HitBTC.ask.volume',
                            Cell: row => (
                                <div style={{
                                    color: row.original.overlap === true && (row.value !== undefined && row.value !== 0) ? 'green' : ''
                                }}>{
                                    row.value !== undefined ? `${row.value}` : 0

                                }</div>
                            )
                        }
                    ]
                },
            ]
        };
        this.refreshData = this.refreshData.bind(this);
        this.updateActiveCurrency = this.updateActiveCurrency.bind(this);
        this.refreshData();
        setInterval(() =>{this.refreshData()}, this.state.refreshInterval * 1000);
    }

    updateActiveCurrency(e){
        this.state.dataStore.setActiveCurrency(e.target.value);
        this.refreshData();
    }
    refreshData()
    {
        this.state.dataStore.refreshData().then(() => {
            let marketData = this.state.dataStore.getMarketPrices();
            this.setState({'data': marketData});
            this.setState({'ready': true});
            this.forceUpdate();
        });
    }

    render() {
        if (this.state.ready === true)
            return (<div>
                    <select id="currencySelector" onChange={this.updateActiveCurrency}>
                        <option value={0}>BTC_ETH</option>
                        <option value={1}>BTC_LTC</option>
                        <option value={2}>ETH_LTC</option>
                    </select> Books refresh every {this.state.refreshInterval} seconds
                <ReactTable data={this.state.data} defaultSorted={[{id: "price", desc: true}]} columns={this.state.columns} className="-striped -highlight"/>
                </div>
            );
        else
            return null;
    }
}
module.exports = MarketComponent;
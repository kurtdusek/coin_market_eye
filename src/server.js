'use strict'
const path = require('path')
const express = require('express')
const request = require('request-promise');
const Buffer = require('buffer/').Buffer;
module.exports = {
    app: function () {
        const app = express()
        const indexPath = path.join(__dirname, '../public/index.html')
        console.log(indexPath);
        const publicPath = express.static(path.join(__dirname, '../public'))

        app.use('/', publicPath)
        app.get('/', function (_, res) { res.sendFile(indexPath) })
        app.get('/proxy/:requestURL', function(req, res){
            let requestURL = Buffer.from(req.params.requestURL, 'base64').toString();
            request(requestURL).then(function(response) {
                res.send(response);
            });
        });
        return app
    }
};
// API 1.2 express application
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const config = require('./config/api-config.json');

app.use('/API/1.2/status', require('./routers/status'));
app.use('/API/1.2/climate', require('./routers/climate'));
app.use('/API/1.2/lighting', require('./routers/lighting'));
app.use('/API/1.2/consumption/electricity', require('./routers/electricity'));
app.use('/API/1.2/gateways', require('./routers/gateways'));
app.use('/API/1.2/repellers', require('./routers/repellers'));

app.listen(config.port, (err) => {
        if (err) {
                return console.log('ShWade WebUI API REST server start failed: ', err);
        }
        console.log(`ShWade WebUI API REST server is listening on port: ${config.port}.`);
});
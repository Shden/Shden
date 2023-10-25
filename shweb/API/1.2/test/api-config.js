const should = require('should');

// -- figure out what API version to test
let APIconfig = require('./api-origin-config.json')['API_1.2'];
console.log('API configuration:', APIconfig);

if (APIconfig.version === "1.2")
{
        console.log('For version 1.2 chai will be loaded.');
        
        const chai = require('chai');
        const chaiHttp = require('chai-http');
        const app = require('../webUI-API');

        // Configure chai
        chai.use(chaiHttp);
}

module.exports.config = APIconfig;
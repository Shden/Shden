const should = require('should');

// -- figure out what API version to test
// process.argv.length.should.be.aboveOrEqual(3);
// process.argv[2].should.be.String();
// let API_version = process.argv[2].split('=')[1];
let APIconfig = require('./api-origin-config.json')['API_1.2'];
console.log(`API configuration:`);
console.log(APIconfig);

if (APIconfig.version == "1.2")
{
        console.log('For version 1.2 chai will be loaded.');
        
        const chai = require('chai');
        const chaiHttp = require('chai-http');
        const app = require('../API/1.2/webUI-API');

        // Configure chai
        chai.use(chaiHttp);
        //chai.should();
}

module.exports.config = APIconfig;
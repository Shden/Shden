// -- figure out what API version to test
process.argv.length.should.be.above(3);
process.argv[2].should.be.String();
let API_version = process.argv[2].split('=')[1];
let APIconfig = require('./api-origin-config.json')['API_' + API_version];
console.log(`API configuration:`);
console.log(APIconfig);

module.exports.config = APIconfig;
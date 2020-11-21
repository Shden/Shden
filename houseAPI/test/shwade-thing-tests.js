// Tests for ShWadeThing REST API
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../shwade-thing');
const should = require('should');

chai.use(chaiHttp);

describe('ShWadeThing REST API tests', function() {

        it('GET ShWade thing status', function(done) {

                chai.request(server)
                        .get('/things/ShWade')
                        .end((err, res) => {
                                res.statusCode.should.be.equal(200);
                                res.body.should.be.an.Object();
                                res.body.should.have.property("oneWireStatus").which.is.an.Object();
                                //console.log(JSON.stringify(res.body));
                                done();
                        })
        });

        it('PUT ShWade thing status, change known switch should work', function(done) {

                let newStatus = {
                        oneWireStatus: {
                                switches: {
                                        saunaFloorSwitch: 1
                                }
                        }
                };

                chai.request(server)
                        .put('/things/ShWade')
                        .send(newStatus)
                        .end((err, res) => {
                                res.statusCode.should.be.equal(200);
                                res.body.should.have
                                        .property("oneWireStatus")
                                        .property('switches')
                                        .property("saunaFloorSwitch")
                                                .which.is.equal(1)
                                done();
                        });

        });

        it('PUT ShWade thing status should handle GET output', function(done) {

                chai.request(server)
                        .get('/things/ShWade')
                        .end((err, res) => {
                                res.statusCode.should.be.equal(200);
                                res.body.should.be.an.Object();

                                chai.request(server)
                                        .put('/things/ShWade')
                                        .send(res.body)
                                        .end((err, res) => {
                                                res.statusCode.should.be.equal(200);  
                                                done();
                                        });
                        });
        });

});
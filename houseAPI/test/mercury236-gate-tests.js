const m = require('../gates/mercury236-gate');
const should = require('should');

describe('Power meter gate tests:', function() {

        it('getStatus() promise resolved to valid REST object', function() {

                this.timeout(15000);

                function check3P(val)
                {
                        val.should.have.property("p1").which.is.a.Number();
                        val.should.have.property("p2").which.is.a.Number();
                        val.should.have.property("p3").which.is.a.Number();
                }

                function check3PSum(val)
                {
                        check3P(val);
                        val.should.have.property("sum").which.is.a.Number();
                }
                return m.getStatus().then(res => {
                        res.should.have.property("mainsStatus").which.is.a.Number();
                        res.should.have.property("U").which.is.an.Object(); check3P(res.U);
                        res.should.have.property("I").which.is.an.Object(); check3P(res.I);
                        res.should.have.property("CosF").which.is.an.Object(); check3PSum(res.CosF);
                        res.should.have.property("A").which.is.an.Object(); check3P(res.A);
                        res.should.have.property("P").which.is.an.Object(); check3PSum(res.P);
                        res.should.have.property("S").which.is.an.Object(); check3PSum(res.S);
                })
        });

});
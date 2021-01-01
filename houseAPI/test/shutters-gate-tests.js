const s = require('../gates/shutters-gate');
const should = require('should');

describe('Shutters gate tests:', function() {

        let x5555H = {
                F1: { W1: 0, W2: 1, W3: 0, W4: 1, W5: 0, W6: 1, W7: 0 },
                F2: { W1: 1, W2: 0, W3: 1, W4: 0, W5: 1, W6: 0, W7: 1, W8: 0, W9: 1 }
              };
        
        let xAAAAH = {
                F1: { W1: 1, W2: 0, W3: 1, W4: 0, W5: 1, W6: 0, W7: 1 },
                F2: { W1: 0, W2: 1, W3: 0, W4: 1, W5: 0, W6: 1, W7: 0, W8: 1, W9: 0 }
              };

        let partialUpdate = {
                F1: { W3: 1}
        };

        // it('test', function() {
        //         return s.setAll(Number('0xFF00'));
        // })
        
        function canSetTo(status)
        {
                return s.updateStatus(status).then(() => {
                        s.getStatus().then((actual) => { 
                                actual.F1.W1.should.be.equal(status.F1.W1);
                                actual.F1.W2.should.be.equal(status.F1.W2);
                                actual.F1.W3.should.be.equal(status.F1.W3);
                                actual.F1.W4.should.be.equal(status.F1.W4);
                                actual.F1.W5.should.be.equal(status.F1.W5);
                                actual.F1.W6.should.be.equal(status.F1.W6);
                                actual.F1.W7.should.be.equal(status.F1.W7);

                                actual.F2.W1.should.be.equal(status.F2.W1);
                                actual.F2.W2.should.be.equal(status.F2.W2);
                                actual.F2.W3.should.be.equal(status.F2.W3);
                                actual.F2.W4.should.be.equal(status.F2.W4);
                                actual.F2.W5.should.be.equal(status.F2.W5);
                                actual.F2.W6.should.be.equal(status.F2.W6);
                                actual.F2.W7.should.be.equal(status.F2.W7);
                                actual.F2.W8.should.be.equal(status.F2.W8);
                                actual.F2.W9.should.be.equal(status.F2.W9);
                        });
                })
        }

        it('Can update all', function() {
                return canSetTo(x5555H);
        });

        it('Can update parially', function() {
                return canSetTo(partialUpdate);
        });

});
const s = require('../gates/kincony-relays-gate');
const should = require('should');

describe('Shutters gate tests:', function() {

        let x5555H = {
            Shutters : {
                House : {
                    F1: { W1: 0, W2: 1, W3: 0, W4: 1, W5: 0, W6: 1, W7: 0 },
                    F2: { W1: 1, W2: 0, W3: 1, W4: 0, W5: 1, W6: 0, W7: 1, W8: 0, W9: 1 }
                }
            }
        };
        
        let xAAAAH = {
            Shutters : {
                House : {
                    F1: { W1: 1, W2: 0, W3: 1, W4: 0, W5: 1, W6: 0, W7: 1 },
                    F2: { W1: 0, W2: 1, W3: 0, W4: 1, W5: 0, W6: 1, W7: 0, W8: 1, W9: 0 }
                }
            }
        };

        let partialUpdate = {
            Shutters : {
                House : {
                    F2: { W5: 1 }
                },
                Garage: { W1: 1, W2: 1, W3: 1 }
            }
        };

        // it('test', function() {
        //         return s.setAll(Number('0xFF00'));
        // })
        
        function canSetTo(update)
        {
                function checkBit(currentBit, updateBit)
                {
                        if (updateBit !== undefined)
                                currentBit.should.be.equal(updateBit)
                }

                return s.updateStatus(update).then(() => {
                        s.getStatus().then((current) => { 

                                if (update.F1 !== undefined) {
                                        checkBit(current.F1.W1, update.F1.W1);
                                        checkBit(current.F1.W2, update.F1.W2);
                                        checkBit(current.F1.W3, update.F1.W3);
                                        checkBit(current.F1.W4, update.F1.W4);
                                        checkBit(current.F1.W5, update.F1.W5);
                                        checkBit(current.F1.W6, update.F1.W6);
                                        checkBit(current.F1.W7, update.F1.W7);
                                }

                                if (update.F2 !== undefined) {
                                        checkBit(current.F2.W1, update.F2.W1);
                                        checkBit(current.F2.W2, update.F2.W2);
                                        checkBit(current.F2.W3, update.F2.W3);
                                        checkBit(current.F2.W4, update.F2.W4);
                                        checkBit(current.F2.W5, update.F2.W5);
                                        checkBit(current.F2.W6, update.F2.W6);
                                        checkBit(current.F2.W7, update.F2.W7);
                                        checkBit(current.F2.W8, update.F2.W8);
                                        checkBit(current.F2.W9, update.F2.W9);
                                }
                        });
                })
        }

        it('Can get shutters state', function() {
                return s.getStatus().then((res) => { console.log(res)});
        });

        it.skip('Can update all', function() {
                return canSetTo(x5555H);
        });

        it.skip('Can update parially', function() {
                return canSetTo(partialUpdate);
        });

});
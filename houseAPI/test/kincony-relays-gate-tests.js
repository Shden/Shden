const s = require('../gates/kincony-relays-gate');
const should = require('should');

describe('Kincony gate tests:', function() {

        let houseShutters01 = {
                Shutters: {
                        House: {
                                F1: { W1: 0, W2: 1, W3: 0, W4: 1, W5: 0, W6: 1, W7: 0 },
                                F2: { W1: 1, W2: 0, W3: 1, W4: 0, W5: 1, W6: 0, W7: 1, W8: 0, W9: 1 }
                        }
                }
        };

        let houseShutters10 = {
                Shutters: {
                        House: {
                                F1: { W1: 1, W2: 0, W3: 1, W4: 0, W5: 1, W6: 0, W7: 1 },
                                F2: { W1: 0, W2: 1, W3: 0, W4: 1, W5: 0, W6: 1, W7: 0, W8: 1, W9: 0 }
                        }
                }
        };

        let garageRelays01 = {
                Relays: {
                        Garage: { R1: 0, R2: 1, R3: 0, R4: 1, R5: 0, R6: 1, R7: 0, R8: 1, R9: 0, R10: 1, R11: 0, R12: 1, R13: 0 }
                }
        };

        let garageRelays10 = {
                Relays: {
                        Garage: { R1: 1, R2: 0, R3: 1, R4: 0, R5: 1, R6: 0, R7: 1, R8: 0, R9: 1, R10: 0, R11: 1, R12: 0, R13: 1 }
                }
        };

        let shutters_partialUpdate = {
            Shutters : {
                House : {
                    F2: { W5: 1 }
                },
                Garage: { W1: 1, W2: 1, W3: 1 }
            }
        };

        function canSetTo(requestedState)
        {
                function checkBit(currentBit, updateBit)
                {
                        if (updateBit !== undefined)
                                currentBit.should.be.equal(updateBit)
                }

                return s.updateStatus(requestedState).then((updatedState) => {

                        if (requestedState.F1 !== undefined) {
                                checkBit(updatedState.F1.W1, requestedState.F1.W1);
                                checkBit(updatedState.F1.W2, requestedState.F1.W2);
                                checkBit(updatedState.F1.W3, requestedState.F1.W3);
                                checkBit(updatedState.F1.W4, requestedState.F1.W4);
                                checkBit(updatedState.F1.W5, requestedState.F1.W5);
                                checkBit(updatedState.F1.W6, requestedState.F1.W6);
                                checkBit(updatedState.F1.W7, requestedState.F1.W7);
                        }

                        if (requestedState.F2 !== undefined) {
                                checkBit(updatedState.F2.W1, requestedState.F2.W1);
                                checkBit(updatedState.F2.W2, requestedState.F2.W2);
                                checkBit(updatedState.F2.W3, requestedState.F2.W3);
                                checkBit(updatedState.F2.W4, requestedState.F2.W4);
                                checkBit(updatedState.F2.W5, requestedState.F2.W5);
                                checkBit(updatedState.F2.W6, requestedState.F2.W6);
                                checkBit(updatedState.F2.W7, requestedState.F2.W7);
                                checkBit(updatedState.F2.W8, requestedState.F2.W8);
                                checkBit(updatedState.F2.W9, requestedState.F2.W9);
                        }
                });
        }

        it('Can get kincony relays state', function() {
                return s.getStatus().then((res) => { 
                        // console.log(res);
                        res.should.have.a.property("Shutters").which.is.an.Object();
                        res.should.have.a.property("Relays").which.is.an.Object();

                        res.Relays.should.have.a.property("Garage").which.is.an.Object();
                        res.Relays.should.have.a.property("House").which.is.an.Object();

                        res.Relays.House.should.have.a.property("MainFuseBox").which.is.an.Object();
                });
        });

        describe('Shutter lines tests:', function() {

                it.skip('Can update house shutters to 0101010...', function() {
                        return canSetTo(houseShutters01);
                });

                it.skip('Can update house shutters to 1010101...', function() {
                        return canSetTo(houseShutters10);
                });

                it.skip('Can update shutters parially', function() {
                        return canSetTo(shutters_partialUpdate);
                });
        });

        describe('Relay lines tests:', function() {

                it.skip('Can update garage relays to 0101010...', function() {
                        return canSetTo(garageRelays01);
                });

                it.skip('Can update garage relays to 1010101...', function() {
                        return canSetTo(garageRelays10);
                });
        });
});
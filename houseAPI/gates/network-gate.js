const ping = require ("net-ping");

const googleIP = '64.233.164.100';      // google.com
const yandexIP = '5.255.255.70';        // yandex.ru
const SHWADE2 = '3.74.4.26';            // EC2 instance where web server runs
const VPN_PPTP = '3.78.173.59';         // VPN EC2 instance
// const deadIP = '192.168.10.100';

let session = ping.createSession();

// Creates REST object representing current network status
async function getStatus()
{
        var status = require('../models/network.json');

        return new Promise((resolved, rejected) => {

                Promise.all([
                        pingHost(googleIP),
                        pingHost(yandexIP),
                        pingHost(SHWADE2),
                        pingHost(VPN_PPTP)//,
                        // pingHost(deadIP)
                ]).then(res => {
                        status.ping.google = res[0];
                        status.ping.yandex = res[1];
                        status.ping.EC2.SHWADE = res[2];
                        status.ping.EC2.VPN = res[3];

                        resolved(status);
                });
        });
}

async function pingHost(hostIP)
{
        return new Promise((resolved, rejected) => {
                session.pingHost (hostIP, function (error, target, sent, received) {         
                    if (error)
                        resolved(null);
                    else
                        resolved(received - sent);
                });
        });
}

if (typeof exports !== 'undefined')
{
        exports.getStatus = getStatus;
}
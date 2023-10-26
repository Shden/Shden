const { response } = require('express');
const http = require('http');
const aws = require('aws-sdk');
const m = require('./mergeDeep');

const config = require('./config/shwade-API-config.json');

class ShWadeAPI {

        constructor(params)
        {
                this.local = params['thingAPI'] != null && params['thingAPI'] == true;

                if (!this.local)
                {
                        this.iotData = new aws.IotData( 
                                { 
                                        accessKeyId: config.shadow.accessKeyId,
                                        secretAccessKey: config.shadow.secretAccessKey,
                                        endpoint: config.shadow.endpoint,
                                        region: config.shadow.region
                                } 
                        );
                }
        }

        // -- Calls API (local or cloud) to get house status
        getStatus() 
        {
                return new Promise((resolved, rejected) => {
                        // -- if things status (local) is requested
                        if (this.local)
                        {
                                var request = http.request(({
                                        host: config.thing.host,
                                        port: config.thing.port,
                                        path: config.thing.path,
                                        method: 'GET'
                                }), responce => {
                
                                        var data = '';
                                        responce.on('data', b => {
                                                data += b;
                                        });
                                        responce.on('end', () => {
                                                if (responce.statusCode === 200)
                                                        resolved(JSON.parse(data));
                                                else {
                                                        console.log(data);
                                                        rejected(responce.statusCode);
                                                }
                                        });
                                        responce.on('error', err => {
                                                console.log(err);
                                                rejected(err);
                                        });
                                });
                                request.end();
                        }
                        // -- if shadow status is requested
                        else
                        {
                                this.iotData.getThingShadow({ thingName : config.shadow.thingName }, (err, data) => {
                                        if (err)
                                                rejected(err);
                                        else 
                                        {
                                                var p = JSON.parse(data.payload);
                                                resolved(p.state.reported);
                                        }
                                })
                        };
                });                      
        }

        // -- Calls API (local or cloud) to update house status
        updateStatus(update)
        {
                return new Promise((resolved, rejected) => {
                        // -- if things status (local) is requested
                        if (this.local)
                        {
                                let payload = JSON.stringify(update);
                                var request = http.request(({
                                        host: config.thing.host,
                                        port: config.thing.port,
                                        path: config.thing.path,
                                        method: 'PUT',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'Content-Length': payload.length
                                        }
                                }), responce => {
                
                                        var data = '';
                                        responce.on('data', b => {
                                                data += b;
                                        });
                                        responce.on('end', () => {
                                                if (responce.statusCode === 200)
                                                        resolved(JSON.parse(data));
                                                else {
                                                        console.log(data);
                                                        rejected(responce.statusCode);
                                                }
                                        });
                                        responce.on('error', err => {
                                                console.log(err);
                                                rejected(err);
                                        });
                                });
                                request.write(payload);
                                request.end();
                        }
                        // -- if shadow status is requested
                        else
                        {
                                let updateRequest = {
                                        payload: JSON.stringify({
                                                state: {
                                                        desired: update
                                                }
                                        }),
                                        thingName: config.shadow.thingName
                                };

                                // console.log(params);

                                this.iotData.updateThingShadow(updateRequest, (err, data) => {
                                        if (err)
                                                rejected(err)
                                        else
                                        {
                                                var o = JSON.parse(data.payload);
                                                // console.log(data);

                                                // 26.20.23 - returning o.state.desired doesn't work 
                                                // as it only has updated properties and not the whole object!

                                                this.getStatus().then(status => { 
                                                        resolved(m.mergeDeep(status, o.state.desired)); 
                                                });
                                                // resolved(m.mergeDeep(o.state.reported, o.state.desired));
                                        } 
                                });
                        };
                });
        }
}

module.exports = ShWadeAPI;
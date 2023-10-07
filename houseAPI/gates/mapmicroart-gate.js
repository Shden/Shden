const http = require('http');
const config = require('../config/mapmicroart-config.json');
const HTTPStatus = require('http-status-codes').StatusCodes;
const mqtt = require('mqtt');

/*

_PLoad_calc нагрузка Вт на МАП
_IAcc_med_A_u16 ток от аккумулятора
_Uacc напряжение аккумуляторов

*/


// MAP modes enumeration (_MODE field)
const MapMode = Object.freeze({ 
        GridON : 3,		// МАП включен и транслирует сеть
	GridOFFBattery: 2, 	// МАП включен. Генерация от АКБ. Нет сети
	GridONCharging: 4	// МАП включен и транслирует сеть. Зарядка аккумулятора
});

const mqttClient = mqtt.connect(config.mqtt);

// get microart MAP invertor status
function getStatus()
{
        return new Promise((resolved, rejected) => {
		http.get({
			host: config.host,
			port: config.port,
                        path: config.path
		}, responce => {
			if (responce.statusCode != HTTPStatus.OK)
				rejected(responce.statusCode);

			var data = '';
			responce.on('data', b => {
                                data += b;
			});
			responce.on('end', () => {
                                try
                                {
                                        var mapInfo = JSON.parse(data);

                                        // rub the result a bit 
                                        // delete some trash
                                        delete mapInfo.timestamp;
                                        delete mapInfo.time;
                                        delete mapInfo._UID;

                                        for (val in mapInfo)
                                                // console.log(val);
                                                if (val != '_Status_Char')
                                                        mapInfo[val] = Number(mapInfo[val]);
                                                        
                                        // send notification on map when needed
                                        notifyMapStatus(mapInfo);

                                        resolved(mapInfo);
                                }
                                catch(e)
                                {
                                        console.error(e);
                                        rejected(e)
                                }
			});
			responce.on('error', err => {
				console.error(err);
				rejected(err);
			});
		});
	});
}

var mapMode = -1;

// Send MQTT messages about MAP modes
function notifyMapStatus(mapInfo)
{
	if (mapInfo._MODE != mapMode)
	{
		mapMode = mapInfo._MODE;
		mqttClient.publish('map/status', JSON.stringify({ _MODE : mapMode }));
	}
}

if (typeof exports !== 'undefined')
{
        // methods
        exports.getStatus = getStatus;
}
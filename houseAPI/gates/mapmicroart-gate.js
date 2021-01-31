const http = require('http');
const config = require('../config/mapmicroart-config.json');
const HTTPStatus = require('http-status-codes').StatusCodes;


/*

_MODE   3: МАП включен и транслирует сеть
        2: МАП включен. Генерация от АКБ. Нет сети.


_PLoad_calc нагрузка Вт на МАП
_IAcc_med_A_u16 ток от аккумулятора
_Uacc напряжение аккумуляторов

*/

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

				resolved(mapInfo);
			});
			responce.on('error', err => {
				console.log(err);
				rejected(err);
			});
		});
	});
}

if (typeof exports !== 'undefined')
{
        // methods
        exports.getStatus = getStatus;
}
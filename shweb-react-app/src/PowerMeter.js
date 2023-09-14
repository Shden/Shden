import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from './Spinner';
import GetAPIURL from './API';

export default class PowerMeter extends React.Component {

        constructor(props) 
        {
                super(props);
                this.state = {

                };
                this.powerMeterDataEndPointURL = GetAPIURL("consumption/electricity/GetPowerMeterData");
        }

        componentDidMount() 
        {
                this.loadFormData();
                var t = this;
                setInterval(function(){t.loadFormData()}, 30000);
        }

        set loading(_loading)
        {
                this.setState({ loading: _loading });
        }

        loadFormData()
        {
                this.loading = true;
                fetch(this.powerMeterDataEndPointURL)
                        .then((response) => response.json())
                        .then((powerData) => {
                                // this.setState({
                                //         outsideTemp: houseStatus.oneWireStatus.temperatureSensors.outsideTemp,
                                //         insideTemp: houseStatus.oneWireStatus.temperatureSensors.bedroom,
                                //         mainsSwitch: houseStatus.oneWireStatus.switches.mainsSwitch,
                                //         mode: houseStatus.config.modeId,
                                //         powerConsumption: houseStatus.powerStatus.S.sum/1000,
                                //         todayConsumption: houseStatus.powerStatus.PT.ap
                                // });
                                this.loading = false;
                        });
        }

        render()
        {
                return (
                        <Container>
                                <Menu/>
                                <h1>Данные электросчетчика</h1>
                                <h3>Мгновенные значения:</h3>
                                <Table striped bordered hover>
                                        <thead>
                                                <tr>
                                                        <th className="first">Параметр</th>
                                                        <th>Фаза 1</th>
                                                        <th>Фаза 2</th>
                                                        <th>Фаза 3</th>
                                                        <th>Всего</th>
                                                </tr>
                                        </thead>
                                        <tbody>
                                                <tr>
                                                        <td className="first">Внешнее электропитание:</td>
                                                        <td id="mainsStatus" colSpan="4"/>
                                                </tr>
                                                <tr>
                                                        <td className="first">Напряжение сети (В):</td>
                                                        <td id="U-p1"/>
                                                        <td id="U-p2"/>
                                                        <td id="U-p3"/>
                                                        <td></td>
                                                </tr>
                                                <tr>
                                                        <td className="first">Ток потребления (А):</td>
                                                        <td id="I-p1"/>
                                                        <td id="I-p2"/>
                                                        <td id="I-p3"/>
                                                        <td></td>
                                                </tr>
                                                <tr>
                                                        <td className="first">Коэффициент мощности (cos(f)):</td>
                                                        <td id="CosF-p1"/>
                                                        <td id="CosF-p2"/>
                                                        <td id="CosF-p3"/>
                                                        <td id="CosF-sum"/>
                                                </tr>
                                                <tr>
                                                        <td className="first">Угол сдвига фаз:</td>
                                                        <td id="A-p1"/>
                                                        <td id="A-p2"/>
                                                        <td id="A-p3"/>
                                                        <td></td>
                                                </tr>
                                                <tr>
                                                        <td className="first">Текущая активная мощность (Вт):</td>
                                                        <td id="P-p1"/>
                                                        <td id="P-p2"/>
                                                        <td id="P-p3"/>
                                                        <td id="P-sum"/>
                                                </tr>
                                                <tr>
                                                        <td className="first">Текущая реактивная мощность (Вт):</td>
                                                        <td id="S-p1"/>
                                                        <td id="S-p2"/>
                                                        <td id="S-p3"/>
                                                        <td id="S-sum"/>
                                                </tr>
                                                <tr>
                                                        <td className="first">Частота сети (Гц):</td>
                                                        <td colSpan="4" id="F"/>
                                                </tr>
                                        </tbody>
                                </Table>
                                <br/>
                                <h3>Накопленные значения:</h3>
                                <Table striped bordered hover>
                                        <thead>
                                                <tr>
                                                        <th className="first">Потребление энергии</th>
                                                        <th>Значение по счетчику</th>
                                                </tr>
                                        </thead>
                                        <tbody>
                                                <tr>
                                                        <td className="first">Всего:</td>
                                                        <td><span id="PR-ap">...</span>&nbsp;кВт</td>
                                                </tr>
                                                <tr>
                                                        <td className="first">&nbsp;&nbsp;из них по дневному тарифу:</td>
                                                        <td><span id="PR-day-ap">...</span>&nbsp;кВт</td>
                                                </tr>
                                                <tr>
                                                        <td className="first">&nbsp;&nbsp;из них по ночному тарифу:</td>
                                                        <td><span id="PR-night-ap">...</span>&nbsp;кВт</td>
                                                </tr>
                                                <tr>
                                                        <td className="first">Вчера:</td>
                                                        <td><span id="PY-ap">...</span>&nbsp;кВт</td>
                                                </tr>
                                                <tr>
                                                        <td className="first">Сегодня:</td>
                                                        <td><span id="PT-ap">...</span>&nbsp;кВт</td>
                                                </tr>
                                        </tbody>
                                </Table>
                                <br/>
                                <Button onClick={this.loadFormData}>Обновить</Button>
                                <Spinner loading={this.state.loading}/> 
                        </Container>
                )
        }
}
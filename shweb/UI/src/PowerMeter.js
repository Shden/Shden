import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Numeral from 'react-numeral';
import Spinner from './Spinner';
import GetAPIURL from './API';

export default class PowerMeter extends React.Component {

        constructor(props) 
        {
                super(props);
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
                                this.setState(powerData);
                                console.log(this.state);
                                this.loading = false;
                        });
        }

        render()
        {
                return (
                        <Container>
                                <Menu/>
                                <Row className="justify-content-md-center">
                                        <Col md='8'>
                                                <h1>Данные электросчетчика</h1>
                                                <Alert variant='success' hidden={this.state?.mainsStatus === undefined || !(this.state?.mainsStatus === 1)}>Все в порядке: работает сетевое электропитание.</Alert>
                                                <Alert variant='danger' hidden={this.state?.mainsStatus === undefined || !(this.state?.mainsStatus !== 1)}>Сбой: работает источник резервного электропитания, сетевое электропитание отсутвует.</Alert>
                                                <h3>Мгновенные значения:</h3>
                                                <Table striped hover>
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
                                                                        <td className="first">Напряжение сети (В):</td>
                                                                        <td align='right'><Numeral value={this.state?.U?.p1} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.U?.p2} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.U?.p3} format={'0.00'}/></td>
                                                                        <td></td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Ток потребления (А):</td>
                                                                        <td align='right'><Numeral value={this.state?.I?.p1} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.I?.p2} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.I?.p3} format={'0.00'}/></td>
                                                                        <td></td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Коэффициент мощности (cos(f)):</td>
                                                                        <td align='right'><Numeral value={this.state?.CosF?.p1} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.CosF?.p2} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.CosF?.p3} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.CosF?.sum} format={'0.00'}/></td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Угол сдвига фаз:</td>
                                                                        <td align='right'><Numeral value={this.state?.A?.p1} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.A?.p2} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.A?.p3} format={'0.00'}/></td>
                                                                        <td></td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Текущая активная мощность (Вт):</td>
                                                                        <td align='right'><Numeral value={this.state?.P?.p1} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.P?.p2} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.P?.p3} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.P?.sum} format={'0.00'}/></td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Текущая реактивная мощность (Вт):</td>
                                                                        <td align='right'><Numeral value={this.state?.S?.p1} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.S?.p2} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.S?.p3} format={'0.00'}/></td>
                                                                        <td align='right'><Numeral value={this.state?.S?.sum} format={'0.00'}/></td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Частота сети (Гц):</td>
                                                                        <td colSpan="4" align='right'><Numeral value={this.state?.F} format={'0.00'}/></td>
                                                                </tr>
                                                        </tbody>
                                                </Table>
                                                <br/>
                                                <h3>Накопленные значения:</h3>
                                                <Table striped hover>
                                                        <thead>
                                                                <tr>
                                                                        <th className="first">Потребление энергии</th>
                                                                        <th>Значение по счетчику</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                <tr>
                                                                        <td className="first">Всего:</td>
                                                                        <td align='right'><Numeral value={this.state?.PR?.ap} format={'0,0.00'}/>&nbsp;кВт</td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">&nbsp;&nbsp;из них по дневному тарифу:</td>
                                                                        <td align='right'><Numeral value={this.state?.['PR-day']?.ap} format={'0,0.00'}/>&nbsp;кВт</td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">&nbsp;&nbsp;из них по ночному тарифу:</td>
                                                                        <td align='right'><Numeral value={this.state?.['PR-night']?.ap} format={'0,0.00'}/>&nbsp;кВт</td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Вчера:</td>
                                                                        <td align='right'><Numeral value={this.state?.PY?.ap} format={'0,0.00'}/>&nbsp;кВт</td>
                                                                </tr>
                                                                <tr>
                                                                        <td className="first">Сегодня:</td>
                                                                        <td align='right'><Numeral value={this.state?.PT?.ap} format={'0,0.00'}/>&nbsp;кВт</td>
                                                                </tr>
                                                        </tbody>
                                                </Table>
                                                <br/>
                                                <Button onClick={() => this.loadFormData()}>Обновить</Button>
                                                <Spinner loading={this.state?.loading}/>
                                        </Col>
                                </Row>
                        </Container>
                )
        }
}
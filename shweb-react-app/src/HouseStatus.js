import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link }  from "react-router-dom";
import Spinner from './Spinner';
import GetAPIURL from './API';

import numeral from 'numeral';
import c3 from 'c3';

function TemperaturePanel(props)
{
        let classSpec = "temp-big";
        if (props.temperature > +2.0) classSpec += " temp-warm";
        if (props.temperature < -2.0) classSpec += " temp-cold";

        let value = (props.temperature !== undefined) ? numeral(props.temperature).format("+0.0") + "°C" : "--.--";

        return  (
                <Col xs lg="4">{props.label}&nbsp;<span className={classSpec}>{value}</span></Col>);
}

function MainsStatus(props)
{
        const [classSpec, value] = (props.status === 1) ? [ "mains-on", "Вкл." ] : [ "mains-off", "Выкл." ];

        return (
                <h1>
                        Электропитание: <span id="mains" className={classSpec}>{value}</span>
                </h1>
        );
}

function PowerGauge(props)
{
        c3.generate({
                bindto: "#chart",
                data: {
                        columns: [
                                ['Расход сейчас', props.powerConsumption]
                        ],
                        type: 'gauge'
                },
                gauge: {
                        label: {
                                format: function(value, ratio) {
                                        return (value !== undefined) ? numeral(value).format('0.00') + ' кВт/ч' : '--.--';
                                },
                                show: true // to turn off the min/max labels.
                        },
                        min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
                        max: 20//, // 100 is default
                        //units: 'Нагрузка',
                //    width: 39 // for adjusting arc thickness
                },
                color: {
                        pattern: [ '#60B044', '#F6C600', '#F97600', '#FF0000'], // color levels for the values.
                        threshold: {
                                //            unit: 'value', // percentage is default
                                //            max: 200, // 100 is default
                                values: [3, 6, 9, 12]
                        }
                },
                size: {
                        height: 200
                }
        });
        return <div id="chart" />;
}

class HouseStatus extends React.Component {

        constructor(props) 
        {
                super(props);
                this.state = {
                        mode: 1,
                        powerConsumption: 0
                };
                this.houseStatusEndpointUrl = GetAPIURL('status/HouseStatus');
                this.houseModeEndopointUrl = GetAPIURL('status/HouseMode');
                this.modeMenu = {
                        '1' : {
                                name: 'Режим присутствия',
                                transitionName: 'Перевести в режим присутствия',
                                variant: 'success'
                        },
                        '0' : {
                                name: 'Режим долгосрочного ожидания',
                                transitionName: 'Перевести в режим долгосрочного ожидания',
                                variant: 'danger'
                        },
                        '2' : {
                                name: 'Режим краткосрочного ожидания',
                                transitionName: 'Перевести в режим краткосрочного ожидания',
                                variant: 'warning'
                        }			
                }
        
        }

        set loading(_loading)
        {
                this.setState({ loading: _loading });
        }

        loadFormData()
        {
                this.loading = true;
                fetch(this.houseStatusEndpointUrl)
                        .then((response) => response.json())
                        .then((houseStatus) => {
                                this.setState({
                                        outsideTemp: houseStatus.oneWireStatus.temperatureSensors.outsideTemp,
                                        insideTemp: houseStatus.oneWireStatus.temperatureSensors.bedroom,
                                        mainsSwitch: houseStatus.oneWireStatus.switches.mainsSwitch,
                                        mode: houseStatus.config.modeId,
                                        powerConsumption: houseStatus.powerStatus.S.sum/1000,
                                        todayConsumption: houseStatus.powerStatus.PT.ap
                                });
                                this.loading = false;
                        });
        }

        setHouseMode(newMode)
        {
                if (!window.confirm('Меняем режим?')) return;
                
                console.log(newMode);
                this.loading = true;
                fetch(this.houseModeEndopointUrl, { 
                        method: 'PUT',
                        body: JSON.stringify({ mode: newMode}),
                        headers: {
                                "Content-type": "application/json; charset=UTF-8"
                        }
                })
                        .then(response => response.json())
                        .then(data => {
                                this.loading = false;
                                console.log(data);
                                if (data.config.modeId === newMode)
                                {
                                        alert(`Помняли режим на: ${data.config.modeDescription}.`);
                                }
                                else
                                {
                                        alert('Ошибка: не удалось сменить режим.');
                                }
                        })
                        .catch(error => alert('Ошибка: ' + error));
        }

        componentDidMount() 
        {
                this.loadFormData();
                var t = this;
                setInterval(function(){t.loadFormData()}, 30000);
        }

        render() 
        {
                return (
                        <Container>
                                <Menu/>
                                <Container align="center">
                                        <Container>
                                                <DropdownButton title={this.modeMenu[this.state.mode].name} variant={this.modeMenu[this.state.mode].variant} size="lg" className='padding-after-32'>
                                                {
                                                        [1, 0, 2].map(item => {
                                                                if (item !== this.state.mode) return (
                                                                        <Dropdown.Item key={item} eventKey={item} onClick={() => this.setHouseMode(item)}>
                                                                                {this.modeMenu[item].transitionName}
                                                                        </Dropdown.Item>);
                                                        })
                                                }
                                                </DropdownButton>
                                                <MainsStatus status={this.state.mainsSwitch}/>
                                                Расход сегодня: <span className="power-val">{numeral(this.state.todayConsumption).format('0.0') + ' кВт/ч'}</span>
                                                <PowerGauge powerConsumption={this.state.powerConsumption}/>
                                        </Container>
                                        <Container>
                                                <Row className="justify-content-md-center">
                                                        <TemperaturePanel label="В&nbsp;доме:" temperature={this.state.insideTemp}/>
                                                        <TemperaturePanel label="На&nbsp;улице:" temperature={this.state.outsideTemp}/>
                                                </Row>
                                        </Container>
                                        <Container>
                                                <Link to="MonitorPanel">Панель мониторинга</Link>
                                        </Container>
                                        <Spinner loading={this.state.loading}/>  
                                </Container>
                        </Container>
                );
        }
}

export default HouseStatus;

import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link }  from "react-router-dom";

import numeral from 'numeral';
import c3 from 'c3';
import RingLoader from 'react-spinners/RingLoader';

function TemperaturePanel(props)
{
        let classSpec = "temp-big";
        if (props.temperature > +2.0) classSpec += " temp-warm";
        if (props.temperature < -2.0) classSpec += " temp-cold";

        let value = (props.temperature !== undefined) ? numeral(props.temperature).format("+0.0") + " °C" : "--.--";

        return  (
                <span>{props.label}<span id="outside" className={classSpec}>{value}</span></span>);
}

function MainsStatus(props)
{
        const [classSpec, value] = (props.status === 1) ? [ "mains-on", "Вкл." ] : [ "mains-off", "Выкл." ];

        return (
                <h2>
                        Электропитание: <span id="mains" className={classSpec}>{value}</span>
                </h2>
        );
}

function PowerGauge(props)
{
        c3.generate({
                bindto: "#chart",
                data: {
                        columns: [
                                ['Нагрузка', props.powerConsumption]
                        ],
                        type: 'gauge'
                },
                gauge: {
                        label: {
                                format: function(value, ratio) {
                                        return (value !== undefined) ? numeral(value).format('0.00') + ' кВт' : '--.--';
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
                this.houseStatusEndpointUrl = 'https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/API/1.2/status/HouseStatus';
                this.houseModeEndopointUrl = 'https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/API/1.2/status/HouseMode';
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

        set wheelVisible(_showWheel)
        {
                this.setState({ loading: _showWheel });
        }

        updateForm()
        {
                this.wheelVisible = true;
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
                                this.wheelVisible = false;
                        });
        }

        setHouseMode(newMode)
        {
                if (!window.confirm('Меняем режим?')) return;
                
                console.log(newMode);
                this.wheelVisible = true;
                fetch(this.houseModeEndopointUrl, { 
                        method: 'PUT',
                        body: JSON.stringify({ mode: newMode}),
                        headers: {
                                "Content-type": "application/json; charset=UTF-8"
                        }
                })
                        .then(response => response.json())
                        .then(data => {
                                this.wheelVisible = false;
                                console.log(data);
                                if (data.config.modeId == newMode)
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
                this.updateForm();
                var t = this;
                setInterval(function(){t.updateForm()}, 30000);
        }

        render() 
        {
                const spinner = {
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "100px",
                        height: "100px",
                        marginTop: "-50px", /*set to a negative number 1/2 of your height*/
                        marginLeft: "-50px" /*set to a negative number 1/2 of your width*/
                };

                return (
                        <Container>

                                <Menu/>
                                <br/>
                                <Container align="center">
                                        <Container>
                                                <DropdownButton title={this.modeMenu[this.state.mode].name} variant={this.modeMenu[this.state.mode].variant} size="lg">
                                                {
                                                        [1, 0, 2].map(item => {
                                                                if (item != this.state.mode) return (
                                                                        <Dropdown.Item key={item} eventKey={item} onClick={() => this.setHouseMode(item)}>
                                                                                {this.modeMenu[item].transitionName}
                                                                        </Dropdown.Item>);
                                                        })
                                                }
                                                </DropdownButton>
                                                <MainsStatus status={this.state.mainsSwitch}/>
                                                Расход сегодня: <span id="power_today" className="power-val">{numeral(this.state.todayConsumption).format('0.0') + ' кВт/ч'}</span>
                                                <PowerGauge powerConsumption={this.state.powerConsumption}/>
                                        </Container>
                                        <Container>
                                                <TemperaturePanel label="В доме:" temperature={this.state.insideTemp}/>
                                                <TemperaturePanel label="На улице:" temperature={this.state.outsideTemp}/>
                                        </Container>
                                        <Container>
                                                <Link to="MonitorPanel">Панель мониторинга</Link>
                                        </Container>        
                                        <RingLoader color='green' size={100} loading={this.state.loading} cssOverride={spinner}/>  
                                </Container>
                        </Container>
                );
        }
}

export default HouseStatus;

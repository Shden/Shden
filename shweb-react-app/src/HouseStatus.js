import React from 'react';
import './HouseStatus.css';
import './Menu';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Numeral from 'react-numeral';
import numeral from 'numeral';
import c3 from 'c3';

function TemperaturePanel(props)
{
        let classSpec = "temp-big";
        if (props.temperature > +2.0) classSpec += " temp-warm";
        if (props.temperature < -2.0) classSpec += " temp-cold";

        return  (
                <span>{props.label} <span id="outside" className={classSpec}>
                        <Numeral value={props.temperature} format="+0.0"/>&nbsp;&deg;C
                </span></span>);
}

function MainsStatus(props)
{
        const [classSpec, value] = (props.status == 1) ? [ "mains-on", "Вкл." ] : [ "mains-off", "Выкл." ];

        return (
                <h2>
                        Электропитание: <span id="mains" className={classSpec}>{value}</span>
                </h2>
        );
}

function HouseStatusButton(props)
{
        let modeMenu = {
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
        };
                        
        return (
                <DropdownButton title={modeMenu[props.mode].name} variant={modeMenu[props.mode].variant} size="lg">
                        {
                                [1, 0, 2].map(item => {
                                        if (item != props.mode) 
                                                return <Dropdown.Item key={item} eventKey={item}>{modeMenu[item].transitionName}</Dropdown.Item>
                                })
                        }
                </DropdownButton>
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
                                        return numeral(value).format('0.00') + ' кВт';
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
                        // outsideTemp: '--.--',
                        // insideTemp: '--.--',
                        mode: 1,
                        powerConsumption: 1.2
                };
        }

        componentDidMount() 
        {
                const apiUrl = 'https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/API/1.2/status/HouseStatus';
                fetch(apiUrl)
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
                        });
        }

        render() 
        {
                return (
                        <Container>

                                <Menu/>
                                <br/>
                                <Container align="center">
                                        <Container>
                                                <HouseStatusButton mode={this.state.mode}/>
                                                <MainsStatus status={this.state.mainsSwitch}/>
                                                Расход сегодня: <span id="power_today" className="power-val">{numeral(this.state.todayConsumption).format('0.0') + ' кВт/ч'}</span>
                                                <PowerGauge powerConsumption={this.state.powerConsumption}/>
                                        </Container>
                                        <Container>
                                                <TemperaturePanel label="В доме:" temperature={this.state.insideTemp}/>
                                                <TemperaturePanel label="На улице:" temperature={this.state.outsideTemp}/>
                                        </Container>
                                        <Container>
                                                <a href="temperature.php">Панель мониторинга</a>
                                        </Container>
                                </Container>
                                <div id="spinner" className="spinner"></div>
                        </Container>

                        // <script>
                        //         $(document).ready(function() {
                        //                 updateForm();
                        //                 setInterval(updateForm, 30000);
                        //         });
                        
                        //         function updateForm()
                        //         {
                        //                 $('#spinner').show();
                        //                 var spinner = createSpinner('spinner');
                        
                        //                 $.getJSON(GetAPIURL("status/HouseStatus"))
                        //                         .done(function(data) {
                        
                        //                                 refreshControls(data);
                        
                        //                                 spinner.stop();
                        //                                 $('#spinner').hide();
                        //                         })
                        //                         .fail(function(err) {
                        //                                 alert('Ошибка вызова GET HouseStatus.');
                        //                         });
                        //         }
                        
                        //         function refreshControls(data)
                        //         {
                        //                 formatTemp($('#inside'), data.oneWireStatus.temperatureSensors.bedroom);
                        //                 formatTemp($('#outside'), data.oneWireStatus.temperatureSensors.outsideTemp);
                        
                        //                 var mainsGlyphon = $('#mains');
                        //                 if (data.oneWireStatus.switches.mainsSwitch == 1)
                        //                 {
                        //                         mainsGlyphon
                        //                                 .addClass('mains-on')
                        //                                 .removeClass('mains-off')
                        //                                 .html('Вкл.');
                        //                 }
                        //                 else
                        //                 {
                        //                         mainsGlyphon
                        //                                 .addClass('mains-off')
                        //                                 .removeClass('mains-on')
                        //                                 .html('Выкл.');
                        //                 }
                        
                        //                 var power_now = $('#power_now');
                        //                 var power_today = $('#power_today');
                        
                        //                 if ('PT' in data.powerStatus && 'S' in data.powerStatus)
                        //                 {
                        //                         power_today.html(numeral(data.powerStatus.PT.ap).format('0.0') + ' кВт/ч');
                        //                         renderPowerGauge(data.powerStatus.S.sum/1000);
                        //                 }
                        
                        //                 let modeMenu = {
                        //                         '1' : {
                        //                                 name: 'Режим присутствия',
                        //                                 transitionName: 'Перевести в режим присутствия',
                        //                                 class: 'btn-success'
                        //                         },
                        //                         '0' : {
                        //                                 name: 'Режим долгосрочного ожидания',
                        //                                 transitionName: 'Перевести в режим <b>долгосрочного</b> ожидания',
                        //                                 class: 'btn-danger'
                        //                         },
                        //                         '2' : {
                        //                                 name: 'Режим краткосрочного ожидания',
                        //                                 transitionName: 'Перевести в режим <b>краткосрочного</b> ожидания',
                        //                                 class: 'btn-warning'
                        //                         }			
                        //                 };
                        
                        //                 let currentMode = $('#currentMode');
                        //                 let currentModeToggle = $('#currentModeToggle');
                        //                 let mode = data.config.modeId;
                        
                        //                 // -- current mode display
                        //                 currentMode.html(modeMenu[mode].name);
                        //                 currentMode.addClass(modeMenu[mode].class);
                        //                 currentModeToggle.addClass(modeMenu[mode].class);
                        
                        //                 // -- possible mode transitions 
                        //                 $('#changeModeMenu').empty();
                        //                 for (transitionMode in modeMenu)
                        //                         if (mode != transitionMode)
                        //                         {
                        //                                 $('#changeModeMenu').append(`<li><a class="dropdown-item" href="javascript:SetHouseMode(${transitionMode})">${modeMenu[transitionMode].transitionName}</a></li>`);
                        //                                 currentMode.removeClass(modeMenu[transitionMode].class);
                        //                                 currentModeToggle.removeClass(modeMenu[transitionMode].class);	
                        //                         }
                        
                        //         }
                        
                        //         function renderPowerGauge(powerConsumption)
                        //         {
                        //                 var chart = c3.generate({
                        //                         data: {
                        //                                 columns: [
                        //                                         ['data', powerConsumption]
                        //                                 ],
                        //                                 type: 'gauge'
                        //                         },
                        //                         gauge: {
                        //                                 label: {
                        //                                         format: function(value, ratio) {
                        //                                                 return numeral(value).format('0.00') + ' кВт';
                        //                                         },
                        //                                         show: true // to turn off the min/max labels.
                        //                                 },
                        //                                 min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
                        //                                 max: 20, // 100 is default
                        //                                 units: 'Нагрузка',
                        //                         //    width: 39 // for adjusting arc thickness
                        //                         },
                        //                         color: {
                        //                                 pattern: [ '#60B044', '#F6C600', '#F97600', '#FF0000'], // color levels for the values.
                        //                                 threshold: {
                        //                                         //            unit: 'value', // percentage is default
                        //                                         //            max: 200, // 100 is default
                        //                                         values: [3, 6, 9, 12]
                        //                                 }
                        //                         },
                        //                         size: {
                        //                                 height: 180
                        //                         }
                        //                 });
                        //         }
                        
                        
                        //         function SetHouseMode(newMode)
                        //         {
                        //                 if (!confirm('Меняем режим?')) return;
                        
                        //                 $('#spinner').show();
                        //                 var spinner = createSpinner('spinner');
                        
                        //                 $.ajax({
                        //                         url: GetAPIURL("status/HouseMode"),
                        //                         type: 'PUT',
                        //                         dataType: 'json',
                        //                         contentType: 'application/json',
                        //                         data: JSON.stringify({ mode: newMode}),
                        //                         success: function(data) {
                        //                                 refreshControls(data);
                        
                        //                                 spinner.stop();
                        //                                 $('#spinner').hide();
                        
                        //                                 if (data.config.modeId == newMode)
                        //                                 {
                        //                                         alert(`Помняли режим на: ${data.config.modeDescription}.`);
                        //                                 }
                        //                                 else
                        //                                 {
                        //                                         alert('Ошибка: не удалось сменить режим.');
                        //                                 }
                        //                         },
                        //                         error: function(xhr, status, error) {
                        //                                 alert('Ошибка: ' + error);
                        //                         }
                        //                 });
                        //         }
                        
                        // </script> 
                        // </html>
                        );
        }
}

export default HouseStatus;

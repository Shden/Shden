import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Spinner from './Spinner';
import GetAPIURL from './API';

export default class Lighting extends React.Component {

        constructor(props) 
        {
                super(props);
                this.shuttersDataEndPointURL = GetAPIURL("shutters/State");

                // // applianceStatusUpdate will have access to this.
                // this.applianceStatusUpdate = this.applianceStatusUpdate.bind(this);
        }

        componentDidMount() 
        {
                this.loadFormData();
                var t = this;
                // setInterval(function(){t.loadFormData()}, 30000);
        }

        set loading(_loading)
        {
                this.setState({ loading: _loading });
        }

        loadFormData()
        {
                this.loading = true;
                fetch(this.shuttersDataEndPointURL)
                        .then((response) => response.json())
                        .then((shuttersData) => {
                                console.log(shuttersData);
                                this.setState(shuttersData);
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
                                                <h1>Управление роллетами</h1>
                                                <Table hover>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Дом:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={this.moveAllTo0} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={this.moveAllTo1} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Первый этаж:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={this.moveFloor1to0} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={this.moveFloor1to1} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Гардеробная:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W1}
                                                                                building="House" floor="F1" window="W1"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кухня:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W2}
                                                                                building="House" floor="F1" window="W2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кладовая около кухни:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W3}
                                                                                building="House" floor="F1" window="W3"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кабинет Али:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W4}
                                                                                building="House" floor="F1" window="W4"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Холл:</td>
                                                                        <td>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F1.W5}
                                                                                        building="House" floor="F1" window="W5"/>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F1.W6}
                                                                                        building="House" floor="F1" window="W6"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Прихожая:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W7}
                                                                                building="House" floor="F1" window="W7"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Второй этаж:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={this.moveFloor2to0} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={this.moveFloor2to1} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Ко-ливинг:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W1}
                                                                                building="House" floor="F2" window="W1"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Большая детская комната:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W2}
                                                                                building="House" floor="F2" window="W2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Сашина комната:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W3}
                                                                                building="House" floor="F2" window="W3"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Холл:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W4}
                                                                                building="House" floor="F2" window="W4"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кабинет:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W5}
                                                                                building="House" floor="F2" window="W5"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Маленькая детская:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W6}
                                                                                building="House" floor="F2" window="W6"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Балкон на озеро:</td>
                                                                        <td>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F2.W7}
                                                                                        building="House" floor="F2" window="W7"/>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F2.W8}
                                                                                        building="House" floor="F2" window="W8"/>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F2.W9}
                                                                                        building="House" floor="F2" window="W9"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Гараж:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={this.moveGarageTo0} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={this.moveGarageTo1} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Дальнее окно:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.Garage?.W1}
                                                                                building="Garage" window="W1"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Среднее окно:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.Garage?.W2}
                                                                                building="Garage" window="W2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Ближнее окно:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.Garage?.W3}
                                                                                building="Garage" window="W3"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                </Table>
                                                <Spinner loading={this.state?.loading}/>
                                        </Col>
                                </Row>
                        </Container>
                )
        }

        // applianceStatusUpdate(event)
        // {
        //         console.log(event);     
        //         var changeStatusURL = GetAPIURL("lighting/ChangeStatus") + "/" + event.applianceId + "/" + event.newState;
        //         // console.log(this.state);
        //         this.loading = true;

        //         fetch(changeStatusURL, { 
        //                 method: 'PUT',
        //                 // headers: {
        //                 //         "Content-type": "application/json; charset=UTF-8"
        //                 // }
        //         })
        //                 .then(() => {
        //                         this.loading = false;
        //                         this.setState({ [event.applianceId]: event.newState });
        //                 })
        //                 .catch(error => alert('Ошибка: ' + error));

        // }

        moveAllTo0()
        {

        }

        moveAllTo1()
        {

        }

        moveFloor1to0()
        {

        }

        moveFloor1to1()
        {

        }

        moveFloor2to0()
        {

        }

        moveFloor2to1()
        {

        }

        moveGarageTo0()
        {

        }

        moveGarageTo1()
        {

        }
}

function ShutterButton(props)
{
        return (
                <Button 
                        variant={(props.value === 1) ? 'secondary' : 'warning'} 
                        size="lg" 
                        onClick={(e) => props.applianceStatusUpdate({ applianceId: props.applianceId, newState: (props.value === 1) ? 0 : 1 })}> 
                        {(props.value === 1) ? 'Опустить' : 'Поднять'}
                </Button>
        );
}
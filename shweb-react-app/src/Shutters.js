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

                // shutterStatusUpdate will have access to this.
                this.shutterStatusUpdate = this.shutterStatusUpdate.bind(this);
                // this.moveAll = this.moveAll.bind(this);
                // this.moveFloor = this.moveFloor.bind(this);
                // this.callAPI = this.callAPI.bind(this);
        }

        componentDidMount() 
        {
                this.loadFormData();
                var t = this;
                setInterval(function(){t.loadFormData()}, 15000);
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
                                                                                <button type="button" onClick={() => this.moveAll(0)} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={() => this.moveAll(1)} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Первый этаж:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={() => this.moveFloor(1, 0)} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={() => this.moveFloor(1, 1)} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Гардеробная:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W1}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F1" window="W1"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кухня:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W2}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F1" window="W2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кладовая около кухни:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W3}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F1" window="W3"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кабинет Али:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W4}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F1" window="W4"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Холл:</td>
                                                                        <td>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F1.W5}
                                                                                        shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                        building="House" floor="F1" window="W5"/>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F1.W6}
                                                                                        shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                        building="House" floor="F1" window="W6"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Прихожая:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F1.W7}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F1" window="W7"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Второй этаж:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={() => this.moveFloor(2, 0)} className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={() => this.moveFloor(2, 1)} className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Ко-ливинг:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W1}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F2" window="W1"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Большая детская комната:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W2}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F2" window="W2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Сашина комната:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W3}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F2" window="W3"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Холл:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W4}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F2" window="W4"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кабинет:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W5}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F2" window="W5"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Маленькая детская:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.House?.F2.W6}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="House" floor="F2" window="W6"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Балкон на озеро:</td>
                                                                        <td>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F2.W7}
                                                                                        shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                        building="House" floor="F2" window="W7"/>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F2.W8}
                                                                                        shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                        building="House" floor="F2" window="W8"/>
                                                                                <ShutterButton
                                                                                        value={this.state?.House?.F2.W9}
                                                                                        shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                        building="House" floor="F2" window="W9"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Гараж:</th>
                                                                        <th className="bg-secondary">
                                                                                <button type="button" onClick={ () => this.moveFloor('garage', 0) } className="btn btn-dark">Спустить все</button>
                                                                                <button type="button" onClick={ () => this.moveFloor('garage', 1) } className="btn btn-warning">Поднять все</button>
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Дальнее окно:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.Garage?.W1}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="Garage" window="W1"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Среднее окно:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.Garage?.W2}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
                                                                                building="Garage" window="W2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Ближнее окно:</td>
                                                                        <td><ShutterButton
                                                                                value={this.state?.Garage?.W3}
                                                                                shutterStatusUpdateCallback={this.shutterStatusUpdate}
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

        shutterStatusUpdate(event)
        {
                console.log(event);   
                let req = { Shutters: { }};
                if (event.building === 'House')
                        req.Shutters.House = {[event.floor]: { [event.window]: event.newState }};
                if (event.building === 'Garage')
                        req.Shutters.Garage = { [event.window]: event.newState };
                this.callAPI(req);
        }

        moveFloor(floor, newState)
        {
                let req = { Shutters: { }};
                if (floor === 1)
                {
                        req.Shutters.House = {};
                        req.Shutters.House.F1 = {};
                        req.Shutters.House.F1.W1 = newState;
                        req.Shutters.House.F1.W2 = newState;
                        req.Shutters.House.F1.W3 = newState;
                        req.Shutters.House.F1.W4 = newState;
                        req.Shutters.House.F1.W5 = newState;
                        req.Shutters.House.F1.W6 = newState;
                        req.Shutters.House.F1.W7 = newState;
                }
                if (floor === 2)
                {
                        req.Shutters.House = {};
                        req.Shutters.House.F2 = {};
                        req.Shutters.House.F2.W1 = newState;
                        req.Shutters.House.F2.W2 = newState;
                        req.Shutters.House.F2.W3 = newState;
                        req.Shutters.House.F2.W4 = newState;
                        req.Shutters.House.F2.W5 = newState;
                        req.Shutters.House.F2.W6 = newState;
                        req.Shutters.House.F2.W7 = newState;
                        req.Shutters.House.F2.W8 = newState;
                        req.Shutters.House.F2.W9 = newState;
                }
                if (floor === 'garage')
                {
                        req.Shutters.Garage = {};
                        req.Shutters.Garage.W1 = newState;
                        req.Shutters.Garage.W2 = newState;
                        req.Shutters.Garage.W3 = newState;
                }
                this.callAPI(req);
        }

        moveAll(newState)
        {
                let req = { Shutters: { 
                        House: {
                                F1: {}, 
                                F2: {}
                        }, 
                        Garage: {}}};

                req.Shutters.House.F1.W1 = newState;
                req.Shutters.House.F1.W2 = newState;
                req.Shutters.House.F1.W3 = newState;
                req.Shutters.House.F1.W4 = newState;
                req.Shutters.House.F1.W5 = newState;
                req.Shutters.House.F1.W6 = newState;
                req.Shutters.House.F1.W7 = newState;

                req.Shutters.House.F2.W1 = newState;
                req.Shutters.House.F2.W2 = newState;
                req.Shutters.House.F2.W3 = newState;
                req.Shutters.House.F2.W4 = newState;
                req.Shutters.House.F2.W5 = newState;
                req.Shutters.House.F2.W6 = newState;
                req.Shutters.House.F2.W7 = newState;
                req.Shutters.House.F2.W8 = newState;
                req.Shutters.House.F2.W9 = newState;

                req.Shutters.Garage.W1 = newState;
                req.Shutters.Garage.W2 = newState;
                req.Shutters.Garage.W3 = newState;

                this.callAPI(req);
        }

        callAPI(req)
        {
                console.log(req);
                
                var changeStatusURL = GetAPIURL("shutters/State");
                // console.log(this.state);
                this.loading = true;

                fetch(changeStatusURL, { 
                        method: 'PUT',
                        body: JSON.stringify(req),
                        headers: { "Content-type": "application/json; charset=UTF-8" }
                })
                .then(response => response.json())
                .then(updatedStatus => {
                        console.log('updated result:', updatedStatus);
                        this.setState(updatedStatus);
                })
                .then(() => new Promise((resolve) => setTimeout(resolve, 15000)))
                .then(() => this.loadFormData())
                .then(() => this.loading = false)
                .catch(error => alert('Ошибка: ' + error));


                // $('#spinner').show();
                // var spinner = createSpinner('spinner');

                // $.ajax({
                //         url: endpoint,
                //         type: 'PUT',
                //         contentType: 'application/json',
                //         data: JSON.stringify(req),
                //         success: function(data) {

                //                 // console.log(data);
                //                 refreshButtons(data);

                //                 spinner.stop();
                //                 $('#spinner').hide();
                //         }
                // });
        }
}

function ShutterButton(props)
{
        return (
                <Button 
                        variant={(props.value === 1) ? 'secondary' : 'warning'} 
                        size="lg" 
                        onClick={(e) => props.shutterStatusUpdateCallback({ 
                                building: props.building,
                                floor: props.floor,
                                window: props.window,
                                newState: (props.value === 1) ? 0 : 1 
                        })}> 
                        {(props.value === 1) ? 'Опустить' : 'Поднять'}
                </Button>
        );
}
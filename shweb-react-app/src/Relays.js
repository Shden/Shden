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

export default class Relays extends React.Component 
{
        constructor(props) 
        {
                super(props);
                this.relaysDataEndPointURL = GetAPIURL("relays/State");

                // shutterStatusUpdate will have access to this.
                this.relayStatusUpdate = this.relayStatusUpdate.bind(this);
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
                fetch(this.relaysDataEndPointURL)
                        .then((response) => response.json())
                        .then((relaysData) => {
                                console.log(relaysData);
                                this.setState(relaysData);
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
                                                <h1>Управление реле</h1>
                                                <Table hover>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Гараж:</th>
                                                                        <th className="bg-secondary">
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Электрощиток:</th>
                                                                        <th className="bg-secondary">
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        {
                                                                this.state?.Garage !== undefined ?
                                                                // JSON.stringify(Object.entries(this.state.Garage))
                                                                        Object.entries(this.state?.Garage).map(item => {
                                                                                // return <p>{item[0]} - {item[1]}</p>
                                                                                return (
                                                                                        <tbody className="align-middle" key={item[0]}>
                                                                                                <tr>
                                                                                                        <td>{item[0]}:</td>
                                                                                                        <td>
                                                                                                                <Button
                                                                                                                        variant={(item[1] === 1) ? 'secondary' : 'warning'} 
                                                                                                                        onClick={(e) => this.relayStatusUpdate({
                                                                                                                                building: 'Garage',
                                                                                                                                module: 'MainFuse',    
                                                                                                                                relay: item[0],
                                                                                                                                newState: (item[1] === 1) ? 0 : 1
                                                                                                                        })}>
                                                                                                                        {(item[1] === 1) ? 'Выключить' : 'Включить'}
                                                                                                                </Button>
                                                                                                        </td>
                                                                                                </tr>
                                                                                        </tbody>
                                                                                )
                                                                        }) : ''
                                                        }
                                                </Table>
                                                <Spinner loading={this.state?.loading}/>
                                        </Col>
                                </Row>
                        </Container>
                )
        }

        relayStatusUpdate(event)
        {
                // console.log(event);   
                let req = { Relays: { }};
                // if (event.building === 'House')
                //         req.Shutters.House = {[event.floor]: { [event.window]: event.newState }};
                if (event.building === 'Garage')
                        req.Relays.Garage = { [event.relay]: event.newState };
                this.callAPI(req);
        }

        callAPI(req)
        {
                console.log(req);
                
                var relaysChangeURL = GetAPIURL("relays/State");
                // console.log(this.state);
                this.loading = true;

                fetch(relaysChangeURL, { 
                        method: 'PUT',
                        body: JSON.stringify(req),
                        headers: { "Content-type": "application/json; charset=UTF-8" }
                })
                .then(response => response.json())
                .then(updatedStatus => {
                        console.log('updated result:', updatedStatus);
                        this.setState(updatedStatus);
                })
                // -- workaround: shadow update usually delayed so get one more roundtrip after 15 sec
                .then(() => new Promise((resolve) => setTimeout(resolve, 15000)))
                .then(() => this.loadFormData())
                .then(() => this.loading = false)
                .catch(error => alert('Ошибка: ' + error));
        }
}
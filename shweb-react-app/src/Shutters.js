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
                                this.setState(shuttersData);
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
                                                <h1>Управление роллетами</h1>
                                                <Table hover>

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
}

// function LightingButton(props)
// {
//         return (
//                 <Button 
//                         variant={(props.value === 1) ? 'secondary' : 'warning'} 
//                         size="lg" 
//                         onClick={(e) => props.applianceStatusUpdate({ applianceId: props.applianceId, newState: (props.value === 1) ? 0 : 1 })}> 
//                         {(props.value === 1) ? 'Погасить' : 'Зажечь'}
//                 </Button>
//         );
// }
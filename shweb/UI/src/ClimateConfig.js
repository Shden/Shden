import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from './Spinner';
import GetAPIURL from './API';

function TemperatureInput(props)
{
        return (
                <InputGroup>
                        <Form.Control
                                required
                                type="number"
                                step="0.5"
                                value={props.value}
                                onChange={props.onChange}
                                defaultValue={props.defaultValue}
                        />
                        <InputGroup.Text>&deg;C</InputGroup.Text>
                        <Form.Control.Feedback type="invalid">
                                Неверное значение температуры.
                        </Form.Control.Feedback>
                </InputGroup>
        );
}

export default class ClimateConfig extends React.Component {

        constructor(props) 
        {
                super(props);
                //  {saunaFloorTemp: 28, saunaFloorTempShortStandBy: 25, saunaFloorTempLongStandBy: 5, house1FloorTemp: 23}
                this.state = {
                        house1FloorTemp: 0,
                        saunaFloorTemp: 0,
                        saunaFloorTempShortStandBy: 0,
                        saunaFloorTempLongStandBy: 0,
                        validated: false
                };
                this.climateConfigurationEndPointURL = GetAPIURL("climate/Configuration");
        }

        render()
        {
                return (
                        <Container>
                                <Menu/>
                                <Row className="justify-content-md-center">
                                        <Col md='10'>
                                                <h1>Настройка климата</h1>
                                                <Alert variant='success' hidden={!(this.state.validated && this.state.valid)}>Настройки климата сохранены.</Alert>
                                                <Alert variant='danger' hidden={!(this.state.validated && !this.state.valid)}>Невозможно сохранить настройки климата.</Alert>
                                                <Form noValidate validated={this.state.validated} onSubmit={e => this.updateConfiguration(e)}>
                                                        <Container>
                                                                <Row className='config-row'>
                                                                        <Col md="3"></Col>
                                                                        <Col>Присутствие</Col>
                                                                        <Col>Краткосрочное ожидание</Col>
                                                                        <Col>Долгосрочное ожидание</Col>
                                                                </Row>
                                                                <Row className='config-row'>
                                                                        <Col className='config-row-header' md="3">Пол в сауне</Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state.saunaFloorTemp}
                                                                                        onChange={e => this.setState({ saunaFloorTemp: e.target.value })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state.saunaFloorTempShortStandBy}
                                                                                        onChange={e => this.setState({ saunaFloorTempShortStandBy: e.target.value })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state.saunaFloorTempLongStandBy}
                                                                                        onChange={e => this.setState({ saunaFloorTempLongStandBy: e.target.value })}/>
                                                                        </Col>
                                                                </Row>
                                                                <Row className='config-row'>
                                                                        <Col className='config-row-header' md="3">Пол в холле первого этажа</Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state.house1FloorTemp}
                                                                                        onChange={(e) => this.setState({ house1FloorTemp: e.target.value })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput defaultValue="0"/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput defaultValue="0"/>
                                                                        </Col>
                                                                </Row>
                                                                <Row className='config-row'>
                                                                        <Col className='config-row-header' md="3">Система отопления</Col>
                                                                        <Col>
                                                                                <TemperatureInput defaultValue="0"/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput defaultValue="0"/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput defaultValue="0"/>
                                                                        </Col>
                                                                </Row>
                                                        </Container>
                                                        <Button type='submit'>Сохранить настройки</Button>
                                                </Form>
                                                <Spinner loading={this.state.loading}/>
                                        </Col>
                                </Row>
                        </Container>
                );
        }

        componentDidMount() 
        {
                this.loadFormData();
        }

        loadFormData()
        {
                this.loading = true;
                fetch(this.climateConfigurationEndPointURL)
                        .then((response) => response.json())
                        .then((configuration) => {
                                // console.log(configuration);
                                this.setState({ ...configuration.heating });
                                this.loading = false;
                        });
        }

        updateConfiguration(e)
        {
                // console.log(this.state);
                const form = e.currentTarget;
                const valid = form.checkValidity();

                // TODO: review configuration gate logic, create update object, call API

                this.setState({ validated: true, valid: valid });

                e.preventDefault();
                e.stopPropagation();

        }

        set loading(_loading)
        {
                this.setState({ loading: _loading });
        }

}
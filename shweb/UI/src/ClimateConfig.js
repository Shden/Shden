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
                                value={props.value !== undefined ? props.value : ""}
                                onChange={props.onChange}
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
                this.getClimateConfigurationEndPointURL = GetAPIURL("climate/Configuration");
                this.updateClimateConfigurationEndPointURL = GetAPIURL("climate/UpdateHeatingSetting");
                this.updateConfiguration = this.updateConfiguration.bind(this);
        }

        render()
        {
                return (
                        <Container>
                                <Menu/>
                                <Row className="justify-content-md-center">
                                        <Col md='10'>
                                                <h1>Настройка климата</h1>
                                                <Alert variant='success' hidden={!(this.state?.validated && this.state.valid)}>Настройки климата сохранены.</Alert>
                                                <Alert variant='danger' hidden={!(this.state?.validated && !this.state.valid)}>Невозможно сохранить настройки климата.</Alert>
                                                <Form noValidate validated={this.state?.validated} onSubmit={e => this.updateConfiguration(e)}>
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
                                                                                        value={this.state?.heating?.saunaFloor.settings.presence}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, saunaFloor: { 
                                                                                                        settings: { ...this.state.heating.saunaFloor.settings, presence: Number(e.target.value) }
                                                                                                }} 
                                                                                        })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state?.heating?.saunaFloor.settings.shortTermStandby}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, saunaFloor: { 
                                                                                                        settings: { ...this.state.heating.saunaFloor.settings, shortTermStandby: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state?.heating?.saunaFloor.settings.longTermStandby}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, saunaFloor: {
                                                                                                        settings: { ...this.state.heating.saunaFloor.settings, longTermStandby: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                </Row>
                                                                <Row className='config-row'>
                                                                        <Col className='config-row-header' md="3">Пол в холле первого этажа</Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state?.heating?.hallFloor.settings.presence}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, hallFloor: {
                                                                                                        settings: { ...this.state.heating.hallFloor.settings, presence: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput 
                                                                                value={this.state?.heating?.hallFloor.settings.shortTermStandby}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, hallFloor: {
                                                                                                        settings: { ...this.state.heating.hallFloor.settings, shortTermStandby: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput
                                                                                        value={this.state?.heating?.hallFloor.settings.longTermStandby}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, hallFloor: {
                                                                                                        settings: { ...this.state.heating.hallFloor.settings, longTermStandby: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                </Row>
                                                                <Row className='config-row'>
                                                                        <Col className='config-row-header' md="3">Газовый котел</Col>
                                                                        <Col>
                                                                                <TemperatureInput 
                                                                                        value={this.state?.heating?.nanaoBoiler.settings.presence}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, nanaoBoiler: {
                                                                                                        settings: { ...this.state.heating.nanaoBoiler.settings, presence: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput 
                                                                                        value={this.state?.heating?.nanaoBoiler.settings.shortTermStandby}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, nanaoBoiler: {
                                                                                                        settings: { ...this.state.heating.nanaoBoiler.settings, shortTermStandby: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                        <Col>
                                                                                <TemperatureInput 
                                                                                        value={this.state?.heating?.nanaoBoiler.settings.longTermStandby}
                                                                                        onChange={e => this.setState({ 
                                                                                                validated: false,
                                                                                                heating: {...this.state.heating, nanaoBoiler: {
                                                                                                        settings: { ...this.state.heating.nanaoBoiler.settings, longTermStandby: Number(e.target.value) }
                                                                                                }}
                                                                                        })}/>
                                                                        </Col>
                                                                </Row>
                                                        </Container>
                                                        <Button type='submit'>Сохранить настройки</Button>
                                                </Form>
                                                <Spinner loading={this.state?.loading}/>
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
                fetch(this.getClimateConfigurationEndPointURL)
                        .then((response) => response.json())
                        .then((configuration) => {
                                // console.log(configuration);
                                this.setState(configuration);
                                this.loading = false;
                        });
        }

        updateConfiguration(e)
        {
                console.log(this.state.heating);
                const form = e.currentTarget;
                const valid = form.checkValidity();

                e.preventDefault();
                e.stopPropagation();

                if (valid) {
                        fetch(this.updateClimateConfigurationEndPointURL, { 
                                method: 'PUT',
                                headers: {
                                        "Content-type": "application/json; charset=UTF-8"
                                },
                                body: JSON.stringify(this.state.heating)
                        })
                        .then(() => {
                                this.loading = false;
                                this.setState({ validated: true, valid: true });
                        })
                        .catch(error => alert('Ошибка: ' + error));
                }
                else
                        this.setState({ validated: true, valid: false });
        }

        set loading(_loading)
        {
                this.setState({ loading: _loading });
        }

}
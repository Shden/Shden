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
                this.lightingDataEndPointURL = GetAPIURL("lighting/GetStatus");

                // applianceStatusUpdate will have access to this.
                this.applianceStatusUpdate = this.applianceStatusUpdate.bind(this);
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
                fetch(this.lightingDataEndPointURL)
                        .then((response) => response.json())
                        .then((lightingData) => {
                                this.setState(lightingData);
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
                                                <h1>Управление освещением</h1>
                                                <Table hover>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Уличное освещение:</th>
                                                                        <th className="bg-secondary">
                                                                                {/* API for group operations needed first
                                                                                <Button onClick="moveAll(0);" variant="warning">Погасить все</Button> */}
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Уличный фонарь около дороги (250W):</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.streetLight250} 
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="streetLight250"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Уличный фонарь на озеро (150W):</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.streetLight150} 
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="streetLight150"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Подсветка забора и парковки:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.fenceLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="fenceLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Крыльцо, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.porchOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="porchOverheadsLight"/>
                                                                        </td>
                                                                </tr>				
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Дом:</th>
                                                                        <th className="bg-secondary">
                                                                                {/* API for group operations needed first
                                                                                <Button onClick="moveAll(0);" variant="warning">Погасить все</Button> */}
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Первый этаж:</th>
                                                                        <th className="bg-secondary">
                                                                                {/* API for group operations needed first
                                                                                <Button onClick="moveFloor(1,0);" variant="warning">Погасить все</Button> */}
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Тамбур прихожей:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.hallwayTambourOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="hallwayTambourOverheadsLight"/>
                                                                        </td>
                                                                </tr>				
                                                                <tr>
                                                                        <td>Прихожая:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.hallwayOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="hallwayOverheadsLight"/>
                                                                        </td>
                                                                </tr>				
                                                                <tr>
                                                                        <td>Котельная:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.boilerRoomOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="boilerRoomOverheadsLight"/>
                                                                        </td>
                                                                </tr>				
                                                                <tr>
                                                                        <td>Холл, верхний свет:</td>
                                                                        <td>
                                                                                <LightingButton 
                                                                                        value={this.state?.hall1OverheadsMainLight}
                                                                                        applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                        applianceId="hall1OverheadsMainLight"/>
                                                                                <LightingButton 
                                                                                        value={this.state?.hall1OverheadsExtraLight}
                                                                                        applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                        applianceId="hall1OverheadsExtraLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кухня, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.kitchenOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="kitchenOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Гардеробная, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.dressingRoomOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="dressingRoomOverheadsLight"/>
                                                                        </td>
                                                                </tr>				
                                                                <tr>
                                                                        <td>Кладовая у кухни, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.pantryOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="pantryOverheadsLight"/>
                                                                        </td>
                                                                </tr>				
                                                                <tr>
                                                                        <td>Кабинет Али, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.alyaCabinetOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="alyaCabinetOverheadsLight"/>
                                                                        </td>
                                                                </tr>	
                                                                <tr>
                                                                        <td>Ванная комната, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.bathroom1OverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="bathroom1OverheadsLight"/>
                                                                        </td>
                                                                </tr>	
                                                                <tr>
                                                                        <td>Сауна, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.saunaOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="saunaOverheadsLight"/>
                                                                        </td>
                                                                </tr>	
                                                                <tr>
                                                                        <td>Сауна, нижняя подсветка:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.saunaUnderLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="saunaUnderLight"/>
                                                                        </td>
                                                                </tr>	
                                                                                        
                                                                <tr>
                                                                        <td>Лесница, подсветка:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.stairwayLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="stairwayLight"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>				
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Второй этаж:</th>
                                                                        <th className="bg-secondary">
                                                                                {/* API for group operations needed first
                                                                                <Button onClick="moveFloor(1,0);" variant="warning">Погасить все</Button> */}
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Наша спальня, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.ourBedroomOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="ourBedroomOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Маленькая детская, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.smallChildrenRoomOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="smallChildrenRoomOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Тамбур в коливинг, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.colivingTambourOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="colivingTambourOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Коливинг, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.colivingOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="colivingOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Большая детская, верхний свет:</td>
                                                                        <td>
                                                                                <LightingButton 
                                                                                        value={this.state?.biggerChildrenRoomOverheadsLight1}
                                                                                        applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                        applianceId="biggerChildrenRoomOverheadsLight1"/>
                                                                                <LightingButton 
                                                                                        value={this.state?.biggerChildrenRoomOverheadsLight2}
                                                                                        applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                        applianceId="biggerChildrenRoomOverheadsLight2"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Тамбур в Сашину комнату, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.sashaTambourOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="sashaTambourOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Санузел, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.bathroom2OverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="bathroom2OverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Сашина комната, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.sashaOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="sashaOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Холл 2-го этажа, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.hall2OverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="hall2OverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Кабинет Дениса, верхний свет:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.denisCabinetOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="denisCabinetOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Свет на балконе 2-го этажа:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.balconyLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="balconyLight"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Гараж:</th>
                                                                        <th className="bg-secondary">
                                                                                {/* API for group operations needed first
                                                                                <Button onClick="notimplementedyet();" variant="warning">Погасить все</Button> */}
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Верхний свет внутри:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.garageOverheadsLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="garageOverheadsLight"/>
                                                                        </td>
                                                                </tr>
                                                                <tr>
                                                                        <td>Освещение под навесом:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.garageAwningLight}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="garageAwningLight"/>
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                        <thead className="align-middle">
                                                                <tr>
                                                                        <th className="bg-secondary">Переключатели:</th>
                                                                        <th className="bg-secondary"></th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="align-middle">
                                                                <tr>
                                                                        <td>Клапан подкачки воды в систему отопления:</td>
                                                                        <td><LightingButton 
                                                                                value={this.state?.heatingPressureValve}
                                                                                applianceStatusUpdate={this.applianceStatusUpdate}
                                                                                applianceId="heatingPressureValve"/>
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

        applianceStatusUpdate(event)
        {
                console.log(event);     
                var changeStatusURL = GetAPIURL("lighting/ChangeStatus") + "/" + event.applianceId + "/" + event.newState;
                // console.log(this.state);
                this.loading = true;

                fetch(changeStatusURL, { 
                        method: 'PUT',
                        // headers: {
                        //         "Content-type": "application/json; charset=UTF-8"
                        // }
                })
                        .then(() => {
                                this.loading = false;
                                this.setState({ [event.applianceId]: event.newState });
                        })
                        .catch(error => alert('Ошибка: ' + error));

        }
}

function LightingButton(props)
{
        return (
                <Button 
                        variant={(props.value === 1) ? 'secondary' : 'warning'} 
                        size="lg" 
                        onClick={(e) => props.applianceStatusUpdate({ applianceId: props.applianceId, newState: (props.value === 1) ? 0 : 1 })}> 
                        {(props.value === 1) ? 'Погасить' : 'Зажечь'}
                </Button>
        );
}
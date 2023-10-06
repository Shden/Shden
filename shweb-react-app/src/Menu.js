import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Menu() {
        return (
                <Navbar expand="lg" className="navbar navbar-expand-lg navbar-dark bg-dark padding-after-32">
                        <Navbar.Brand href="#">Брод</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="me-auto">
                                        <Nav.Link href="/">Состояние дома</Nav.Link>
                                        <NavDropdown title="Климат" id="basic-nav-dropdown">
                                                <NavDropdown.Item href="/Temperature">Температурный график</NavDropdown.Item>
                                                <NavDropdown.Item href="/Humidity">График уровня влажности</NavDropdown.Item>
                                                <NavDropdown.Item href="#ventilation">Вентиляция</NavDropdown.Item>
                                                <NavDropdown.Divider />
                                                <NavDropdown.Item href="/ClimateConfig">Настройки</NavDropdown.Item>
                                        </NavDropdown>
                                        <Nav.Link href="/Lighting">Освещение</Nav.Link>
                                        <Nav.Link href="/Shutters">Роллеты</Nav.Link>
                                        <Nav.Link href="/Relays">Реле</Nav.Link>
                                        <Nav.Link href="#lighting">Ворота</Nav.Link>
                                        <NavDropdown title="Электроэнергия" id="basic-nav-dropdown">
                                                <NavDropdown.Item href="/PowerMeter">Электросчетчик</NavDropdown.Item>
                                                <NavDropdown.Item href="#temperature">Статистика</NavDropdown.Item>
                                                <NavDropdown.Item href="/PowerMonitor">Монитор</NavDropdown.Item>
                                        </NavDropdown>
                                        <NavDropdown title="Полив" id="basic-nav-dropdown">
                                                <NavDropdown.Item href="#schedule">Монитор системы полива</NavDropdown.Item>
                                                <NavDropdown.Item href="https://app.hydrawise.com/config/dashboard">Hydrawise</NavDropdown.Item>
                                        </NavDropdown>
                                        <Nav.Link href="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/API/1.2/status/HouseStatus">House API</Nav.Link>
                                </Nav>
                        </Navbar.Collapse>
                </Navbar>
        );
}

export default Menu;

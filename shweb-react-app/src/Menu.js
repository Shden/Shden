import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Menu() {
        return (
                // <!-- Static navbar -->
                <Navbar className="navbar navbar-expand-lg navbar-dark bg-dark">
                        <Container>
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
                                                <Nav.Link href="#lighting">Освещение</Nav.Link>
                                                <Nav.Link href="#lighting">Роллеты</Nav.Link>
                                                <Nav.Link href="#lighting">Ворота</Nav.Link>
                                                <NavDropdown title="Электроэнергия" id="basic-nav-dropdown">
                                                        <NavDropdown.Item href="#schedule">Электросчетчик</NavDropdown.Item>
                                                        <NavDropdown.Item href="#temperature">Статистика</NavDropdown.Item>
                                                        <NavDropdown.Item href="#humidity">Монитор</NavDropdown.Item>
                                                </NavDropdown>
                                                <NavDropdown title="Полив" id="basic-nav-dropdown">
                                                        <NavDropdown.Item href="#schedule">Монитор системы полива</NavDropdown.Item>
                                                        <NavDropdown.Item href="https://app.hydrawise.com/config/dashboard">Hydrawise</NavDropdown.Item>
                                                </NavDropdown>
                                                <Nav.Link href="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/API/1.2/status/HouseStatus">House API</Nav.Link>
                                        </Nav>
                                </Navbar.Collapse>
                        </Container>
                </Navbar>
        );
}

export default Menu;

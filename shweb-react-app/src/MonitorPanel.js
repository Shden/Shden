import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';

export default function MonitorPanel(props) 
{
        return (
                <Container>
                        <Menu/>
                        <br/>
                        <Container align="center">
                                <div className="embed-responsive">
                                        <iframe 
                                                className="embed-responsive-item" 
                                                width="100%" height="760"
                                                allowFullScreen 
                                                src={props.src}>
                                        </iframe>
                                </div>
                        </Container>
                </Container>
        );
}

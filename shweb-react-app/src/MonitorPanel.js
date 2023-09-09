import React from 'react';
import './shweb.css';
import Menu from './Menu';
import Container from 'react-bootstrap/esm/Container';

export default function MonitorPanel() 
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
                                                src="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/grafana/d/X8fZOHLMk/panel-monitoringa?orgId=1&refresh=1h&from=now-7d&to=now">
                                        </iframe>
                                </div>
                        </Container>
                </Container>
        );
}

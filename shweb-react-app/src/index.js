import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import HouseStatus from './HouseStatus';
import MonitorPanel from './MonitorPanel';
import ClimateConfig from './ClimateConfig';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
        return (
                <BrowserRouter>
                        <Routes>
                                <Route path="/" element={<HouseStatus />}/>
                                <Route path="/MonitorPanel" element={<MonitorPanel src="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/grafana/d/X8fZOHLMk/panel-monitoringa?orgId=1&refresh=1h&from=now-7d&to=now"/>}/>
                                <Route path="/Temperature" element={<MonitorPanel src="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/grafana/d/X8fZOHLMk/panel--monitoringa?orgId=1&refresh=1h&from=now-1d&to=now&viewPanel=2"/>}/>
                                <Route path="/Humidity" element={<MonitorPanel src="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/grafana/d/X8fZOHLMk/panel--monitoringa?orgId=1&refresh=1h&from=now-1d&to=now&viewPanel=10"/>}/>
                                <Route path="/ClimateConfig" element={<ClimateConfig/>}/>
                        </Routes>
                </BrowserRouter>
        );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        <React.StrictMode>
                <App />
        </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

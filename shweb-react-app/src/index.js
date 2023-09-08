import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import HouseStatus from './HouseStatus';
import MonitorPanel from './MonitorPanel';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
        return (
                <BrowserRouter>
                        <Routes>
                                <Route path="/" element={<HouseStatus />}/>
                                <Route path="/MonitorPanel" element={<MonitorPanel/>}/>
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

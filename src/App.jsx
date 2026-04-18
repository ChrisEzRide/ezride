
import { useState } from "react";
import "./App.css";
import Rides from "./Rides";

const areas = [
  "Jeffreys Bay",
  "Port Elizabeth",
  "Despatch",
  "Uitenhage (Kariega)",
  "Humansdorp",
  "Seaview",
  "Kini Bay"
];

function App() {
  const [screen, setScreen] = useState("home");
  const [from, setFrom] = useState("Jeffreys Bay");
  const [to, setTo] = useState("Port Elizabeth");

  if (screen === "rides") {
    return <Rides goBack={() => setScreen("home")} from={from} to={to} />;
  }

  return (
    <div className="container">
      <h1 className="title">EzRide</h1>
      <p className="subtitle">The Commuter Connection</p>

      <div className="card">
        <label className="label">From</label>
        <select className="input" value={from} onChange={e => setFrom(e.target.value)}>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>

        <label className="label">To</label>
        <select className="input" value={to} onChange={e => setTo(e.target.value)}>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>

        <button className="button" onClick={() => setScreen("rides")}>
          Find Your Ride
        </button>
      </div>
    </div>
  );
}

export default App;

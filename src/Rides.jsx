
import { useState, useEffect } from "react";

/**
 * Determine ride type safely.
 * Driver = has seats
 * Passenger = no seats
 */
function getRideType(ride) {
  if (ride.seats && Number(ride.seats) > 0) return "driver";
  return "passenger";
}

/**
 * Build a real Date object safely
 */
function rideDate(ride) {
  return new Date(`${ride.date}T${ride.time}`);
}

export default function Rides({ goBack, from, to }) {
  /* ---------------- STATE ---------------- */

  const [rides, setRides] = useState(() => {
    const saved = localStorage.getItem("ezride_rides");
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState("all");

  const [canPost, setCanPost] = useState(
    localStorage.getItem("ezride_paid") === "true"
  );

  const [form, setForm] = useState({
    role: "passenger",
    date: "",
    time: "",
    seats: "",
    contact: "",
  });

  /* ---------------- PAYFAST RETURN ---------------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      localStorage.setItem("ezride_paid", "true");
      setCanPost(true);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  /* ---------------- PERSIST RIDES ---------------- */

  useEffect(() => {
    localStorage.setItem("ezride_rides", JSON.stringify(rides));
  }, [rides]);

  /* ---------------- PAYFAST LIVE PAYMENT ---------------- */

  function payWithPayFast() {
    const formEl = document.createElement("form");
    formEl.method = "POST";
    formEl.action = "https://www.payfast.co.za/eng/process";

    const fields = {
      merchant_id: "27747245",
      merchant_key: "ql9cksogtrijf",
      amount: "10.00",
      item_name: "EzRide Posting Fee",
      return_url: "https://YOUR-LIVE-DOMAIN/?payment=success",
      cancel_url: "https://YOUR-LIVE-DOMAIN/",
    };

    for (const key in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      formEl.appendChild(input);
    }

    document.body.appendChild(formEl);
    formEl.submit();
  }

  /* ---------------- ADD RIDE ---------------- */

  function addRide(e) {
    e.preventDefault();
    if (!canPost) return;
    if (!form.date || !form.time || !form.contact) return;

    setRides([
      ...rides,
      {
        date: form.date,
        time: form.time,
        seats: form.role === "driver" ? Number(form.seats) : undefined,
        contact: form.contact,
      },
    ]);

    setForm({
      role: "passenger",
      date: "",
      time: "",
      seats: "",
      contact: "",
    });
  }

  /* ---------------- FILTERING ---------------- */

  const visibleRides = rides
    .filter((r) => rideDate(r) >= new Date())
    .filter((r) => {
      const role = getRideType(r);
      return filter === "all" || role === filter;
    })
    .sort((a, b) => rideDate(a) - rideDate(b));

  /* ---------------- RENDER ---------------- */

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 40, color: "white" }}>
      <h1 style={{ textAlign: "center" }}>Available Rides</h1>
      <p style={{ textAlign: "center" }}>
        {from} → {to}
      </p>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <button onClick={goBack}>← Back to Search</button>
      </div>

      <div
        style={{
          fontSize: 12,
          opacity: 0.7,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Disclaimer: EzRide is an informal lift‑sharing noticeboard.
        Users arrange rides at their own risk.
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <label>Show </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="driver">Drivers</option>
          <option value="passenger">Passengers</option>
        </select>
      </div>

      <h2 style={{ textAlign: "center" }}>Post a Ride</h2>

      {!canPost && (
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <p>Posting costs R10 to prevent spam.</p>
          <button onClick={payWithPayFast}>Pay R10 to Post</button>
        </div>
      )}

      {canPost && (
        <form onSubmit={addRide}>
          <label>What are you posting?</label>
          <select
            style={{ width: "100%", marginBottom: 16 }}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="passenger">I need a lift</option>
            <option value="driver">I can offer a lift</option>
          </select>

          <label>Date</label>
          <input
            type="date"
            style={{ width: "100%", marginBottom: 16 }}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <label>Time</label>
          <input
            type="time"
            style={{ width: "100%", marginBottom: 16 }}
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          {form.role === "driver" && (
            <>
              <label>Seats available</label>
              <input
                type="number"
                min="1"
                style={{ width: "100%", marginBottom: 16 }}
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
              />
            </>
          )}

          <label>Contact</label>
          <input
            type="text"
            style={{ width: "100%", marginBottom: 20 }}
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />

          <button style={{ width: "100%" }}>Add Ride</button>
        </form>
      )}

      {visibleRides.length === 0 && (
        <p style={{ textAlign: "center", marginTop: 30, opacity: 0.6 }}>
          No upcoming rides for this route yet.
        </p>
      )}

      {visibleRides.map((r, i) => {
        const role = getRideType(r);
        return (
          <div
            key={i}
            style={{
              marginTop: 24,
              padding: 16,
              background: "#1f1f1f",
              borderRadius: 10,
            }}
          >
            <p>
              <strong>
                {role === "driver" ? "Driver" : "Passenger"} — {from} → {to}
              </strong>
            </p>
            <p>
              {rideDate(r).toLocaleDateString("en-ZA", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}{" "}
              at {r.time}
            </p>
            {role === "driver" && <p>Seats: {r.seats}</p>}
            <p>Contact: {r.contact}</p>
          </div>
        );
      })}
    </div>
  );
}

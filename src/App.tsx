import React from "react";
import { useLocation } from "react-router";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

const Peer: React.FC = () => {
  const location = useLocation();
  const [offer, setOffer] = React.useState<string | null>(null);
  const [answer, setAnswer] = React.useState<string | null>(null);
  console.log({ location, offer });
  const initiator = location.pathname.includes("initiate");
  const [p] = React.useState(
    // @ts-ignore
    new SimplePeer({
      initiator,
      trickle: false,
    })
  );

  React.useEffect(() => {
    console.log(location.search);
    if (location.search && location.search.includes("?offer=")) {
      const offerB64 = location.search.replace("?offer=", "");
      const receivedOffer = JSON.parse(atob(offerB64));
      console.log({ receivedOffer });
      p.signal(receivedOffer);
      return;
    }
    if (location.search && location.search.includes("?answer=")) {
      const offerB64 = location.search.replace("?answer=", "");
      const receivedOffer = JSON.parse(atob(offerB64));
      console.log({ receivedOffer });
      p.signal(receivedOffer);
      return;
    }
  }, [location.search, p]);

  React.useEffect(() => {
    p.on("error", (err) => console.log("error", err));

    p.on("signal", (data) => {
      console.log({ data });
      if (data.type === "answer") {
        setAnswer(data);
        return;
      }
      if (data.type === "offer") {
        setOffer(data);
        return;
      }
    });

    p.on("connect", () => {
      console.log("CONNECT");
      p.send("whatever" + Math.random());
    });

    p.on("data", (data) => {
      console.log("data: " + data);
    });
  }, [p]);

  const handleChange = ({ target: { value } }) => {
    const answer = JSON.parse(atob(value));
    console.log({ answer });
    p.signal(answer);
  };

  return (
    <div>
      <h1>{initiator ? "initiator" : "peer"}</h1>
      <pre>{JSON.stringify(offer, null, 2)}</pre>
      {offer ? (
        <a href={`/peer?offer=${btoa(JSON.stringify(offer))}`} target="_blank" rel="noreferrer">
          <button>Open peer with offer</button>
        </a>
      ) : (
        <a href="/peer" target="_blank">
          <button>Open peer in new tab</button>
        </a>
      )}
      {answer ? <textarea>{btoa(JSON.stringify(answer))}</textarea> : <h2>hmmm</h2>}
      {initiator && <textarea onChange={handleChange} placeholder="paste answer from peer here"></textarea>}
    </div>
  );
};

function App() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("initiate");
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/initiate" element={<Peer />} />
        <Route path="/peer" element={<Peer />} />
        <Route
          index
          element={
            <>
              <button onClick={() => navigate("/initiate")}>Connect As Initiator</button>
              <button onClick={() => navigate("/peer")}>Connect As Peer</button>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Squad from "./pages/Squad";
import Stub from "./pages/Stub";
import AuthPage from "./pages/AuthPage";
import Builder from "./pages/Builder";
import MyLineups from "./pages/MyLineUps";


export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
<Route path="/matches" element={<Matches />} />
<Route path="/squad" element={<Squad />} />
<Route path="/tribune" element={<Stub title="Tribune" />} />
<Route path="/shop" element={<Stub title="Shop" />} />
<Route path="/login" element={<AuthPage />} />
<Route path="/builder" element={<Builder />} />
<Route path="/my-lineups" element={<MyLineups />} />
        </Routes>
      </div>
    </>
  );
}
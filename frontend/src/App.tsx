import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Squad from "./pages/Squad";
import Builder from "./pages/Builder";
import MyLineups from "./pages/MyLineups";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import AuthPage from "./pages/AuthPage";
import Stub from "./pages/Stub";
import Tribune from "./pages/Tribune"; 
export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/my-lineups" element={<MyLineups />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/tribune" element={<Tribune />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      </div>
    </>
  );
}
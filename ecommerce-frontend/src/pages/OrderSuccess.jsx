import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🎉 Order Placed Successfully!</h1>
      <Link to="/user">Go to Home</Link>
    </div>
  );
}

export default OrderSuccess;

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// LOGIN
export const loginUser = async (data) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

// REGISTER
export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const verifyEmail = async (token) => {
  const res = await fetch(`${API_BASE}/api/auth/verify/${token}`);
  return res.json();
};

export const resendVerificationEmail = async (email) => {
  const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

// GET PRODUCTS
export const getProducts = async () => {
  const res = await fetch(`${API_BASE}/api/products`);
  return res.json();
};

// PLACE ORDER
export const placeOrder = async (products, token) => {
  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ products, totalAmount }),
  });

  return res.json();
};

// GET ORDERS
export const getMyOrders = async (token) => {
  const res = await fetch(`${API_BASE}/api/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

// ADMIN ORDERS
export const getAllOrders = async (token) => {
  const res = await fetch(`${API_BASE}/api/orders/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

// ORDER STATUS
export const updateOrderStatus = async (id, status, token) => {
  await fetch(`${API_BASE}/api/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
};

export const deleteOrder = async (id, token) => {
  await fetch(`${API_BASE}/api/orders/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ADMIN ORDERS
export const deleteProduct = async (id, token) => {
  await fetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addProduct = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProduct = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed (${res.status}): ${text.slice(0, 120)}`);
  }
  return res.json();
};


export const forgotPassword = async (email) => {
  const res = await fetch(`${API_BASE}/api/auth/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPassword = async (token, password) => {
  const res = await fetch(`${API_BASE}/api/auth/reset/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.json();
};

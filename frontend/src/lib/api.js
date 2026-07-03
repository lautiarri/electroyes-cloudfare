import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ey_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  // Products
  listProducts: () => client.get("/products").then((r) => r.data),
  getProduct: (code) => client.get(`/products/${code}`).then((r) => r.data),
  createProduct: (payload) => client.post("/products", payload).then((r) => r.data),
  updateProduct: (id, payload) => client.put(`/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id) => client.delete(`/products/${id}`).then((r) => r.data),

  // Orders
  createOrder: (payload) => client.post("/orders", payload).then((r) => r.data),
  listOrders: () => client.get("/orders").then((r) => r.data),

  // Auth
  adminLogin: (username, password) =>
    client.post("/auth/admin/login", { username, password }).then((r) => r.data),
  adminMe: () => client.get("/auth/admin/me").then((r) => r.data),
};

export default api;

const axios = require("axios");

const BUBBLE_BASE_URL = process.env.BUBBLE_BASE_URL;
const BUBBLE_API_TOKEN = process.env.BUBBLE_API_TOKEN;

if (!BUBBLE_BASE_URL) {
  throw new Error("Missing BUBBLE_BASE_URL in .env");
}

if (!BUBBLE_API_TOKEN) {
  throw new Error("Missing BUBBLE_API_TOKEN in .env");
}

const bubbleClient = axios.create({
  baseURL: BUBBLE_BASE_URL,
  headers: {
    Authorization: `Bearer ${BUBBLE_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function bubbleList(endpoint, constraints = []) {
  const params = {};

  if (constraints.length > 0) {
    params.constraints = JSON.stringify(constraints);
  }

  const response = await bubbleClient.get(`/${endpoint}`, { params });

  return response.data?.response?.results || [];
}

async function bubbleGetById(endpoint, id) {
  const response = await bubbleClient.get(`/${endpoint}/${id}`);
  return response.data?.response || response.data;
}

async function bubbleCreate(endpoint, payload) {
  const response = await bubbleClient.post(`/${endpoint}`, payload);
  return response.data?.response || response.data;
}

async function bubbleUpdate(endpoint, id, payload) {
  const response = await bubbleClient.patch(`/${endpoint}/${id}`, payload);
  return response.data?.response || response.data;
}

async function bubbleDelete(endpoint, id) {
  const response = await bubbleClient.delete(`/${endpoint}/${id}`);
  return response.data?.response || response.data;
}

module.exports = {
  bubbleList,
  bubbleGetById,
  bubbleCreate,
  bubbleUpdate,
  bubbleDelete,
};
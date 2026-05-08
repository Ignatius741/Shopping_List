const API_BASE = '/api';

async function apiRequest(endpoint, method, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
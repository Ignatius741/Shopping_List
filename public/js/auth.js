let currentUser = null;

async function register(username, password) {
  console.log('Attempting to register:', username);
  const data = await apiRequest('/auth/register', 'POST', { username, password });
  console.log('Registration response:', data);
  return data;
}

async function login(username, password) {
  console.log('Attempting to login:', username);
  const data = await apiRequest('/auth/login', 'POST', { username, password });
  console.log('Login response:', data);
  currentUser = {
    id: data.userId,
    username: data.username,
    token: data.token
  };
  localStorage.setItem('shopping_auth', JSON.stringify({
    token: data.token,
    userId: data.userId,
    username: data.username
  }));
  return currentUser;
}

async function logout() {
  currentUser = null;
  localStorage.removeItem('shopping_auth');
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function tryAutoLogin() {
  const saved = localStorage.getItem('shopping_auth');
  if (saved) {
    try {
      const { token, userId, username } = JSON.parse(saved);
      const verification = await verifyToken(token);
      if (verification && verification.valid) {
        currentUser = { id: userId, username, token };
        return true;
      }
    } catch(e) {
      console.error('Auto login failed:', e);
      localStorage.removeItem('shopping_auth');
    }
  }
  return false;
}
let currentPage = 'list'; // 'list' or 'add'

async function renderDashboard() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="app-container">
      <div class="header">
        <div class="logo-area">
          <h1>My Shopping List</h1>
          <p>List and Go!</p>
        </div>
        <div class="user-area">
          <div class="greeting">Welcome, ${escapeHtml(currentUser.username)}!</div>
          <button id="logoutButton" class="logout-btn">Logout</button>
        </div>
      </div>
      
      ${currentPage === 'list' ? `
        <div class="nav-header">
          <div class="page-title">My Items</div>
          <button id="addShortcutBtn" class="add-shortcut">+</button>
        </div>
        
        <div class="tabs">
          <button data-tab="all" class="tab ${currentTab === 'all' ? 'active' : ''}">All</button>
          <button data-tab="active" class="tab ${currentTab === 'active' ? 'active' : ''}">Active</button>
          <button data-tab="purchased" class="tab ${currentTab === 'purchased' ? 'active' : ''}">Purchased</button>
        </div>
        
        <div id="itemsContainer" class="items-list"></div>
      ` : `
        <div class="add-item-page">
          <div class="add-item-card">
            <h2>➕ Add New Item</h2>
            <div class="form-group">
              <label>Item Name *</label>
              <input type="text" id="itemNameInput" placeholder="e.g., Organic Milk" />
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input type="text" id="itemQuantityInput" placeholder="1, 2 pcs, 500g" value="1" />
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="itemCategorySelect">
                <option>Groceries</option>
                <option>Electronics</option>
                <option>Home</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </div>
            <button id="saveItemBtn" class="save-item-btn">Save Item</button>
            <button id="backToListBtn" class="back-btn">← Back to List</button>
          </div>
        </div>
      `}
      
      <footer>⚡ your items are synced</footer>
    </div>
  `;
  
  if (currentPage === 'list') {
    // List page event listeners
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentTab = btn.dataset.tab;
        renderDashboard();
      });
    });
    
    document.getElementById('addShortcutBtn').addEventListener('click', () => {
      currentPage = 'add';
      renderDashboard();
    });
    
    await loadShoppingItems();
  } else {
    // Add page event listeners
    document.getElementById('saveItemBtn').addEventListener('click', async () => {
      const name = document.getElementById('itemNameInput').value.trim();
      const quantity = document.getElementById('itemQuantityInput').value.trim();
      const category = document.getElementById('itemCategorySelect').value;
      
      if (!name) {
        showToast('Item name is required!', true);
        return;
      }
      
      try {
        await addItem(name, quantity, category);
        showToast('Item added successfully!');
        currentPage = 'list';
        renderDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    });
    
    document.getElementById('backToListBtn').addEventListener('click', () => {
      currentPage = 'list';
      renderDashboard();
    });
  }
  
  // Logout button (always present)
  document.getElementById('logoutButton').addEventListener('click', async () => {
    await logout();
    renderAuthScreen();
  });
}

function renderAuthScreen() {
  const root = document.getElementById('root');
  
  // Set auth background
  document.body.className = 'auth-bg';
  
  root.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-card" id="authCard">
        <div class="auth-title" id="authTitle">Login</div>
        <div id="authForm">
          <div class="auth-input"><input type="text" id="loginUsername" placeholder="Username" /></div>
          <div class="auth-input"><input type="password" id="loginPassword" placeholder="Password" /></div>
          <button id="submitAuthBtn" class="auth-btn">Login</button>
        </div>
        <div class="switch-auth">Don't have an account? <span id="toggleAuthMode">Sign up</span></div>
        <div id="authError" class="error-msg"></div>
      </div>
    </div>
  `;
  
  let isLogin = true;
  
  const toggle = document.getElementById('toggleAuthMode');
  const authTitle = document.getElementById('authTitle');
  const authFormDiv = document.getElementById('authForm');
  const errorDiv = document.getElementById('authError');
  
  function refreshForm() {
    if (isLogin) {
      authTitle.textContent = 'Login';
      authFormDiv.innerHTML = `
        <div class="auth-input"><input type="text" id="loginUsername" placeholder="Username" /></div>
        <div class="auth-input"><input type="password" id="loginPassword" placeholder="Password" /></div>
        <button id="submitAuthBtn" class="auth-btn">Login</button>
      `;
      toggle.textContent = 'Sign up';
    } else {
      authTitle.textContent = 'Create Account';
      authFormDiv.innerHTML = `
        <div class="auth-input"><input type="text" id="signupUsername" placeholder="Username" /></div>
        <div class="auth-input"><input type="password" id="signupPassword" placeholder="Password" /></div>
        <div class="auth-input"><input type="password" id="signupConfirm" placeholder="Confirm password" /></div>
        <button id="submitAuthBtn" class="auth-btn">Create Account</button>
      `;
      toggle.textContent = 'Back to Login';
    }
    
    const newSubmitBtn = document.getElementById('submitAuthBtn');
    if (newSubmitBtn) {
      newSubmitBtn.addEventListener('click', handleAuthSubmit);
    }
    
    errorDiv.textContent = '';
  }
  
  async function handleAuthSubmit() {
    errorDiv.textContent = '';
    try {
      if (isLogin) {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!username || !password) throw new Error('Username and password required');
        await login(username, password);
        document.body.className = 'dashboard-bg';
        await renderDashboard();
      } else {
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        if (!username || !password) throw new Error('All fields required');
        if (password !== confirm) throw new Error('Passwords do not match');
        if (password.length < 4) throw new Error('Password must be at least 4 characters');
        await register(username, password);
        showToast('Account created! Please login.');
        isLogin = true;
        refreshForm();
      }
    } catch (err) {
      errorDiv.textContent = err.message;
    }
  }
  
  const submitBtn = document.getElementById('submitAuthBtn');
  submitBtn.addEventListener('click', handleAuthSubmit);
  toggle.addEventListener('click', () => {
    isLogin = !isLogin;
    refreshForm();
  });
}

async function init() {
  const autoLogged = await tryAutoLogin();
  if (autoLogged) {
    document.body.className = 'dashboard-bg';
    await renderDashboard();
  } else {
    document.body.className = 'auth-bg';
    renderAuthScreen();
  }
}

// Start the app
init();
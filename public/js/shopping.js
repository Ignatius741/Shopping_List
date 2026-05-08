let shoppingItems = [];
let currentTab = 'all';

async function loadShoppingItems() {
  if (!currentUser) return [];
  try {
    const items = await apiRequest('/items', 'GET', null, currentUser.token);
    shoppingItems = items;
    renderShoppingList();
    return items;
  } catch (err) {
    showToast('Error loading items: ' + err.message, true);
    return [];
  }
}

async function addItem(name, quantity, category) {
  if (!name || name.trim() === '') {
    throw new Error('Item name is required');
  }
  
  const newItem = await apiRequest('/items', 'POST', {
    name: name.trim(),
    quantity: quantity || '1',
    category: category || 'General'
  }, currentUser.token);
  
  await loadShoppingItems();
  return newItem;
}

async function markAsPurchased(itemId) {
  await apiRequest(`/items/${itemId}`, 'PATCH', { purchased: true }, currentUser.token);
  await loadShoppingItems();
}

async function deleteItem(itemId) {
  await apiRequest(`/items/${itemId}`, 'DELETE', null, currentUser.token);
  await loadShoppingItems();
}

function renderShoppingList() {
  const container = document.getElementById('itemsContainer');
  if (!container) return;
  
  let filtered = [...shoppingItems];
  if (currentTab === 'active') filtered = filtered.filter(i => !i.purchased);
  else if (currentTab === 'purchased') filtered = filtered.filter(i => i.purchased);
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">✨ No items here. Tap "Add New Item" ✨</div>';
    return;
  }
  
  container.innerHTML = filtered.map(item => `
    <div class="list-item" data-id="${item.id}">
      <div class="item-info">
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-meta">
          <span>📦 ${escapeHtml(item.quantity)}</span>
          <span class="badge-cat">🏷️ ${escapeHtml(item.category)}</span>
        </div>
      </div>
      <div class="item-actions">
        ${!item.purchased ? 
          `<button class="purchase-btn" data-id="${item.id}">✔ Buy</button>` : 
          `<span class="purchased-status">✅ Purchased</span>`
        }
        <button class="delete-btn" data-id="${item.id}">🗑️</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.purchase-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(btn.dataset.id);
      await markAsPurchased(id);
      showToast('Marked as purchased!');
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Delete this item?')) {
        await deleteItem(id);
        showToast('Item deleted');
      }
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function showToast(msg, isError = false) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#ef4444' : '#10b981'};
    color: white;
    padding: 10px 20px;
    border-radius: 60px;
    font-weight: 500;
    z-index: 2000;
    font-size: 0.8rem;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function showToast(msg, isError = false) {

  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.className = 'custom-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#ef4444' : '#10b981'};
    color: white;
    padding: 12px 24px;
    border-radius: 60px;
    font-weight: 500;
    z-index: 2000;
    font-size: 0.85rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Check authentication status with server
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/check-auth', { credentials: 'same-origin' });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { authenticated: false };
  }
}

// Update navigation icons based on login status
function updateNavIcons(isLoggedIn, userName = '', role = 'user') {
  const navIcons = document.querySelector('.nav__icons');
  if (!navIcons) return;

  // Remove previous logout button if any
  const oldLogout = document.getElementById('logout-btn');
  if (oldLogout) oldLogout.remove();

  // Handle username label
  let userNameEl = document.getElementById('user-name');
  if (!userNameEl) {
    userNameEl = document.createElement('span');
    userNameEl.id = 'user-name';
    userNameEl.className = 'user-name';
    // Insert before the first icon so it sits to the left
    navIcons.insertBefore(userNameEl, navIcons.firstChild);
  }

  // Find login link
  const loginLink = document.getElementById('login-btn')
    || navIcons.querySelector('.icon__item[href="/login/"]')
    || navIcons.querySelector('a.icon__item[href$="/login/"]');

  // Always set login link with next param to return to the same page after login
  if (loginLink) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    loginLink.href = `/login/?next=${next}`;
  }

  if (isLoggedIn) {
    // Hide login button
    if (loginLink) loginLink.style.display = 'none';

    // Show username
    userNameEl.textContent = userName ? `Hi, ${userName}` : 'Hi';
    userNameEl.style.display = 'inline-flex';

    // Add logout button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = "#";
    logoutBtn.className = "logout-btn";
    logoutBtn.id = "logout-btn";
    logoutBtn.innerHTML = `
      <svg class="icon__logout" width="16" height="16"><use xlink:href="/static/images/sprite.svg#icon-exit"></use></svg>
      Logout
    `;
    navIcons.appendChild(logoutBtn);
    
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
      }
    });

    // Add Admin link if role is admin
    if (role === 'admin' && !document.getElementById('admin-link')) {
      const adminLink = document.createElement('a');
      adminLink.id = 'admin-link';
      adminLink.href = '/admin/';
      adminLink.className = 'icon__item icon__item--admin';
      adminLink.title = 'Admin';
      adminLink.setAttribute('aria-label', 'Admin');
      adminLink.innerHTML = `
        <img src="/static/images/maintenance.jpg" alt="Admin" class="icon__admin-img" />
      `;
      // Place admin link before logout for convenience
      navIcons.insertBefore(adminLink, logoutBtn);
    }
  } else {
    // Show login button
    if (loginLink) loginLink.style.display = '';
    // Hide username
    if (userNameEl) userNameEl.style.display = 'none';
    // Remove admin link if present
    const adminLink = document.getElementById('admin-link');
    if (adminLink) adminLink.remove();
  }
}

// Update UI based on authentication status
async function updateAuthUI() {
  const authStatus = await checkAuthStatus();
  const loginRegisterLinks = document.getElementById('loginRegisterLinks');
  const loggedInLinks = document.getElementById('loggedInLinks');
  const welcomeMessage = document.getElementById('welcomeMessage');

  if (authStatus.authenticated) {
    // User is logged in
    if (loginRegisterLinks) loginRegisterLinks.style.display = 'none';
    if (loggedInLinks) loggedInLinks.style.display = 'flex';
    if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${authStatus.name}`;
    
    // Update nav icons
    updateNavIcons(true, authStatus.name, authStatus.role || 'user');
  } else {
    // User is logged out
    if (loginRegisterLinks) loginRegisterLinks.style.display = 'flex';
    if (loggedInLinks) loggedInLinks.style.display = 'none';
    if (welcomeMessage) welcomeMessage.textContent = '';
    
    // Update nav icons
    updateNavIcons(false, '', 'user');
  }
}

// Protect authenticated routes
async function protectAuthenticatedRoutes() {
  const authStatus = await checkAuthStatus();
  const protectedRoutes = ['/cart/', '/product/', '/orders/', '/user-dashboard/']; // Add your protected routes here
  
  const currentPath = window.location.pathname;
  
  if (protectedRoutes.includes(currentPath) && !authStatus.authenticated) {
    window.location.href = '/login/';
    return false;
  }
  
  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Update auth UI on page load
  await updateAuthUI();
  
  // Protect routes if needed
  await protectAuthenticatedRoutes();

  // Handle logout button if it exists in the template
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
      }
    });
  }
});

// Export functions for use in other modules (if needed)
window.authUtils = {
  checkAuthStatus,
  updateAuthUI,
  protectAuthenticatedRoutes
};
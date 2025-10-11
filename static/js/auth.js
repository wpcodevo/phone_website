// Helper for API requests
async function api(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    credentials: "same-origin", // ensure cookies (session) are sent/received
    body: JSON.stringify(data)
  });
  let responseData;
  try {
    responseData = await res.json();
  } catch {
    responseData = {success: false, message: "Invalid server response."};
  }
  if (!res.ok) {
    responseData.success = false;
    responseData.message = responseData.message || "Server error";
  }
  return responseData;
}

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
    updateNavIcons(true, authStatus.name);
  } else {
    // User is logged out
    if (loginRegisterLinks) loginRegisterLinks.style.display = 'flex';
    if (loggedInLinks) loggedInLinks.style.display = 'none';
    
    // Update nav icons
    updateNavIcons(false);
  }
}

// Update navigation icons based on login status
function updateNavIcons(isLoggedIn, userName = '') {
  const navIcons = document.querySelector('.nav__icons');
  if (!navIcons) return;

  // Remove previous logout button if any
  const oldLogout = document.getElementById('logout-btn');
  if (oldLogout) oldLogout.remove();

  // Find login link
  const loginLink = navIcons.querySelector('.icon__item[href="/login/"]');

  if (isLoggedIn) {
    // Hide login button
    if (loginLink) loginLink.style.display = 'none';

    // Add logout button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = "#";
    logoutBtn.className = "icon__item logout-btn";
    logoutBtn.id = "logout-btn";
    logoutBtn.innerHTML = `
      <svg class="icon__logout" width="16" height="16"><use xlink:href="./static/images/sprite.svg#icon-exit"></use></svg>
      Logout
    `;
    navIcons.appendChild(logoutBtn);
    
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
      }
    });
  } else {
    // Show login button
    if (loginLink) loginLink.style.display = '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize auth UI
  updateAuthUI();

  // Tab Switching Logic
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const otpVerifyForm = document.getElementById('otpVerifyForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const backToLoginLink = document.getElementById('backToLoginLink');
  const loginTabLink = document.getElementById('loginTabLink');
  const backToLoginFromResetLink = document.getElementById('backToLoginFromResetLink');
  const otpBackToLoginLink = document.getElementById('otpBackToLoginLink');
  const resendOtpLink = document.getElementById('resendOtpLink');
  const otpCountdownEl = document.getElementById('otpCountdown');

  let otpTimer = null;
  let otpTimeLeft = 60; // seconds (extended from 30)
  let currentOtpEmail = null;

  function showForm(formToShow) {
    [loginForm, registerForm, forgotPasswordForm, resetPasswordForm, otpVerifyForm].forEach(form => {
      if (form) form.classList.remove('active');
    });
    if (formToShow) formToShow.classList.add('active');
  }

  function activateTab(tabToActivate) {
    [loginTab, registerTab].forEach(tab => { if (tab) tab.classList.remove('active'); });
    if (tabToActivate) tabToActivate.classList.add('active');
  }

  // Tab click listeners (restored)
  if (loginTab) {
    loginTab.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(loginForm);
      activateTab(loginTab);
    });
  }
  if (registerTab) {
    registerTab.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(registerForm);
      activateTab(registerTab);
    });
  }
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(forgotPasswordForm);
      activateTab(null); // no tab highlighted
    });
  }
  if (loginTabLink) {
    loginTabLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(loginForm);
      activateTab(loginTab);
    });
  }
  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(loginForm);
      activateTab(loginTab);
    });
  }
  if (backToLoginFromResetLink) {
    backToLoginFromResetLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(loginForm);
      activateTab(loginTab);
    });
  }

  function startOtpCountdown() {
    if (resendOtpLink) {
      resendOtpLink.style.opacity = '0.5';
      resendOtpLink.style.pointerEvents = 'none';
    }
    otpTimeLeft = 60; // reset to 60s now
    updateOtpCountdownDisplay();
    if (otpTimer) clearInterval(otpTimer);
    otpTimer = setInterval(() => {
      otpTimeLeft--;
      updateOtpCountdownDisplay();
      if (otpTimeLeft <= 0) {
        clearInterval(otpTimer);
        if (otpCountdownEl) otpCountdownEl.textContent = 'You can resend the code now';
        if (resendOtpLink) {
          resendOtpLink.style.opacity = '1';
          resendOtpLink.style.pointerEvents = 'auto';
        }
      }
    }, 1000);
  }

  function updateOtpCountdownDisplay() {
    if (otpCountdownEl) {
      otpCountdownEl.textContent = `Resend available in ${otpTimeLeft}s`;
    }
  }

  if (resendOtpLink) {
    resendOtpLink.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentOtpEmail) return;
      // Only allow if timer finished
      if (otpTimeLeft > 0) return;
      try {
        await api('/api/forgot-password', { email: currentOtpEmail });
        startOtpCountdown();
      } catch (err) {
        console.error('Resend OTP failed', err);
      }
    });
  }

  if (otpBackToLoginLink) {
    otpBackToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(loginForm);
      activateTab(loginTab);
    });
  }

  // Override forgot password submit to go to OTP form first
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = forgotPasswordForm.querySelector('#forgotPasswordEmail').value.trim();
      const errorDiv = document.getElementById('forgotPasswordError');
      const successDiv = document.getElementById('forgotPasswordSuccess');
      const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';
      submitBtn.textContent = 'Sending Code...';
      submitBtn.disabled = true;

      if (!email) {
        errorDiv.textContent = 'Please enter your email.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await api('/api/forgot-password', { email });
        if (response.success) {
          currentOtpEmail = email;
          if (otpVerifyForm) {
            otpVerifyForm.querySelector('#otpEmail').value = email;
            const masked = maskEmail(email);
            const displayEl = document.getElementById('otpEmailDisplay');
            if (displayEl) displayEl.textContent = masked;
            window.lastVerifiedOtpCode = null; // reset previously verified code
            showForm(otpVerifyForm);
            startOtpCountdown();
          }
        } else {
          errorDiv.textContent = response.message || 'Request failed.';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Could not connect to server.';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // OTP verification submit
  if (otpVerifyForm) {
    otpVerifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = otpVerifyForm.querySelector('#otpEmail').value.trim();
      const code = otpVerifyForm.querySelector('#otpCode').value.trim();
      const errorDiv = document.getElementById('otpVerifyError');
      const successDiv = document.getElementById('otpVerifySuccess');
      const submitBtn = otpVerifyForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';
      submitBtn.textContent = 'Verifying...';
      submitBtn.disabled = true;

      if (!email || !code) {
        errorDiv.textContent = 'Please enter the code.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await api('/api/verify-reset-code', { email, code });
        if (response.success) {
          successDiv.textContent = 'Code verified. Continue to reset password.';
          successDiv.style.display = 'block';
          window.lastVerifiedOtpCode = code; // store verified code for final reset
          // Move to reset form shortly
          setTimeout(() => {
            if (resetPasswordForm) {
              resetPasswordForm.querySelector('#resetEmail').value = email;
              showForm(resetPasswordForm);
            }
          }, 800);
        } else {
          errorDiv.textContent = response.message || 'Invalid code.';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Could not connect to server.';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // LOGIN handler (restored)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('#loginEmail').value.trim();
      const password = loginForm.querySelector('#loginPassword').value;
      const errorDiv = document.getElementById('loginError');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      errorDiv.style.display = 'none';
      submitBtn.textContent = 'Logging in...';
      submitBtn.disabled = true;
      if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await api('/api/login', { email, password });
        if (response.success) {
          window.location.href = '/';
        } else {
          errorDiv.textContent = response.message || 'Login failed.';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Could not connect to server.';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // REGISTER handler (restored)
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = registerForm.querySelector('#registerName').value.trim();
      const email = registerForm.querySelector('#registerEmail').value.trim();
      const password = registerForm.querySelector('#registerPassword').value;
      const confirmPassword = registerForm.querySelector('#confirmPassword').value;
      const errorDiv = document.getElementById('registerError');
      const successDiv = document.getElementById('registerSuccess');
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';
      submitBtn.textContent = 'Creating Account...';
      submitBtn.disabled = true;
      if (!name || !email || !password || !confirmPassword) {
        errorDiv.textContent = 'Please fill out all fields.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      if (password.length < 6) {
        errorDiv.textContent = 'Password should be at least 6 characters.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await api('/api/register', { name, email, password });
        if (response.success) {
          successDiv.textContent = response.message || 'Registration successful. You can now log in.';
          successDiv.style.display = 'block';
          registerForm.reset();
          setTimeout(() => { showForm(loginForm); activateTab(loginTab); }, 1500);
        } else {
          errorDiv.textContent = response.message || 'Register failed.';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Could not connect to server.';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Adjust reset password submit to not require code now
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = resetPasswordForm.querySelector('#resetEmail').value.trim();
      // The code has already been verified; pass a placeholder? Better to keep original code? We'll store last entered code.
      const newPassword = resetPasswordForm.querySelector('#resetNewPassword').value;
      const confirmNewPassword = resetPasswordForm.querySelector('#resetConfirmNewPassword').value;
      const errorDiv = document.getElementById('resetPasswordError');
      const successDiv = document.getElementById('resetPasswordSuccess');
      const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';
      submitBtn.textContent = 'Resetting Password...';
      submitBtn.disabled = true;

      if (!email || !newPassword || !confirmNewPassword) {
        errorDiv.textContent = 'Please fill out all fields.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      if (newPassword !== confirmNewPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      if (newPassword.length < 6) {
        errorDiv.textContent = 'Password should be at least 6 characters.';
        errorDiv.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      try {
        // We still need the verified code for backend; store it after verify
        // We'll attach last verified code to a global variable when code verified
        const code = window.lastVerifiedOtpCode;
        if (!code) {
          errorDiv.textContent = 'Session expired. Please request a new code.';
          errorDiv.style.display = 'block';
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          return;
        }
        const response = await api('/api/reset-password', { email, code, newPassword });
        if (response.success) {
          successDiv.textContent = 'Password reset successful! Redirecting to login...';
          successDiv.style.display = 'block';
          // Show popup
          showPasswordResetPopup();
          setTimeout(() => {
            showForm(loginForm);
            activateTab(loginTab);
          }, 2500);
        } else {
          errorDiv.textContent = response.message || 'Reset failed.';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Could not connect to server.';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Store verified code globally when success
  window.lastVerifiedOtpCode = null;
  // Modify otp verify handler to set it (we inserted above, so patch manually if needed)
  // We'll redefine the listener if necessary (already done above).

  function showPasswordResetPopup() {
    let popup = document.getElementById('passwordResetPopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'passwordResetPopup';
      popup.style.position = 'fixed';
      popup.style.top = '20px';
      popup.style.right = '20px';
      popup.style.padding = '1.5rem 2rem';
      popup.style.background = 'var(--green, #28a745)';
      popup.style.color = '#fff';
      popup.style.borderRadius = '6px';
      popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      popup.style.fontSize = '1.4rem';
      popup.style.zIndex = '9999';
      popup.style.opacity = '0';
      popup.style.transition = 'opacity .3s ease';
      popup.innerText = 'Password successfully reset!';
      document.body.appendChild(popup);
      requestAnimationFrame(() => { popup.style.opacity = '1'; });
      setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 400);
      }, 2000);
    }
  }

  function maskEmail(email) {
    if (!email || !email.includes('@')) return email || '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return user[0] + '*@' + domain;
    const visibleStart = user.slice(0, 2);
    const masked = '*'.repeat(Math.max(2, user.length - 2));
    return `${visibleStart}${masked}@${domain}`;
  }

  if (otpVerifyForm) {
    const otpInput = document.getElementById('otpCode');
    if (otpInput) {
      otpInput.addEventListener('input', () => {
        // Strip non-digits and limit length
        let v = otpInput.value.replace(/[^0-9]/g, '').slice(0,6);
        otpInput.value = v;
        if (v.length === 6) {
          otpInput.setCustomValidity('');
        }
      });
      otpInput.addEventListener('invalid', () => {
        if (otpInput.value.length !== 6) {
          otpInput.setCustomValidity('Enter 6 digit code');
        } else {
          otpInput.setCustomValidity('');
        }
      });
    }
  }
});
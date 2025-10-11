/*
=============
Navigation
=============
 */
const navOpen = document.querySelector(".nav__hamburger");
const navClose = document.querySelector(".close__toggle");
const menu = document.querySelector(".nav__menu");
const scrollLink = document.querySelectorAll(".scroll-link");
const navContainer = document.querySelector(".nav__menu");

if (navOpen && menu && navContainer) {
  navOpen.addEventListener("click", () => {
    menu.classList.add("open");
    document.body.classList.add("active");
    navContainer.style.left = "0";
    navContainer.style.width = "30rem";
  });
}

if (navClose && menu && navContainer) {
  navClose.addEventListener("click", () => {
    menu.classList.remove("open");
    document.body.classList.remove("active");
    navContainer.style.left = "-30rem";
    navContainer.style.width = "0";
  });
}

/*
=============
PopUp
=============
 */
const popup = document.querySelector(".popup");
const closePopup = document.querySelector(".popup__close");
const popupForm = document.querySelector(".popup__form");
const subscribeBtn = document.querySelector(".popup__right a");

if (popup && closePopup) {
  // Close popup function
  const hidePopup = () => {
    popup.classList.add("hide__popup");
    localStorage.setItem('popupDismissed', 'true');
    localStorage.setItem('popupDismissedTime', Date.now().toString());
  };

  // Close popup when clicking the X button
  closePopup.addEventListener("click", (e) => {
    e.preventDefault();
    hidePopup();
  });

  // Close popup when clicking outside the content
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      hidePopup();
    }
  });

  // Close popup with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !popup.classList.contains("hide__popup")) {
      hidePopup();
    }
  });

  // Handle subscription form
  if (subscribeBtn && popupForm) {
    subscribeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = popupForm.value.trim();
      
      if (email && isValidEmail(email)) {
        // Show success message
        showPopupMessage("Thank you for subscribing! You'll receive 30% off your next purchase.", "success");
        setTimeout(() => {
          hidePopup();
        }, 2000);
      } else {
        showPopupMessage("Please enter a valid email address.", "error");
      }
    });
  }

  // Show popup with conditions
  window.addEventListener("load", () => {
    const lastDismissed = localStorage.getItem('popupDismissedTime');
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Don't show if dismissed within last 24 hours
    if (lastDismissed && (Date.now() - parseInt(lastDismissed)) < twentyFourHours) {
      return;
    }

    // Show popup after 3 seconds
    setTimeout(() => {
      popup.classList.remove("hide__popup");
      // Focus trap for accessibility
      popup.setAttribute('aria-hidden', 'false');
      closePopup.focus();
    }, 3000);
  });

  // Helper functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showPopupMessage(message, type) {
    const existingMessage = popup.querySelector('.popup-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `popup-message popup-message--${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10001;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideInDown 0.3s ease;
    `;

    popup.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }
}

/*
=============
Fixed Navigation
=============
 */

const navBar = document.querySelector(".navigation");
const gotoTop = document.querySelector(".goto-top");

// Smooth Scroll
Array.from(scrollLink).map(link => {
  link.addEventListener("click", e => {
    // Prevent Default
    e.preventDefault();

    const id = e.currentTarget.getAttribute("href").slice(1);
    const element = document.getElementById(id);
    const navHeight = navBar.getBoundingClientRect().height;
    const fixNav = navBar.classList.contains("fix__nav");
    let position = element.offsetTop - navHeight;

    if (!fixNav) {
      position = position - navHeight;
    }

    window.scrollTo({
      left: 0,
      top: position,
    });
    navContainer.style.left = "-30rem";
    document.body.classList.remove("active");
  });
});

// Fix NavBar

window.addEventListener("scroll", e => {
  const scrollHeight = window.pageYOffset;
  const navHeight = navBar.getBoundingClientRect().height;
  if (scrollHeight > navHeight) {
    navBar.classList.add("fix__nav");
  } else {
    navBar.classList.remove("fix__nav");
  }

  if (gotoTop) {
    if (scrollHeight > 300) {
      gotoTop.classList.add("show-top");
    } else {
      gotoTop.classList.remove("show-top");
    }
  }
});

// Safe element queries
let login = document.querySelector('.login-form');
let shoppingCart = document.querySelector('.shopping-cart');

const loginBtn = document.querySelector('#login-btn');
const cartBtn = document.querySelector('#cart-btn');

if (loginBtn) {
  loginBtn.onclick = () => {
    if (login) login.classList.toggle('active');
    if (shoppingCart) shoppingCart.classList.remove('active');
  };
}

if (cartBtn) {
  // Remove toggle behavior: clicking the cart button should navigate to /cart/ (its anchor href)
  // If you want a small inline cart in the future, re-enable toggle here.
}

// Updated Chatbot logic
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const windowEl = document.getElementById('chatbot-window');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'chatbot-message ' + sender;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendLoading() {
    const loading = document.createElement('div');
    loading.className = 'chatbot-message bot';
    loading.id = 'chatbot-loading';
    loading.innerHTML = '<span style="opacity:0.7;">...</span>';
    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeLoading() {
    const loading = document.getElementById('chatbot-loading');
    if (loading) loading.remove();
  }

  // Function to send message to backend API
  async function sendMessageToAPI(text) {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to API:', error);
      return "Sorry, I couldn't connect to the server. Please try again later.";
    }
  }

  if (toggleBtn && closeBtn && windowEl && form && input && messages) {
    // Toggle open/close using floating action button
    toggleBtn.addEventListener('click', function() {
      const wasHidden = windowEl.classList.contains('chatbot-hide');
      windowEl.classList.toggle('chatbot-hide');
      // restore from minimized if necessary
      windowEl.classList.remove('chatbot-minimized');
      if (!windowEl.classList.contains('chatbot-hide')) {
        setTimeout(() => input.focus(), 200);
      }
      // update aria-expanded
      toggleBtn.setAttribute('aria-expanded', String(!wasHidden));
    });

    closeBtn.addEventListener('click', function() {
      windowEl.classList.add('chatbot-hide');
      try { windowEl.setAttribute('aria-hidden', 'true'); } catch (e) {}
      // ensure toggle stays visible
      const tb = document.querySelector('.chatbot-toggle-btn');
      if (tb) tb.style.right = '20px';
      toggleBtn.focus();
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // Minimize button (in new markup)
    const minimizeBtn = document.getElementById('chatbot-minimize');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', function() {
        // toggle minimized look but keep widget visible
        windowEl.classList.toggle('chatbot-minimized');
        // move focus to toggle so keyboard users can restore
        toggleBtn.focus();
        // ensure toggle remains visible (reset position)
        const tb = document.querySelector('.chatbot-toggle-btn');
        if (tb) tb.style.right = '20px';
      });
    }

    // Attach button/file input handling
    const attachBtn = document.getElementById('chatbot-attach-btn');
    const attachInput = document.getElementById('chatbot-attach');
    const attachList = document.getElementById('chatbot-attachments');
    let pendingAttachments = [];

    if (attachBtn && attachInput && attachList) {
      attachBtn.addEventListener('click', () => attachInput.click());

      attachInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
          // create a small preview chip
          const id = Date.now() + Math.random().toString(36).slice(2,7);
          pendingAttachments.push({ id, file });

          const chip = document.createElement('span');
          chip.className = 'attachment';
          chip.dataset.attId = id;
          chip.innerHTML = `📎 ${file.name} <button type="button" aria-label="Remove attachment">✕</button>`;
          attachList.appendChild(chip);

          const removeBtn = chip.querySelector('button');
          removeBtn.addEventListener('click', () => {
            pendingAttachments = pendingAttachments.filter(a => a.id !== id);
            chip.remove();
            // clear file input if no pending attachments
            if (pendingAttachments.length === 0) attachInput.value = '';
          });
        });
      });
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const text = input.value.trim();
      if (!text && pendingAttachments.length === 0) return;

      // Show user message (text and attachments summary)
      let userText = text || '';
      if (pendingAttachments.length) {
        const names = pendingAttachments.map(a => a.file.name).join(', ');
        userText = userText ? `${userText} \n(Attachments: ${names})` : `(Attachments: ${names})`;
      }

      appendMessage(userText, 'user');
      input.value = '';
      // clear attachment UI
      attachList.innerHTML = '';
      attachInput.value = '';
      const attachmentsToSend = pendingAttachments.slice();
      pendingAttachments = [];

      appendLoading();

      try {
        // Basic payload: message + filenames. If you want to actually upload files,
        // switch to multipart/form-data and send files to an upload endpoint.
        const payload = { message: text, attachments: attachmentsToSend.map(a => a.file.name) };
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        removeLoading();
        if (response.ok) {
          const data = await response.json();
          appendMessage(data.response || 'No reply', 'bot');
        } else {
          appendMessage("Sorry, I'm having trouble connecting right now.", 'bot');
        }
      } catch (error) {
        removeLoading();
        appendMessage("Sorry, I'm having trouble connecting right now.", 'bot');
      }
    });

    // Optional: greet on open
    let greeted = false;
    toggleBtn.addEventListener('click', function() {
      if (!greeted && windowEl.classList.contains('chatbot-hide') === false) {
        setTimeout(() => {
          appendMessage("Hi! I'm your assistant. Ask me anything about our phones!", 'bot');
        }, 400);
        greeted = true;
      }
    });
  }
});

// Modern Chatbot UI JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
  const chatBody = document.querySelector('.chat-body');
  const sendButton = document.querySelector('.send-button');
  const inputField = document.querySelector('.input-area input');
  const suggestionButtons = document.querySelectorAll('.suggestion-button');
  const headerIcons = document.querySelectorAll('.header-icons i');
  const attachIcon = document.querySelector('.input-area .fa-paperclip');
  const micIcon = document.querySelector('.input-area .fa-microphone');

  // Function to add message to chat
  function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Function to send message to server
  async function sendMessageToServer(text) {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to API:', error);
      return "Sorry, I couldn't connect to the server. Please try again later.";
    }
  }

  // Send button functionality
  if (sendButton && inputField) {
    sendButton.addEventListener('click', async function() {
      const text = inputField.value.trim();
      if (!text) return;

      // Add user message
      addMessage(text, 'sent');
      inputField.value = '';

      // Add loading indicator with wave animation
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'message received loading-animation';
      loadingDiv.id = 'loading-message';
      loadingDiv.innerHTML = `
        <span class="wave-text">
          <span class="wave-letter">T</span>
          <span class="wave-letter">y</span>
          <span class="wave-letter">p</span>
          <span class="wave-letter">i</span>
          <span class="wave-letter">n</span>
          <span class="wave-letter">g</span>
          <span class="wave-dots">
            <span class="wave-dot">.</span>
            <span class="wave-dot">.</span>
            <span class="wave-dot">.</span>
          </span>
        </span>
      `;
      chatBody.appendChild(loadingDiv);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Send to server and get response
      try {
        const response = await sendMessageToServer(text);
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) {
          loadingElement.remove();
        }
        addMessage(response, 'received');
      } catch (error) {
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) {
          loadingElement.remove();
        }
        addMessage("Sorry, I'm having trouble connecting right now.", 'received');
      }
    });
  }

  // Enter key functionality
  if (inputField) {
    inputField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendButton.click();
      }
    });
  }

  // Suggestion buttons functionality
  suggestionButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      suggestionButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Set input value to suggestion text
      if (inputField) {
        inputField.value = this.textContent.trim();
      }
      
      // Auto-send the suggestion
      setTimeout(() => {
        sendButton.click();
      }, 100);
    });
  });

  // Header icons functionality
  headerIcons.forEach(icon => {
    icon.addEventListener('click', function(e) {
      // If chevron clicked -> close/hide the chatbot completely
      if (this.classList.contains('fa-chevron-down')) {
        const chatContainer = document.querySelector('.chatbot-container');
        if (chatContainer) {
          // Add hidden class and ensure aria + inline display updated for compatibility
          chatContainer.classList.add('chatbot-hide');
          try { chatContainer.setAttribute('aria-hidden', 'true'); } catch (err) {}
          try { chatContainer.style.display = 'none'; } catch (err) {}

          // Reset floating toggle position and aria state so it remains visible
          const tb = document.querySelector('.chatbot-toggle-btn');
          if (tb) {
            tb.setAttribute('aria-expanded', 'false');
            try { tb.style.right = '20px'; } catch (err) {}
            try { tb.focus(); } catch (err) {}
          }
        }
      } else if (this.classList.contains('fa-ellipsis-v')) {
        // Show options menu (you can customize this)
        alert('Chatbot options menu');
      }
    });
  });

  // Attach icon functionality
  if (attachIcon) {
    attachIcon.addEventListener('click', function() {
      // Create a file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,.pdf,.txt,.doc,.docx';
      fileInput.style.display = 'none';
      
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          addMessage(`📎 Attached: ${file.name}`, 'sent');
          addMessage("I received your file! How can I help you with it?", 'received');
        }
      });
      
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    });
  }

  // Microphone icon functionality
  if (micIcon) {
    micIcon.addEventListener('click', function() {
      // Basic voice recording functionality
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = function() {
          micIcon.style.color = '#ff4444';
        };
        
        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          if (inputField) {
            inputField.value = transcript;
          }
          micIcon.style.color = '#ff4757';
        };
        
        recognition.onerror = function() {
          micIcon.style.color = '#ff4757';
          addMessage("Sorry, I couldn't understand the audio.", 'received');
        };
        
        recognition.onend = function() {
          micIcon.style.color = '#ff4757';
        };
        
        recognition.start();
      } else {
        alert('Speech recognition not supported in this browser.');
      }
    });
  }

  // Toggle is created separately by the standalone initializer below.
});

// Standalone toggle button - runs independently
(function() {
  function createToggleButton() {
    // Remove any existing toggle button first
    const existingToggle = document.querySelector('.chatbot-toggle-btn');
    if (existingToggle) {
      existingToggle.remove();
    }

    // Create the toggle button
    const toggleButton = document.createElement('button');
  toggleButton.className = 'chatbot-toggle-btn';
  // Use the bot image as the button content
  toggleButton.innerHTML = '<img src="/static/images/bot.png" alt="Chat bot" />';
    toggleButton.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background: linear-gradient(to right, #ff4757, #ff3838) !important;
      color: white !important;
      border: none !important;
      font-size: 24px !important;
      cursor: pointer !important;
      z-index: 99999 !important;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
      transition: transform 0.3s ease !important;
    `;
    
    toggleButton.addEventListener('click', function() {
      console.log('[chatbot] toggle clicked');
      const chatContainer = document.querySelector('.chatbot-container');
      if (!chatContainer) {
        console.warn('[chatbot] .chatbot-container not found in DOM');
        return;
      }

      // If currently hidden, show it (remove class and clear inline display)
      if (chatContainer.classList.contains('chatbot-hide')) {
        // OPEN
        chatContainer.classList.remove('chatbot-hide');
        try { chatContainer.style.display = ''; } catch (e) {}
        chatContainer.setAttribute('aria-hidden', 'false');
        this.setAttribute('aria-expanded', 'true');
        // Shift toggle left so it remains visible outside the opened chat
        try {
          const rect = chatContainer.getBoundingClientRect();
          const chatWidth = rect.width || 380;
          const margin = 12; // gap between chat and toggle
          this.style.right = (20 + chatWidth + margin) + 'px';
        } catch (e) {
          this.style.right = '420px';
        }
        console.log('[chatbot] opened');
      } else {
        // CLOSE
        chatContainer.classList.add('chatbot-hide');
        try { chatContainer.style.display = 'none'; } catch (e) {}
        chatContainer.setAttribute('aria-hidden', 'true');
        this.setAttribute('aria-expanded', 'false');
        // reset toggle position
        this.style.right = '20px';
        console.log('[chatbot] closed');
      }
    });

    // Accessibility: make toggle focusable and operable via keyboard
    toggleButton.setAttribute('aria-label', 'Open chat');
    toggleButton.setAttribute('role', 'button');
    toggleButton.setAttribute('tabindex', '0');
    toggleButton.setAttribute('aria-expanded', 'false');

    toggleButton.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });

    // Add hover effect
    toggleButton.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
    });

    toggleButton.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(toggleButton);
  }

  // Create toggle button when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToggleButton);
  } else {
    createToggleButton();
  }
})();
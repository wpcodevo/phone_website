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

navOpen.addEventListener("click", () => {
  menu.classList.add("open");
  document.body.classList.add("active");
  navContainer.style.left = "0";
  navContainer.style.width = "30rem";
});

navClose.addEventListener("click", () => {
  menu.classList.remove("open");
  document.body.classList.remove("active");
  navContainer.style.left = "-30rem";
  navContainer.style.width = "0";
});

/*
=============
PopUp
=============
 */
const popup = document.querySelector(".popup");
const closePopup = document.querySelector(".popup__close");

if (popup) {
  closePopup.addEventListener("click", () => {
    popup.classList.add("hide__popup");
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      popup.classList.remove("hide__popup");
    }, 500);
  });
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

  if (scrollHeight > 300) {
    gotoTop.classList.add("show-top");
  } else {
    gotoTop.classList.remove("show-top");
  }
});

let login=document.querySelector('.login-form');

document.querySelector('#login-btn').onclick=()=>{
    login.classList.toggle('active');
   searchForm.classList.remove('active');
    shoppingCart.classList.remove('active');

}

let shoppingCart=document.querySelector('.shopping-cart');

document.querySelector('#cart-btn').onclick=()=>{
    shoppingCart.classList.toggle('active');
    searchForm.classList.remove('active');
    login.classList.remove('active');

}
let searchForm=document.querySelector('.search-form');

document.querySelector('#search-btn').onclick=()=>{
    searchForm.classList.toggle('active');
    shoppingCart.classList.remove('active');
    login.classList.remove('active');
 
}

// Chatbot functionality
(function() {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (chatbotToggle && chatbotWindow && chatbotClose && chatbotForm && chatbotInput && chatbotMessages) {
    chatbotToggle.addEventListener('click', () => {
      chatbotWindow.classList.toggle('chatbot-hide');
    });
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.add('chatbot-hide');
    });
    chatbotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = chatbotInput.value.trim();
      if (!msg) return;
      appendMessage('user', msg);
      chatbotInput.value = '';
      setTimeout(() => {
        appendMessage('bot', getBotReply(msg));
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }, 600);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });

    function appendMessage(sender, text) {
      const div = document.createElement('div');
      div.className = 'chatbot-message ' + sender;
      div.textContent = text;
      chatbotMessages.appendChild(div);
    }

    function getBotReply(msg) {
      // Simple dummy replies
      msg = msg.toLowerCase();
      if (msg.includes('hello') || msg.includes('hi')) return "Hello! How can I help you today?";
      if (msg.includes('price')) return "For pricing details, please check our product listings.";
      if (msg.includes('contact')) return "You can contact us via the Contact section below.";
      if (msg.includes('help')) return "I'm here to help! Ask me anything about our products or services.";
      return "Sorry, I didn't understand that. Please try asking something else.";
    }
  }
})();
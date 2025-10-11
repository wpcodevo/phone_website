// Enhanced Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    console.log('Dark mode script loaded'); // Debug log
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme');
    console.log('Current stored theme:', currentTheme); // Debug log
    
    if (currentTheme === 'darkMode') {
        body.classList.add('darkMode');
        updateThemeIcon(true);
        console.log('Dark mode applied from storage'); // Debug log
    } else {
        body.classList.remove('darkMode');
        updateThemeIcon(false);
        console.log('Light mode applied from storage'); // Debug log
    }
    
    // Theme switch event listener
    if (themeSwitch) {
        themeSwitch.addEventListener('click', function() {
            body.classList.toggle('darkMode');
            
            let theme = 'lightMode';
            if (body.classList.contains('darkMode')) {
                theme = 'darkMode';
                updateThemeIcon(true);
                console.log('Switched to dark mode'); // Debug log
            } else {
                updateThemeIcon(false);
                console.log('Switched to light mode'); // Debug log
            }
            
            localStorage.setItem('theme', theme);

            // Notify listeners (e.g., components that may need to recalc sizes)
            try {
                document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme } }));
            } catch (e) {
                console.warn('Theme change event dispatch failed', e);
            }

            // Resume hero slider autoplay if Glide instance exists
            if (window.heroGlide && typeof window.heroGlide.play === 'function') {
                setTimeout(() => {
                    try { 
                        console.log('[HeroGlide] Resume attempt after theme toggle');
                        window.heroGlide.play(); 
                    } catch (e) { console.warn('Could not resume hero slider', e); }
                }, 30);
            }
        });
    } else {
        console.error('Theme switch button not found!'); // Debug log
    }
    
    // Update the theme icon based on current mode
    function updateThemeIcon(isDarkMode) {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            if (isDarkMode) {
                themeIcon.innerHTML = '🌙'; // Moon for dark mode
                themeIcon.setAttribute('title', 'Switch to light mode');
            } else {
                themeIcon.innerHTML = '☀️'; // Sun for light mode
                themeIcon.setAttribute('title', 'Switch to dark mode');
            }
        } else {
            console.error('Theme icon not found!'); // Debug log
        }
    }
    
    // Initialize icon on page load
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        updateThemeIcon(body.classList.contains('darkMode'));
    }
    
    // Add accessibility attributes to theme switch
    if (themeSwitch) {
        themeSwitch.setAttribute('aria-label', 'Toggle dark mode');
        themeSwitch.setAttribute('role', 'button');
    }
    
    // Add CSS to ensure dark mode styles are applied immediately
    const style = document.createElement('style');
    style.textContent = `
        body.darkMode {
            --white: #1a1a1a !important;
            --black: #ffffff !important;
            --primaryColor: #2d2d2d !important;
        }
        body.darkMode .header,
        body.darkMode .navigation {
            background-color: #1a1a1a !important;
        }
        body.darkMode .nav__logo a,
        body.darkMode .nav__link {
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Dark mode setup complete'); // Debug log
});
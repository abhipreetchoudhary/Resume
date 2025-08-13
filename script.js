// Smooth scrolling for navigation links with enhanced easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Add a slight delay for ultra-smooth feel
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    });
});

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        console.log('Navigation toggled:', navMenu.classList.contains('active'));
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Header background on scroll with smooth transitions
let lastScrollY = 0;
let ticking = false;

const updateHeader = () => {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        header.style.background = 'rgba(18, 18, 18, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
        header.style.borderBottom = '1px solid rgba(29, 185, 84, 0.3)';
    } else {
        header.style.background = 'rgba(18, 18, 18, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.borderBottom = '1px solid rgba(29, 185, 84, 0.1)';
    }
    
    lastScrollY = scrollY;
    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isShowcasing) { // Only animate when NOT in showcase mode
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.timeline-item, .project-card, .skill-category, .highlight, .cert-card').forEach(el => {
    observer.observe(el);
});

// Play button animation and auto showcase
const playButton = document.querySelector('#showcase-play');
const showcaseCircle = document.querySelector('.showcase-circle');
let isShowcasing = false;
let showcaseInterval;
let userScrollTimeout;
let lastAutoScrollTime = 0;
let isUserScrolling = false;
let scrollEndTimeout;

if (playButton) {
    playButton.addEventListener('click', () => {
        if (!isShowcasing) {
            startAutoShowcase();
        } else {
            stopAutoShowcase();
        }
    });
}

// Detect manual scrolling during showcase and pause
window.addEventListener('scroll', () => {
    if (isShowcasing) {
        const currentTime = Date.now();
        
        // Check if this scroll was triggered by auto-showcase (within 2 seconds of auto scroll)
        const isAutoScroll = currentTime - lastAutoScrollTime < 2000;
        
        if (!isAutoScroll) {
            // User is manually scrolling
            isUserScrolling = true;
            
            // Clear any existing timeout
            clearTimeout(scrollEndTimeout);
            
            // Show notification only once when user starts scrolling
            if (!document.querySelector('.user-scroll-notification')) {
                const notification = showNotification('🛑 Auto-showcase paused - Manual scrolling detected', 'info');
                notification.classList.add('user-scroll-notification');
            }
            
            // Pause the auto-showcase interval but don't stop completely
            if (showcaseInterval) {
                clearInterval(showcaseInterval);
                showcaseInterval = null;
            }
            
            // Set timeout to resume auto-scroll after user stops scrolling for 3 seconds
            scrollEndTimeout = setTimeout(() => {
                if (isShowcasing && isUserScrolling) {
                    isUserScrolling = false;
                    showNotification('▶️ Auto-showcase resumed', 'success');
                    resumeAutoShowcase();
                }
            }, 3000);
        }
    }
});

function startAutoShowcase() {
    isShowcasing = true;
    
    // Disconnect observer to prevent interference
    observer.disconnect();
    
    // Update button to show it's playing
    playButton.querySelector('i').className = 'fas fa-pause';
    playButton.classList.add('playing');
    showcaseCircle.classList.add('playing');
    
    // Add showcase mode to body
    document.body.classList.add('showcase-mode');
    
    // Music will play in background without visual indicator
    
    // Create a simple, reliable audio player
    const audio = new Audio();
    
    // Use your local MP3 file
    const audioUrl = './A$AP Rocky - Praise The Lord (Da Shine) (Official Video) ft. Skepta.mp3';
    
    audio.src = audioUrl;
    audio.loop = false; // We'll handle custom looping
    audio.volume = 0.3;
    
    // Don't set currentTime here - wait for loadedmetadata
    
    // Custom loop from 23 seconds
    audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        audio.currentTime = 23;
    });
    
    // Handle when audio can start playing
    audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through, current time:', audio.currentTime);
        if (audio.currentTime < 23) {
            audio.currentTime = 23;
        }
    });
    
    audio.addEventListener('ended', () => {
        console.log('Audio ended, looping back to 23 seconds');
        if (isShowcasing) {
            audio.currentTime = 23;
            audio.play().catch(e => console.log('Loop play failed:', e));
        }
    });
    
    // Also handle timeupdate to ensure we stay in the loop range if needed
    audio.addEventListener('timeupdate', () => {
        if (isShowcasing && audio.currentTime < 22.5) {
            console.log('Audio time too early, jumping to 23 seconds');
            audio.currentTime = 23;
        }
    });
    
    // Add error event listener
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        console.error('Audio error details:', audio.error);
    });
    
    // Add progress event listener
    audio.addEventListener('progress', () => {
        console.log('Audio loading progress...');
    });
    
    // Modern browsers require user interaction before playing audio
    // This click event provides that interaction
    const playAudio = async () => {
        try {
            console.log('Attempting to play audio...');
            // Ensure metadata is loaded first
            if (audio.readyState < 2) {
                console.log('Waiting for audio to load...');
                await new Promise(resolve => {
                    audio.addEventListener('loadedmetadata', resolve, { once: true });
                });
            }
            
            // Set start time to 23 seconds
            audio.currentTime = 23;
            console.log('Set currentTime to 23, actual currentTime:', audio.currentTime);
            
            await audio.play();
            console.log('🎵 Audio is now playing from 0:23!');
            // No notification for audio success
        } catch (error) {
            console.log('Audio blocked by browser:', error);
            showNotification('🎵 Click anywhere to enable audio', 'info');
            
            // Add click listener to enable audio on next user interaction
            const enableAudio = async () => {
                try {
                    console.log('User clicked, trying to enable audio...');
                    // Wait for metadata if needed
                    if (audio.readyState < 2) {
                        await new Promise(resolve => {
                            audio.addEventListener('loadedmetadata', resolve, { once: true });
                        });
                    }
                    audio.currentTime = 23;
                    await audio.play();
                    document.removeEventListener('click', enableAudio);
                    console.log('Audio enabled and playing!');
                    // No notification for audio enabled
                } catch (e) {
                    console.log('Still cannot play audio:', e);
                }
            };
            document.addEventListener('click', enableAudio, { once: true });
        }
    };
    
    // Try to play immediately
    playAudio();
    
    // Alternative: Create a simple tone if external audio fails
    const createBackupAudio = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a pleasant chord progression
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A note
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start();
            
            // Store for stopping later
            playButton.backupAudio = { oscillator, audioContext, gainNode };
            
            console.log('🎵 Backup audio tone created');
            // No notification for backup audio
            
            return true;
        } catch (error) {
            console.log('Could not create backup audio:', error);
            return false;
        }
    };
    
    // If main audio fails after a timeout, try backup
    setTimeout(() => {
        if (audio.paused && audio.readyState > 0) {
            console.log('Main audio not playing after 3 seconds, trying backup...');
            createBackupAudio();
        }
    }, 3000); // Increased timeout
    
    // Store audio reference
    playButton.audioElement = audio;
    
    // Show minimal notification without music details
    showNotification('🎵 Starting auto showcase!', 'success');
    
    // Auto scroll through sections
    const sections = ['#about', '#experience', '#skills', '#certifications', '#projects', '#contact'];
    let currentSection = 0;
    
    // Function to highlight current section
    const highlightSection = (sectionId) => {
        // Remove active class from all sections immediately
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
        });
        
        // Add active class to current section after scroll completes
        setTimeout(() => {
            const currentSectionElement = document.querySelector(sectionId);
            if (currentSectionElement) {
                currentSectionElement.classList.add('active');
            }
        }, 800); // Wait for scroll to complete before highlighting
    };

    // Store sections and current index globally for resume functionality
    playButton.sections = sections;
    playButton.currentSection = currentSection;
    
    // Start auto-scrolling
    startAutoScrolling();
    
    // Update showcase text
    document.querySelector('.showcase-text span').textContent = 'Showcasing...';
}

// Function to start the auto-scrolling mechanism
function startAutoScrolling() {
    const sections = playButton.sections;
    let currentSection = playButton.currentSection || 0;
    
    // Function to highlight current section
    const highlightSection = (sectionId) => {
        // Remove ALL animations and classes from EVERYTHING
        document.querySelectorAll('*').forEach(element => {
            element.classList.remove('active', 'fade-in-up');
            // Reset any transform or opacity that might be applied
            if (element.style.transform !== undefined) element.style.transform = '';
            if (element.style.opacity !== undefined) element.style.opacity = '';
        });
        
        // Add active class to current section after scroll completes
        setTimeout(() => {
            const currentSectionElement = document.querySelector(sectionId);
            if (currentSectionElement && isShowcasing && !isUserScrolling) {
                currentSectionElement.classList.add('active');
                
                // Only highlight specific child elements within the section
                const skillCategories = currentSectionElement.querySelectorAll('.skill-category');
                const projectCards = currentSectionElement.querySelectorAll('.project-card');
                const timelineItems = currentSectionElement.querySelectorAll('.timeline-item');
                const certCards = currentSectionElement.querySelectorAll('.cert-card');
                
                [...skillCategories, ...projectCards, ...timelineItems, ...certCards].forEach((child, index) => {
                    setTimeout(() => {
                        if (isShowcasing && !isUserScrolling) {
                            child.classList.add('active');
                        }
                    }, index * 150); // Faster stagger
                });
            }
        }, 1500); // Even longer wait for scroll completion
    };
    
    // Scroll to first section after a delay
    setTimeout(() => {
        if (isShowcasing && !isUserScrolling) {
            lastAutoScrollTime = Date.now();
            const firstSection = document.querySelector(sections[currentSection]);
            if (firstSection) {
                firstSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Highlight after scroll animation completes
                setTimeout(() => {
                    if (isShowcasing && !isUserScrolling) {
                        highlightSection(sections[currentSection]);
                    }
                }, 1000);
            }
        }
    }, 1500);
    
    // Set up interval for auto-scrolling
    showcaseInterval = setInterval(() => {
        if (!isUserScrolling && isShowcasing) {
            // Clear ALL highlights and animations first - be more aggressive
            document.querySelectorAll('.section, .skill-category, .project-card, .timeline-item, .cert-card, .highlight').forEach(s => {
                s.classList.remove('active', 'fade-in-up');
                s.style.transform = '';
                s.style.opacity = '';
            });
            
            // Wait a moment for cleanup, then proceed
            setTimeout(() => {
                if (!isUserScrolling && isShowcasing) {
                    currentSection = (currentSection + 1) % sections.length;
                    playButton.currentSection = currentSection;
                    lastAutoScrollTime = Date.now();
                    
                    if (currentSection === 0) {
                        // Return to top after completing a cycle
                        setTimeout(() => {
                            if (!isUserScrolling && isShowcasing) {
                                lastAutoScrollTime = Date.now();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                showNotification('🎯 Showcase cycle completed! Starting new cycle...', 'info');
                            }
                        }, 500);
                    } else {
                        const sectionElement = document.querySelector(sections[currentSection]);
                        if (sectionElement) {
                            sectionElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            
                            // Highlight after scroll completes
                            setTimeout(() => {
                                if (isShowcasing && !isUserScrolling) {
                                    highlightSection(sections[currentSection]);
                                }
                            }, 1200);
                        }
                    }
                }
            }, 300); // Small delay for cleanup
        }
    }, 8000); // Increased to 8 seconds for even cleaner transitions
}

// Function to resume auto-showcase after user stops scrolling
function resumeAutoShowcase() {
    if (isShowcasing && !showcaseInterval) {
        // Find the closest section to current scroll position
        const sections = playButton.sections;
        const scrollTop = window.pageYOffset;
        let closestSection = 0;
        let minDistance = Infinity;
        
        sections.forEach((sectionId, index) => {
            const element = document.querySelector(sectionId);
            if (element) {
                const elementTop = element.offsetTop;
                const distance = Math.abs(scrollTop - elementTop);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSection = index;
                }
            }
        });
        
        // Update current section to closest one
        playButton.currentSection = closestSection;
        
        // Resume auto-scrolling
        startAutoScrolling();
    }
}

function stopAutoShowcase() {
    isShowcasing = false;
    isUserScrolling = false;
    
    // Re-enable observer for normal scrolling
    document.querySelectorAll('.timeline-item, .project-card, .skill-category, .highlight, .cert-card').forEach(el => {
        observer.observe(el);
    });
    
    // Clear timeouts and intervals
    clearTimeout(scrollEndTimeout);
    clearTimeout(userScrollTimeout);
    
    // Update button back to play state
    playButton.querySelector('i').className = 'fas fa-play';
    playButton.classList.remove('playing');
    showcaseCircle.classList.remove('playing');
    
    // Remove showcase mode
    document.body.classList.remove('showcase-mode');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // No music indicator to remove since we don't create one
    
    // Stop background music
    if (playButton.audioElement) {
        playButton.audioElement.pause();
        playButton.audioElement.currentTime = 0;
        console.log('🎵 Audio stopped');
    }
    
    // Stop backup audio if it exists
    if (playButton.backupAudio) {
        try {
            playButton.backupAudio.oscillator.stop();
            playButton.backupAudio.audioContext.close();
            playButton.backupAudio = null;
            console.log('🎵 Backup audio stopped');
        } catch (error) {
            console.log('Error stopping backup audio:', error);
        }
    }
    
    // Clear the interval
    if (showcaseInterval) {
        clearInterval(showcaseInterval);
        showcaseInterval = null;
    }
    
    // Reset section tracking
    playButton.currentSection = 0;
    
    // Show notification
    showNotification('⏹️ Auto showcase stopped', 'info');
    
    // Update showcase text
    document.querySelector('.showcase-text span').textContent = 'Auto Showcase';
    
    // Scroll back to top
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
}

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageTextarea = contactForm.querySelector('textarea');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageTextarea.value.trim();
        
        // Simple validation
        if (name && email && message) {
            // Create email content
            const subject = encodeURIComponent(`Contact Form Submission from ${name}`);
            const emailBody = encodeURIComponent(
                `New contact form submission from your resume website:\n\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Message:\n${message}\n\n` +
                `---\n` +
                `This message was sent through your resume website contact form.`
            );
            
            // Create mailto link
            const mailtoLink = `mailto:hdrk0707@gmail.com?subject=${subject}&body=${emailBody}`;
            
            try {
                // Open email client with pre-filled content
                window.location.href = mailtoLink;
                
                // Show success message
                showNotification('📧 Email client opened with your message! Please send the email to complete submission.', 'success');
                
                // Reset form after successful submission
                contactForm.reset();
                
                console.log('Contact form submitted:', { name, email, message });
            } catch (error) {
                console.error('Failed to open email client:', error);
                showNotification('❌ Could not open email client. Please email hdrk0707@gmail.com directly.', 'error');
            }
        } else {
            showNotification('❌ Please fill in all fields.', 'error');
        }
    });
}

// Notification system with mobile-friendly positioning
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for individual notification
    notification.style.cssText = `
        background: ${type === 'success' ? '#1DB954' : type === 'error' ? '#E22134' : '#1DB954'};
        color: white;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transform: translateY(-50px);
        opacity: 0;
        transition: all 0.3s ease;
        width: 100%;
        text-align: center;
        font-size: 0.9rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 8px;
    `;
    
    // Add mobile-specific styles
    if (window.innerWidth <= 768) {
        notification.style.fontSize = '0.8rem';
        notification.style.padding = '0.6rem 1rem';
        notification.style.borderRadius = '6px';
    }
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(-50px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            // Remove container if empty
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 4000);
    
    // Remove older notifications if too many (keep max 3)
    const notifications = container.querySelectorAll('.notification');
    if (notifications.length > 3) {
        const oldest = notifications[0];
        oldest.style.transform = 'translateY(-50px)';
        oldest.style.opacity = '0';
        setTimeout(() => {
            if (oldest.parentNode) {
                oldest.remove();
            }
        }, 300);
    }
    
    return notification;
}

// Download CV functionality
const downloadBtn = document.querySelector('.btn-primary');
if (downloadBtn && downloadBtn.textContent.includes('Download')) {
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        try {
            // Create a temporary link element for download
            const link = document.createElement('a');
            link.href = './Abhipreet_Choudhary_Resume.pdf';
            link.download = 'Abhipreet_Choudhary_Resume.pdf';
            link.target = '_blank';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('📄 CV download started!', 'success');
            console.log('CV download initiated');
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('❌ Download failed. Please try again.', 'error');
        }
    });
}

// Contact Me functionality
const contactBtn = document.querySelector('.btn-secondary');
if (contactBtn && contactBtn.textContent.includes('Contact')) {
    contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        try {
            // Create mailto link with subject and body
            const subject = encodeURIComponent('Inquiry from Resume Website');
            const body = encodeURIComponent('Hi Abhipreet,\n\nI found your resume website and would like to connect with you.\n\nBest regards,');
            const mailtoLink = `mailto:hdrk0707@gmail.com?subject=${subject}&body=${body}`;
            
            // Open default email client
            window.location.href = mailtoLink;
            
            showNotification('📧 Opening email client...', 'success');
            console.log('Email client opened');
        } catch (error) {
            console.error('Email client failed to open:', error);
            showNotification('❌ Could not open email client. Please email hdrk0707@gmail.com directly.', 'error');
        }
    });
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    
    // Start typing animation after a short delay
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 100);
    }, 500);
});

// Spotify-style progress bar (for fun)
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'spotify-progress';
    progressBar.innerHTML = `
        <div class="progress-track">
            <div class="progress-fill"></div>
            <div class="progress-handle"></div>
        </div>
    `;
    
    progressBar.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 1000;
    `;
    
    const progressFill = progressBar.querySelector('.progress-fill');
    progressFill.style.cssText = `
        height: 100%;
        background: #1DB954;
        width: 0%;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    // Update progress based on scroll
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
}

// Initialize progress bar
createProgressBar();

// Add some fun easter eggs
let konami = [];
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A

document.addEventListener('keydown', (e) => {
    konami.push(e.keyCode);
    if (konami.length > konamiCode.length) {
        konami.shift();
    }
    
    if (konami.join(',') === konamiCode.join(',')) {
        // Easter egg activated!
        showNotification('🎉 Konami Code activated! You found the secret!', 'success');
        
        // Add some fun effects
        document.body.style.animation = 'rainbow 2s infinite';
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
        
        konami = [];
    }
});

// Add rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    // Hide any loading spinner if you add one
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 300);
    }
    
    // Fade in the main content
    document.body.style.opacity = '1';
});

// Set initial opacity for smooth loading
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.3s ease';

console.log('🎵 Spotify Resume Website loaded successfully!');
console.log('💡 Try the Konami Code for a surprise: ↑↑↓↓←→←→BA');

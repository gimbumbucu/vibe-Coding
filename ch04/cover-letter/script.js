const card = document.getElementById('card');
const resumeContent = document.getElementById('resume-content');
const scrollContainer = document.querySelector('.scroll-container');

// Base dimensions of the business card
const baseWidth = 400;
const baseHeight = 250;

// Map a value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    // maxScroll = total scrollable height
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Ensure maxScroll > 0 to avoid division by zero
    if (maxScroll <= 0) return;
    
    // scrollFraction goes from 0 to 1
    const scrollFraction = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    
    let rotateX = 60;
    let rotateY = 0;
    let rotateZ = -30;
    let currentWidth = baseWidth;
    let currentHeight = baseHeight;
    let borderRadius = 16;
    let contentOpacity = 0;

    // Stage 1: Flatten the card to face the camera (0.0 to 0.3)
    if (scrollFraction <= 0.3) {
        let progress = scrollFraction / 0.3; // 0 to 1
        // Smooth easing out for flattening
        const easeProgress = progress * (2 - progress); 
        rotateX = mapRange(easeProgress, 0, 1, 60, 0);
        rotateZ = mapRange(easeProgress, 0, 1, -30, 0);
    } else {
        rotateX = 0;
        rotateZ = 0;
    }
    
    // Stage 2: Flip the card to reveal the back (0.3 to 0.5)
    if (scrollFraction > 0.3 && scrollFraction <= 0.5) {
        let progress = (scrollFraction - 0.3) / 0.2; // 0 to 1
        // Smooth easing in-out for flipping
        const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        rotateY = mapRange(easeProgress, 0, 1, 0, 180);
    } else if (scrollFraction > 0.5) {
        rotateY = 180;
    }
    
    // Stage 3: Expand the card to full page (0.5 to 0.8)
    if (scrollFraction > 0.5 && scrollFraction <= 0.8) {
        let progress = (scrollFraction - 0.5) / 0.3; // 0 to 1
        // Easing for smoother expansion
        const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        
        // Target dimensions: 90vw width, 90vh height, max width 1200px
        const targetWidth = Math.min(window.innerWidth * 0.9, 1200);
        const targetHeight = window.innerHeight * 0.9;
        
        currentWidth = mapRange(easeProgress, 0, 1, baseWidth, targetWidth);
        currentHeight = mapRange(easeProgress, 0, 1, baseHeight, targetHeight);
        borderRadius = mapRange(easeProgress, 0, 1, 16, 8);
    } else if (scrollFraction > 0.8) {
        currentWidth = Math.min(window.innerWidth * 0.9, 1200);
        currentHeight = window.innerHeight * 0.9;
        borderRadius = 8;
    }
    
    // Stage 4: Fade in the resume content (0.7 to 0.9)
    if (scrollFraction > 0.7 && scrollFraction <= 0.9) {
        let progress = (scrollFraction - 0.7) / 0.2; // 0 to 1
        contentOpacity = mapRange(progress, 0, 1, 0, 1);
    } else if (scrollFraction > 0.9) {
        contentOpacity = 1;
    }

    // Apply computed transforms and styles
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    card.style.width = `${currentWidth}px`;
    card.style.height = `${currentHeight}px`;
    
    const faces = document.querySelectorAll('.card-face');
    faces.forEach(face => {
        face.style.borderRadius = `${borderRadius}px`;
    });
    
    resumeContent.style.opacity = contentOpacity;
    
    // Enable pointer events on content when visible to allow scrolling inside
    if (contentOpacity > 0.5) {
        resumeContent.style.pointerEvents = 'auto';
        if (!resumeContent.classList.contains('visible')) {
            resumeContent.classList.add('visible');
        }
    } else {
        resumeContent.style.pointerEvents = 'none';
        if (resumeContent.classList.contains('visible')) {
            resumeContent.classList.remove('visible');
        }
    }
});

// Trigger initial scroll calculation to set initial layout state on load
window.addEventListener('load', () => {
    window.dispatchEvent(new Event('scroll'));
});
window.addEventListener('resize', () => {
    window.dispatchEvent(new Event('scroll'));
});

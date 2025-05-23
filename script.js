document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('starry-sky-container');
    if (!container) {
        console.error('Error: starry-sky-container not found!');
        return;
    }

    const numStars = 200; // Number of stars

    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Set random size
        const size = Math.random() * 2 + 1; // 1px to 3px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Set random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Set random opacity
        star.style.opacity = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
        
        // Basic star appearance (can be enhanced in CSS)
        star.style.position = 'absolute';
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        
        // Store initial opacity and a random value for twinkling speed
        star.dataset.initialOpacity = star.style.opacity;
        star.dataset.twinkleSpeed = Math.random() * 0.05 + 0.01; // Random speed for twinkle
        star.dataset.twinkleDirection = Math.random() < 0.5 ? 1 : -1; // Twinkle brighter or dimmer

        // Optional: for flowing effect
        star.dataset.velocityX = (Math.random() - 0.5) * 0.1; // Slow horizontal drift
        star.dataset.velocityY = (Math.random() - 0.5) * 0.1; // Slow vertical drift

        container.appendChild(star);
        return star;
    }

    const stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(createStar());
    }

    function animateStars() {
        stars.forEach(star => {
            // Twinkling effect
            let currentOpacity = parseFloat(star.style.opacity);
            let twinkleSpeed = parseFloat(star.dataset.twinkleSpeed);
            let twinkleDirection = parseInt(star.dataset.twinkleDirection);
            let initialOpacity = parseFloat(star.dataset.initialOpacity);

            currentOpacity += twinkleSpeed * twinkleDirection;

            if (currentOpacity > initialOpacity || currentOpacity < initialOpacity * 0.3) {
                star.dataset.twinkleDirection *= -1; // Reverse twinkle direction
            }
            star.style.opacity = currentOpacity;

            // Flowing effect (optional)
            let x = parseFloat(star.style.left);
            let y = parseFloat(star.style.top);
            let vx = parseFloat(star.dataset.velocityX);
            let vy = parseFloat(star.dataset.velocityY);

            x += vx;
            y += vy;

            // Boundary check: if stars drift off screen, reposition them on the opposite side
            if (x < -1) x = 100; // If it goes off left, appear on right
            if (x > 101) x = 0;  // If it goes off right, appear on left
            if (y < -1) y = 100; // If it goes off top, appear on bottom
            if (y > 101) y = 0;   // If it goes off bottom, appear on top
            
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
        });

        requestAnimationFrame(animateStars);
    }

    animateStars();
});

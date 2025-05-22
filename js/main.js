/**
 * Fetches a Markdown file, converts it to HTML using Marked.js,
 * and renders it into the specified HTML element.
 *
 * @param {string} filePath The path to the Markdown file.
 * @param {string} targetElementId The ID of the HTML element to render the content into.
 */
async function fetchMarkdownAndRender(filePath, targetElementId) {
    const targetElement = document.getElementById(targetElementId);

    if (!targetElement) {
        console.error(`Error: Target element with ID '${targetElementId}' not found.`);
        return;
    }

    // Show a loading message
    targetElement.innerHTML = '<p>Loading content...</p>';

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch Markdown file: ${response.status} ${response.statusText}`);
        }
        const markdownText = await response.text();
        targetElement.innerHTML = marked.parse(markdownText);
    } catch (error) {
        console.error(`Error fetching or rendering Markdown for ${filePath}:`, error);
        targetElement.innerHTML = `<p class="error-message">Error loading content. Please try again later.</p>`;
    }
}

// Modal elements
let achievementModal;
let modalAchievementContent;
let modalCloseButton;

/**
 * Opens the achievement modal and loads the specified Markdown file into it.
 * @param {string} filePath Path to the Markdown file.
 */
function openAchievementModal(filePath) {
    if (!achievementModal || !modalAchievementContent) {
        console.error("Modal elements not initialized.");
        return;
    }
    // Clear previous content
    modalAchievementContent.innerHTML = '';
    fetchMarkdownAndRender(filePath, 'modalAchievementContent');

    achievementModal.style.display = 'block';
    setTimeout(() => {
        achievementModal.classList.add('modal-active');
    }, 10); // Timeout to allow display:block to apply before transition
}

/**
 * Closes the achievement modal.
 */
function closeAchievementModal() {
    if (!achievementModal) {
        console.error("Modal element not initialized.");
        return;
    }
    achievementModal.classList.remove('modal-active');
    setTimeout(() => {
        achievementModal.style.display = 'none';
    }, 300); // Match CSS transition duration (0.3s)
}


/**
 * Fetches achievements from achievements.json, displays them in a list,
 * and sets up event listeners to load Markdown content into a modal.
 */
async function loadAndDisplayAchievements() {
    const achievementsListElement = document.getElementById('achievements-list');

    if (!achievementsListElement) {
        console.error("Error: Achievements list element ('achievements-list') not found.");
        return;
    }

    try {
        const response = await fetch('achievements.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch achievements.json: ${response.status} ${response.statusText}`);
        }
        const achievements = await response.json();

        achievementsListElement.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.classList.add('achievement-item');

            const titleElement = document.createElement('h3');
            titleElement.textContent = achievement.title;

            const dateElement = document.createElement('p');
            dateElement.classList.add('achievement-date');
            dateElement.textContent = `Date: ${achievement.date}`;

            const summaryElement = document.createElement('p');
            summaryElement.classList.add('achievement-summary');
            summaryElement.textContent = achievement.summary;

            achievementItem.appendChild(titleElement);
            achievementItem.appendChild(dateElement);
            achievementItem.appendChild(summaryElement);

            achievementItem.setAttribute('data-md-file', achievement.file);
            achievementItem.addEventListener('click', () => {
                if (achievement.file) {
                    openAchievementModal(achievement.file);
                } else {
                    console.warn("No markdown file specified for this achievement:", achievement.title);
                    modalAchievementContent.innerHTML = "<p>No details available for this achievement.</p>";
                    achievementModal.style.display = 'block';
                    setTimeout(() => {
                        achievementModal.classList.add('modal-active');
                    }, 10);
                }
            });

            achievementsListElement.appendChild(achievementItem);
        });

        // Staggered animation for achievement items (should still work as they appear)
        const items = document.querySelectorAll('#achievements-list .achievement-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });

    } catch (error) {
        console.error("Error loading or displaying achievements:", error);
        achievementsListElement.innerHTML = `<p class="error-message">Could not load achievements. Please try again later.</p>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal elements
    achievementModal = document.getElementById('achievementModal');
    modalAchievementContent = document.getElementById('modalAchievementContent');
    modalCloseButton = document.querySelector('.modal-close-button');

    // Event listeners for closing modal
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeAchievementModal);
    }
    if (achievementModal) {
        achievementModal.addEventListener('click', (event) => {
            if (event.target === achievementModal) { // Clicked on overlay
                closeAchievementModal();
            }
        });
    }
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && achievementModal && achievementModal.classList.contains('modal-active')) {
            closeAchievementModal();
        }
    });

    // Load initial content
    fetchMarkdownAndRender('md/resume.md', 'resume-section'); // Resume is usually visible on load or part of first section
    loadAndDisplayAchievements(); // Achievements might be in a section that needs to scroll into view

    // Intersection Observer for scroll-triggered animations on sections
    const sectionsToAnimate = document.querySelectorAll('main > section');

    const observerOptions = {
      root: null, // observes intersections relative to the viewport
      threshold: 0.1, // trigger when 10% of the section is visible
      // rootMargin: "0px 0px -50px 0px" // example: trigger a bit before it's fully in view
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
      sectionObserver.observe(section);
    });
});

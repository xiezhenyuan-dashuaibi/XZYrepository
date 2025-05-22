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

/**
 * Fetches achievements from achievements.json, displays them in a list,
 * and sets up event listeners to load Markdown content when an achievement is clicked.
 */
async function loadAndDisplayAchievements() {
    const achievementsListElement = document.getElementById('achievements-list');
    const achievementContentElement = document.getElementById('achievement-content');

    if (!achievementsListElement) {
        console.error("Error: Achievements list element ('achievements-list') not found.");
        return;
    }
    if (!achievementContentElement) {
        console.error("Error: Achievement content element ('achievement-content') not found.");
        // We can still display the list, but clicking won't show content.
    }

    try {
        const response = await fetch('achievements.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch achievements.json: ${response.status} ${response.statusText}`);
        }
        const achievements = await response.json();

        // Clear any existing list content
        achievementsListElement.innerHTML = '';
        // Clear previous achievement content
        if (achievementContentElement) {
            achievementContentElement.innerHTML = '<p>Select an achievement to view its details.</p>';
        }


        achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.classList.add('achievement-item'); // For styling

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

            // Make the whole item clickable
            achievementItem.setAttribute('data-md-file', achievement.file);
            achievementItem.addEventListener('click', () => {
                if (achievement.file && achievementContentElement) {
                    fetchMarkdownAndRender(achievement.file, 'achievement-content');
                } else if (!achievementContentElement) {
                    console.error("Cannot render achievement content: 'achievement-content' element not found.");
                } else {
                    console.warn("No markdown file specified for this achievement:", achievement.title);
                    if (achievementContentElement) {
                        achievementContentElement.innerHTML = "<p>No details available for this achievement.</p>";
                    }
                }
            });

            achievementsListElement.appendChild(achievementItem);
        });

    } catch (error) {
        console.error("Error loading or displaying achievements:", error);
        achievementsListElement.innerHTML = `<p class="error-message">Could not load achievements. Please try again later.</p>`;
    }
}


// Load resume and achievements when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchMarkdownAndRender('md/resume.md', 'resume-section');
    loadAndDisplayAchievements();
});

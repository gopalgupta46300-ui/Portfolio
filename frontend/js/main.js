const API_BASE_URL = (() => {
    const explicit = window.PORTFOLIO_API_BASE || "";
    if (explicit) {
        return explicit.replace(/\/$/, "");
    }

    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:5000";
    }

    return "";
})();

const projectsContainer = document.getElementById("projects-grid");
const statusElement = document.getElementById("project-status");

async function loadProjects() {
    if (!projectsContainer || !statusElement) {
        console.error("Projects HTML elements not found.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Invalid projects API response.");
        }

        projectsContainer.replaceChildren();

        if (result.data.length === 0) {
            statusElement.textContent = "No projects available yet.";
            return;
        }

        result.data.forEach((project) => {
            const card = document.createElement("article");
            card.className = "project-card";

            const title = document.createElement("h3");
            title.textContent = project.title || "Untitled project";

            const description = document.createElement("p");
            description.textContent = project.description || "";

            const techStack = document.createElement("p");
            techStack.textContent = `Tech stack: ${project.tech_stack || "Not specified"}`;

            card.append(title, description, techStack);

            if (project.demo_url) {
                const link = document.createElement("a");
                link.href = project.demo_url;
                link.textContent = "View project";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                card.appendChild(link);
            }

            projectsContainer.appendChild(card);
        });

        statusElement.textContent = `Loaded ${result.data.length} project(s).`;
    } catch (error) {
        console.error("Failed to load projects:", error);
        statusElement.textContent = "Could not load projects. Please try again later.";
    }
}

async function loadBio() {
    const bioElement = document.getElementById("bio-description");

    if (!bioElement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/bio`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Unable to load bio.");
        }

        bioElement.textContent = result.content || "";
    } catch (error) {
        console.error("Error loading bio:", error);
        bioElement.textContent = "Bio is currently unavailable.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    loadBio();
});

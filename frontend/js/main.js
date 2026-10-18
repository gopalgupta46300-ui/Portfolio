
const API_URL = "http://127.0.0.1:5000/api/projects";

const projectsContainer = document.getElementById("projects-grid");
const statusElement = document.getElementById("project-status");

async function loadProjects() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error("The API could not load projects.");
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
            title.textContent = project.title;

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
        statusElement.textContent =
            "Could not load projects. Check the server and try again.";
    }
}

loadProjects();


//   ------------------- bio_descriptions --------------------
async function loadBio() {
    const bioElement = document.getElementById("bio-description");

    if (!bioElement) return;

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/bio"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load bio.");
        }

        bioElement.textContent = result.content || "";
    } catch (error) {
        console.error("Error loading bio:", error);
        bioElement.textContent = "Bio is currently unavailable.";
    }
}

document.addEventListener("DOMContentLoaded", loadBio);
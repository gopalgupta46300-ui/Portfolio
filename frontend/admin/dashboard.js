"use strict";

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

const adminEmail = document.getElementById("admin-email");
const logoutButton = document.getElementById("logout-button");
const statusElement = document.getElementById("status");
const projectsTableBody = document.getElementById("projects-table-body");
const addProjectButton = document.getElementById("add-project-button");

const totalProjectsElement = document.getElementById("total-projects");
const publishedProjectsElement = document.getElementById("published-projects");
const draftProjectsElement = document.getElementById("draft-projects");

const bioForm = document.getElementById("bio-form");
const bioInput = document.getElementById("bio-description");
const bioStatus = document.getElementById("bio-status");
const saveBioButton = document.getElementById("save-bio-button");

function showStatus(message, type = "") {
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = "status-message";

    if (type) {
        statusElement.classList.add(type);
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>\"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function safeURL(value) {
    if (!value) return null;

    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }
    } catch {
        // Invalid URL.
    }

    return null;
}

async function checkSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.replace("login.html");
            return false;
        }

        if (!response.ok) {
            showStatus(`Session check failed (${response.status}).`, "error");
            return false;
        }

        const result = await response.json();

        if (!result.success || !result.admin) {
            window.location.replace("login.html");
            return false;
        }

        if (adminEmail) {
            adminEmail.textContent = result.admin.email || "Admin";
        }

        return true;
    } catch (error) {
        console.error("Session check failed:", error);
        showStatus("Cannot connect to the backend. Make sure Flask is running.", "error");
        return false;
    }
}

async function loadBio() {
    if (!bioInput || !bioStatus) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/settings/bio`, {
            credentials: "include",
            headers: {
                "X-Requested-With": "portfolio-admin"
            }
        });

        if (response.status === 401) {
            window.location.replace("login.html");
            return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load bio.");
        }

        bioInput.value = result.content || "";
        bioStatus.textContent = "";
    } catch (error) {
        console.error("Loading bio failed:", error);
        bioStatus.textContent = error.message;
    }
}

if (bioForm) {
    bioForm.addEventListener("submit", async event => {
        event.preventDefault();

        const content = bioInput.value.trim();

        if (!content) {
            bioStatus.textContent = "Please enter your bio.";
            return;
        }

        saveBioButton.disabled = true;
        bioStatus.textContent = "Saving...";

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/settings/bio`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "portfolio-admin"
                },
                body: JSON.stringify({ content })
            });

            if (response.status === 401) {
                window.location.replace("login.html");
                return;
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save bio.");
            }

            bioStatus.textContent = "Bio saved successfully.";
        } catch (error) {
            console.error("Saving bio failed:", error);
            bioStatus.textContent = error.message;
        } finally {
            saveBioButton.disabled = false;
        }
    });
}

async function loadProjects() {
    if (!projectsTableBody) return;

    projectsTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">Loading projects...</td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects (${response.status}).`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Invalid projects response.");
        }

        const projects = result.data;

        updateStatistics(projects);
        renderProjects(projects);
    } catch (error) {
        console.error("Project loading failed:", error);

        projectsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Unable to load projects.
                </td>
            </tr>
        `;

        showStatus(error.message, "error");
    }
}

function updateStatistics(projects) {
    const publishedCount = projects.filter(project => project.published === true).length;

    if (totalProjectsElement) {
        totalProjectsElement.textContent = projects.length;
    }

    if (publishedProjectsElement) {
        publishedProjectsElement.textContent = publishedCount;
    }

    if (draftProjectsElement) {
        draftProjectsElement.textContent = projects.length - publishedCount;
    }
}

function renderProjects(projects) {
    if (!projectsTableBody) return;

    if (projects.length === 0) {
        projectsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">No projects found.</td>
            </tr>
        `;
        return;
    }

    projectsTableBody.innerHTML = projects.map(project => {
        const title = escapeHTML(project.title || "Untitled project");
        const description = escapeHTML(project.description || "");

        const technologies = Array.isArray(project.tech_stack)
            ? project.tech_stack.map(String).join(", ")
            : (project.tech_stack || "Not specified");

        const techStack = escapeHTML(technologies);
        const isPublished = project.published === true;
        const githubURL = safeURL(project.github_url);
        const demoURL = safeURL(project.demo_url);

        const links = [
            githubURL ? `<a href="${escapeHTML(githubURL)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : "",
            demoURL ? `<a href="${escapeHTML(demoURL)}" target="_blank" rel="noopener noreferrer">Demo</a>` : ""
        ].filter(Boolean).join(" ");

        return `
            <tr>
                <td>
                    <div class="project-title">${title}</div>
                    <div class="project-description">${description}</div>
                </td>
                <td>
                    <div class="tech-list">${techStack}</div>
                </td>
                <td>
                    <span class="status-badge ${isPublished ? "published" : "draft"}">${isPublished ? "Published" : "Draft"}</span>
                </td>
                <td>
                    <div class="project-links">${links || "<span>—</span>"}</div>
                </td>
            </tr>
        `;
    }).join("");
}

async function createProject(projectData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "portfolio-admin"
        },
        body: JSON.stringify(projectData)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create project.");
    }

    return result.project;
}

async function updateProject(projectId, projectData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/projects/${projectId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "portfolio-admin"
        },
        body: JSON.stringify(projectData)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update project.");
    }

    return result.project;
}

async function deleteProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/api/admin/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "X-Requested-With": "portfolio-admin"
        }
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete project.");
    }

    return result;
}

async function logout() {
    if (!logoutButton) return;

    logoutButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-Requested-With": "portfolio-admin"
            }
        });

        if (!response.ok) {
            throw new Error("Logout failed. Please try again.");
        }

        window.location.replace("login.html");
    } catch (error) {
        console.error("Logout failed:", error);
        showStatus(error.message, "error");
        logoutButton.disabled = false;
    }
}

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

if (addProjectButton) {
    addProjectButton.addEventListener("click", async () => {
        const title = window.prompt("Project title:", "New project");
        if (title === null) return;

        const description = window.prompt("Project description:", "Short project description");
        if (description === null) return;

        const tech_stack = window.prompt("Tech stack (comma separated):", "Python, Flask, Supabase");
        if (tech_stack === null) return;

        const demo_url = window.prompt("Demo URL (optional):", "");
        const github_url = window.prompt("GitHub URL (optional):", "");

        try {
            await createProject({
                title,
                description,
                tech_stack,
                demo_url: demo_url || null,
                github_url: github_url || null,
                published: true
            });
            showStatus("Project created successfully.", "success");
            await loadProjects();
        } catch (error) {
            console.error("Create project failed:", error);
            showStatus(error.message, "error");
        }
    });
}

async function initializeDashboard() {
    const authenticated = await checkSession();

    if (!authenticated) return;

    await Promise.all([
        loadBio(),
        loadProjects()
    ]);
}

initializeDashboard();

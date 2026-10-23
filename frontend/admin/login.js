(() => {
  "use strict";

  const API_BASE = (() => {
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

  const DASHBOARD_URL = "dashboard.html";

  const form = document.querySelector("#login-form");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const togglePassword = document.querySelector("#toggle-password");
  const emailError = document.querySelector("#email-error");
  const passwordError = document.querySelector("#password-error");
  const formMessage = document.querySelector("#form-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const forgotLink = document.querySelector("#forgot-link");

  if (!form || !emailInput || !passwordInput || !togglePassword || !formMessage || !submitButton || !forgotLink) {
    return;
  }

  togglePassword.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";

    passwordInput.type = isVisible ? "password" : "text";
    togglePassword.textContent = isVisible ? "Show" : "Hide";
    togglePassword.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    togglePassword.setAttribute("aria-pressed", String(!isVisible));
    passwordInput.focus();
  });

  function setError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();

    if (email && isValidEmail(email)) {
      setError(emailInput, emailError, "");
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
      setError(passwordInput, passwordError, "");
    }
  });

  forgotLink.addEventListener("click", (event) => {
    event.preventDefault();
    formMessage.classList.remove("is-error");
    formMessage.textContent = "Password reset must be handled by your administrator or your configured account recovery service.";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    setError(emailInput, emailError, "");
    setError(passwordInput, passwordError, "");
    formMessage.textContent = "";
    formMessage.classList.remove("is-error");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let firstInvalid = null;

    if (!email) {
      setError(emailInput, emailError, "Enter your admin email address.");
      firstInvalid = emailInput;
    } else if (!isValidEmail(email)) {
      setError(emailInput, emailError, "Enter a valid email address.");
      firstInvalid = emailInput;
    }

    if (!password) {
      setError(passwordInput, passwordError, "Enter your password.");
      firstInvalid ||= passwordInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    submitButton.disabled = true;
    const buttonText = submitButton.querySelector("span:first-child");

    if (buttonText) {
      buttonText.textContent = "Signing in…";
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Ignore invalid JSON responses.
      }

      if (response.ok && data.success) {
        formMessage.classList.remove("is-error");
        formMessage.textContent = data.message || "Login successful. Redirecting…";
        window.location.href = DASHBOARD_URL;
        return;
      }

      formMessage.classList.add("is-error");

      if (response.status === 400) {
        formMessage.textContent = data.message || "Email and password are required.";
      } else if (response.status === 401) {
        formMessage.textContent = data.message || "Invalid email or password.";
        passwordInput.value = "";
        setError(passwordInput, passwordError, "Check your password and try again.");
        passwordInput.focus();
      } else if (response.status === 403) {
        formMessage.textContent = data.message || "This account is not authorised as admin.";
      } else if (response.status === 404) {
        formMessage.textContent = "Login endpoint not found. Check the backend route.";
      } else if (response.status >= 500) {
        formMessage.textContent = data.message || "Server error. Please try again later.";
      } else {
        formMessage.textContent = data.message || `Login failed. HTTP ${response.status}.`;
      }
    } catch (networkError) {
      console.error("Login request failed:", networkError);
      formMessage.classList.add("is-error");
      formMessage.textContent = "Unable to reach the server. Check the connection and CORS settings.";
    } finally {
      submitButton.disabled = false;
      if (buttonText) {
        buttonText.textContent = "Sign in";
      }
    }
  });
})();

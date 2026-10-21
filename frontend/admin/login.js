(() => {
  "use strict";

  // Flask backend base URL
  const API_BASE = "https://portfolio-team-vibe5.vercel.app";

  // Redirect after successful login
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

  // Password visibility toggle
  togglePassword.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";

    passwordInput.type = isVisible ? "password" : "text";
    togglePassword.textContent = isVisible ? "Show" : "Hide";

    togglePassword.setAttribute(
      "aria-label",
      isVisible ? "Show password" : "Hide password"
    );

    togglePassword.setAttribute("aria-pressed", String(!isVisible));
    passwordInput.focus();
  });

  // Display or clear validation errors
  function setError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  // Validate email format
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Clear email validation error while typing
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();

    if (email && isValidEmail(email)) {
      setError(emailInput, emailError, "");
    }
  });

  // Clear password validation error while typing
  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
      setError(passwordInput, passwordError, "");
    }
  });

  // Forgot password message
  forgotLink.addEventListener("click", (event) => {
    event.preventDefault();

    formMessage.classList.remove("is-error");
    formMessage.textContent =
      "Password reset must be handled by your administrator or your configured account recovery service.";
  });

  // Submit login form
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear previous errors and messages
    setError(emailInput, emailError, "");
    setError(passwordInput, passwordError, "");

    formMessage.textContent = "";
    formMessage.classList.remove("is-error");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let firstInvalid = null;

    // Client-side validation
    if (!email) {
      setError(
        emailInput,
        emailError,
        "Enter your admin email address."
      );
      firstInvalid = emailInput;
    } else if (!isValidEmail(email)) {
      setError(
        emailInput,
        emailError,
        "Enter a valid email address."
      );
      firstInvalid = emailInput;
    }

    if (!password) {
      setError(
        passwordInput,
        passwordError,
        "Enter your password."
      );

      firstInvalid ||= passwordInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Disable button while login is processing
    submitButton.disabled = true;

    const buttonText = submitButton.querySelector("span:first-child");

    if (buttonText) {
      buttonText.textContent = "Signing in…";
    }

    try {
      // Send exactly one login request
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      });

      // Read server response
      let data = {};

      try {
        data = await response.json();
      } catch {
        // Response was not valid JSON
      }

      // Successful login
      if (response.ok && data.success) {
        formMessage.classList.remove("is-error");

        formMessage.textContent =
          data.message || "Login successful. Redirecting…";

        window.location.href = DASHBOARD_URL;
        return;
      }

      // Handle server errors
      formMessage.classList.add("is-error");

      if (response.status === 400) {
        formMessage.textContent =
          data.message || "Email and password are required.";

      } else if (response.status === 401) {
        formMessage.textContent =
          data.message || "Invalid email or password.";

        passwordInput.value = "";

        setError(
          passwordInput,
          passwordError,
          "Check your password and try again."
        );

        passwordInput.focus();

      } else if (response.status === 403) {
        formMessage.textContent =
          data.message || "This account is not authorised as admin.";

      } else if (response.status === 404) {
        formMessage.textContent =
          "Login endpoint not found. Check the backend route.";

      } else if (response.status >= 500) {
        formMessage.textContent =
          data.message || "Server error. Please try again later.";

      } else {
        formMessage.textContent =
          data.message || `Login failed. HTTP ${response.status}.`;
      }

    } catch (networkError) {
      // CORS errors, connection failures, or blocked requests
      console.error("Login request failed:", networkError);

      formMessage.classList.add("is-error");

      formMessage.textContent =
        "Unable to reach the server. Check the connection and CORS settings.";

    } finally {
      // Re-enable button
      submitButton.disabled = false;

      if (buttonText) {
        buttonText.textContent = "Sign in";
      }
    }
  });
})();

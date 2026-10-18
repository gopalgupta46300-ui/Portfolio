(() => {
  "use strict";

  /** Base URL of the Flask backend. Adjust if your server runs on a different port. */
  const API_BASE = "http://127.0.0.1:5000";

  /** Where to send the admin after a successful login. */
  const DASHBOARD_URL = "dashboard.html";

  const form         = document.querySelector("#login-form");
  const emailInput   = document.querySelector("#email");
  const passwordInput= document.querySelector("#password");
  const togglePassword = document.querySelector("#toggle-password");
  const emailError   = document.querySelector("#email-error");
  const passwordError= document.querySelector("#password-error");
  const formMessage  = document.querySelector("#form-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const forgotLink   = document.querySelector("#forgot-link");

  // ── Password visibility toggle ────────────────────────────────────────────
  togglePassword.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    togglePassword.textContent = isVisible ? "Show" : "Hide";
    togglePassword.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    togglePassword.setAttribute("aria-pressed", String(!isVisible));
    passwordInput.focus();
  });

  // ── Inline validation helpers ─────────────────────────────────────────────
  function setError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim() && isValidEmail(emailInput.value.trim())) {
      setError(emailInput, emailError, "");
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) setError(passwordInput, passwordError, "");
  });

  // ── Forgot password ───────────────────────────────────────────────────────
  forgotLink.addEventListener("click", (event) => {
    event.preventDefault();
    formMessage.classList.remove("is-error");
    formMessage.textContent =
      "Password reset must be handled by your administrator or your configured account recovery service.";
  });

  // ── Submit: call POST /api/admin/login ────────────────────────────────────
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear previous messages
    setError(emailInput, emailError, "");
    setError(passwordInput, passwordError, "");
    formMessage.textContent = "";
    formMessage.classList.remove("is-error");

    const email    = emailInput.value.trim();
    const password = passwordInput.value;
    let firstInvalid = null;

    // Client-side validation
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

    // Disable the button while the request is in flight
    submitButton.disabled = true;
    submitButton.querySelector("span:first-child").textContent = "Signing in…";

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",          // send/receive the session cookie
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON body (e.g. a proxy error page)
      }

      if (response.ok && data.success) {
        // ✅ Authenticated — redirect to the admin dashboard
        formMessage.classList.remove("is-error");
        formMessage.textContent = data.message || "Login successful. Redirecting…";
        window.location.href = DASHBOARD_URL;
        return;
      }

      // ❌ Server returned a known error
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
      } else if (response.status === 500) {
        formMessage.textContent = data.message || "Server error. Please try again later.";
      } else {
        formMessage.textContent = data.message || "An unexpected error occurred.";
      }

    } catch (networkError) {
      // Fetch itself threw — server unreachable, CORS blocked, etc.
      formMessage.classList.add("is-error");
      formMessage.textContent =
        "Unable to reach the server. Check your connection and try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span:first-child").textContent = "Sign in";
    }
  });
})();
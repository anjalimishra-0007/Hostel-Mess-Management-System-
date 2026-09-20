// ═══════════════════════════════════════════════════════════════════════════
// HostelHub — Client-Side JavaScript
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // ─── Navbar Toggle (Mobile) ───────────────────────────────────────────
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
      const icon = navbarToggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  // ─── Sidebar Toggle (Mobile) ─────────────────────────────────────────
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      const icon = sidebarToggle.querySelector('i');
      icon.classList.toggle('fa-chevron-left');
      icon.classList.toggle('fa-chevron-right');
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active')) {
      if (!sidebar.contains(e.target) && !navbarToggle?.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  // ─── Flash Message Auto-Dismiss ──────────────────────────────────────
  const flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach(msg => {
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      msg.style.animation = 'flashSlideIn 0.3s ease reverse forwards';
      setTimeout(() => msg.remove(), 300);
    }, 5000);

    // Close button
    const closeBtn = msg.querySelector('.flash-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        msg.style.animation = 'flashSlideIn 0.3s ease reverse forwards';
        setTimeout(() => msg.remove(), 300);
      });
    }
  });

  // ─── Active Sidebar Link ─────────────────────────────────────────────
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // ─── Star Rating Input ───────────────────────────────────────────────
  const starRating = document.getElementById('star-rating');
  const ratingInput = document.getElementById('rating-value');

  if (starRating && ratingInput) {
    const stars = starRating.querySelectorAll('.star-btn');
    let currentRating = 0;

    stars.forEach(star => {
      star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.value);
        ratingInput.value = currentRating;
        updateStars(currentRating);
      });

      star.addEventListener('mouseenter', () => {
        updateStars(parseInt(star.dataset.value));
      });
    });

    starRating.addEventListener('mouseleave', () => {
      updateStars(currentRating);
    });

    function updateStars(rating) {
      stars.forEach(s => {
        const val = parseInt(s.dataset.value);
        if (val <= rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    }
  }

  // ─── Role Selector Toggle (Register Page) ────────────────────────────
  const roleSelect = document.getElementById('role');
  const studentIdGroup = document.getElementById('studentId-group');

  if (roleSelect && studentIdGroup) {
    function toggleStudentId() {
      if (roleSelect.value === 'admin') {
        studentIdGroup.style.display = 'none';
      } else {
        studentIdGroup.style.display = 'block';
      }
    }

    roleSelect.addEventListener('change', toggleStudentId);
    toggleStudentId(); // Run on load
  }

  // ─── Confirmation Dialogs ────────────────────────────────────────────
  // Already handled via inline onsubmit on forms

  // ─── Form Validation Feedback ────────────────────────────────────────
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        if (!field.value || field.value.trim() === '') {
          field.style.borderColor = 'var(--danger)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      // Special: check star rating
      if (ratingInput && form.contains(ratingInput) && !ratingInput.value) {
        const starContainer = document.getElementById('star-rating');
        if (starContainer) {
          starContainer.style.outline = '2px solid var(--danger)';
          starContainer.style.borderRadius = '8px';
          starContainer.style.padding = '4px';
          valid = false;
        }
      }

      if (!valid) {
        e.preventDefault();
      }
    });
  });

  // ─── Password Match Validation ───────────────────────────────────────
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        e.preventDefault();
        confirmPassword.style.borderColor = 'var(--danger)';
        alert('Passwords do not match!');
      }
    });
  }

  // ─── Smooth Animations on Scroll ─────────────────────────────────────
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.feature-card, .stat-card, .section-card');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

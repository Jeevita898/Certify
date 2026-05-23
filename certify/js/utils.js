// /* ============================================================
//    utils.js — shared utility functions
//    ============================================================ */

// function initials(name) {
//   return (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
// }

// function formatDate(d) {
//   if (!d) return '—';
//   const dt = new Date(d + 'T00:00:00');
//   return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// }

// function formatDateShort(d) {
//   if (!d) return '—';
//   const dt = new Date(d + 'T00:00:00');
//   return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// }

// function showToast(msg, duration = 2800) {
//   let t = document.getElementById('toast');
//   if (!t) {
//     t = document.createElement('div');
//     t.id = 'toast';
//     t.className = 'toast';
//     document.body.appendChild(t);
//   }
//   t.textContent = msg;
//   t.classList.add('show');
//   clearTimeout(t._timer);
//   t._timer = setTimeout(() => t.classList.remove('show'), duration);
// }

// function openModal(id) {
//   document.getElementById(id).classList.add('open');
// }

// function closeModal(id) {
//   document.getElementById(id).classList.remove('open');
// }

// function setError(id, msg) {
//   const el = document.getElementById(id);
//   if (!el) return;
//   el.textContent = msg;
//   el.classList.toggle('hidden', !msg);
// }

// function clearError(id) { setError(id, ''); }

// function setLoading(btnId, loading) {
//   const btn = document.getElementById(btnId);
//   if (!btn) return;
//   btn.disabled = loading;
//   btn.dataset.orig = btn.dataset.orig || btn.textContent;
//   btn.textContent = loading ? 'Please wait...' : btn.dataset.orig;
// }

// function buildNavbar(role) {
//   const links = {
//     student: [
//       { href: 'student-dashboard.html', label: 'Dashboard' },
//       { href: 'events.html',            label: 'Events' },
//       { href: 'notifications.html',     label: 'Notifications' },
//       { href: 'student-profile.html',   label: 'Profile' },
//     ],
//     faculty: [
//       { href: 'faculty-dashboard.html', label: 'Dashboard' },
//       { href: 'faculty-profile.html',   label: 'Profile' },
//     ],
//     admin: [
//       { href: 'admin-dashboard.html',   label: 'Overview' },
//       { href: 'admin-events.html',      label: 'Events' },
//       { href: 'admin-faculty.html',     label: 'Faculty' },
//     ],
//   };

//   const current = window.location.pathname.split('/').pop();
//   const navLinks = (links[role] || []).map(l => `
//     <a href="${l.href}" class="nav-link ${current === l.href ? 'active' : ''}">${l.label}</a>
//   `).join('');

//   return `
//     <nav class="navbar">
//       <a href="../index.html" class="nav-brand">Certify <small>Activity Management</small></a>
//       <div class="nav-links">${navLinks}</div>
//       <div class="nav-actions">
//         <span id="navUserName" class="text-muted text-sm"></span>
//         <button class="btn btn-outline btn-sm" onclick="logout()">Sign out</button>
//       </div>
//     </nav>`;
// }

// function renderNavbar(role, userName) {
//   document.getElementById('navbar').innerHTML = buildNavbar(role);
//   const el = document.getElementById('navUserName');
//   if (el) el.textContent = userName;
// }

// function buildSidebar(items, activeHref) {
//   const current = window.location.pathname.split('/').pop();
//   return items.map(item => {
//     if (item.divider) return '<div class="sidebar-divider"></div>';
//     const isActive = item.href === current || item.href === activeHref;
//     return `<a href="${item.href}" class="sidebar-item ${isActive ? 'active' : ''}">
//       <span class="sidebar-icon">${item.icon}</span>${item.label}
//     </a>`;
//   }).join('');
// }

// function statusBadge(status) {
//   return `<span class="badge badge-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
// }

// function seatsLeft(ev) {
//   return ev.seats - ev.registered;
// }

// function validateRequired(fields) {
//   for (const f of fields) {
//     const el = document.getElementById(f.id);
//     if (!el) continue;
//     const val = el.value.trim();
//     if (!val) return `${f.label} is required.`;
//   }
//   return null;
// }


// second TimeRanges
// /* ============================================================
//    utils.js — shared utility functions
//    ============================================================ */

// function initials(name) {
//   return (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
// }

// // Handles both "2025-06-20" (date only) and full ISO strings from MongoDB
// function formatDate(d) {
//   if (!d) return '—';
//   const dt = new Date(d);
//   if (isNaN(dt)) return '—';
//   return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// }

// function showToast(msg, duration = 2800) {
//   let t = document.getElementById('toast');
//   if (!t) {
//     t = document.createElement('div');
//     t.id = 'toast';
//     t.className = 'toast';
//     document.body.appendChild(t);
//   }
//   t.textContent = msg;
//   t.classList.add('show');
//   clearTimeout(t._timer);
//   t._timer = setTimeout(() => t.classList.remove('show'), duration);
// }

// function openModal(id) {
//   document.getElementById(id).classList.add('open');
// }

// function closeModal(id) {
//   document.getElementById(id).classList.remove('open');
// }

// function setError(id, msg) {
//   const el = document.getElementById(id);
//   if (!el) return;
//   el.textContent = msg;
//   el.classList.toggle('hidden', !msg);
// }

// function clearError(id) { setError(id, ''); }

// function setLoading(btnId, loading) {
//   const btn = document.getElementById(btnId);
//   if (!btn) return;
//   btn.disabled = loading;
//   btn.dataset.orig = btn.dataset.orig || btn.textContent;
//   btn.textContent = loading ? 'Please wait...' : btn.dataset.orig;
// }

// // Detects if we're inside /pages/ subfolder and builds the home href correctly
// function getHomeHref() {
//   return '/index.html';
// }

// function buildNavbar(role) {
//   const links = {
//     student: [
//       { href: 'student-dashboard.html', label: 'Dashboard'     },
//       { href: 'events.html',            label: 'Events'        },
//       { href: 'notifications.html',     label: 'Notifications' },
//       { href: 'student-profile.html',   label: 'Profile'       },
//     ],
//     faculty: [
//       { href: 'faculty-dashboard.html', label: 'Dashboard' },
//       { href: 'faculty-profile.html',   label: 'Profile'   },
//     ],
//     admin: [
//       { href: 'admin-dashboard.html', label: 'Overview' },
//       { href: 'admin-events.html',    label: 'Events'   },
//       { href: 'admin-faculty.html',   label: 'Faculty'  },
//     ],
//   };

//   const current  = window.location.pathname.split('/').pop();
//   const homeHref = getHomeHref();

//   const navLinks = (links[role] || []).map(l => `
//     <a href="${l.href}" class="nav-link ${current === l.href ? 'active' : ''}">${l.label}</a>
//   `).join('');

//   return `
//     <nav class="navbar">
//       <a href="${homeHref}" class="nav-brand">Certify <small>Activity Management</small></a>
//       <div class="nav-links">${navLinks}</div>
//       <div class="nav-actions">
//         <span id="navUserName" class="text-muted text-sm"></span>
//         <button class="btn btn-outline btn-sm" onclick="logout()">Sign out</button>
//       </div>
//     </nav>`;
// }

// function renderNavbar(role, userName) {
//   document.getElementById('navbar').innerHTML = buildNavbar(role);
//   const el = document.getElementById('navUserName');
//   if (el) el.textContent = userName;
// }

// function buildSidebar(items) {
//   const current = window.location.pathname.split('/').pop();
//   return items.map(item => {
//     if (item.divider) return '<div class="sidebar-divider"></div>';
//     const isActive = item.href === current;
//     return `<a href="${item.href}" class="sidebar-item ${isActive ? 'active' : ''}">
//       <span class="sidebar-icon">${item.icon}</span>${item.label}
//     </a>`;
//   }).join('');
// }

// function statusBadge(status) {
//   const label = status.charAt(0).toUpperCase() + status.slice(1);
//   return `<span class="badge badge-${status}">${label}</span>`;
// }


// 3rd TimeRanges
/* ============================================================
   utils.js — shared utility functions
   ============================================================ */

// function initials(name) {
//   return (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
// }

// // Handles both "2025-06-20" (date only) and full ISO strings from MongoDB
// function formatDate(d) {
//   if (!d) return '—';
//   const dt = new Date(d);
//   if (isNaN(dt)) return '—';
//   return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// }

// function showToast(msg, duration = 2800) {
//   let t = document.getElementById('toast');
//   if (!t) {
//     t = document.createElement('div');
//     t.id = 'toast';
//     t.className = 'toast';
//     document.body.appendChild(t);
//   }
//   t.textContent = msg;
//   t.classList.add('show');
//   clearTimeout(t._timer);
//   t._timer = setTimeout(() => t.classList.remove('show'), duration);
// }

// function openModal(id) {
//   document.getElementById(id).classList.add('open');
// }

// function closeModal(id) {
//   document.getElementById(id).classList.remove('open');
// }

// function setError(id, msg) {
//   const el = document.getElementById(id);
//   if (!el) return;
//   el.textContent = msg;
//   el.classList.toggle('hidden', !msg);
// }

// function clearError(id) { setError(id, ''); }

// function setLoading(btnId, loading) {
//   const btn = document.getElementById(btnId);
//   if (!btn) return;
//   btn.disabled = loading;
//   btn.dataset.orig = btn.dataset.orig || btn.textContent;
//   btn.textContent = loading ? 'Please wait...' : btn.dataset.orig;
// }

// // Detects if we're inside /pages/ subfolder and builds the home href correctly
// function getHomeHref() {
//   return '/index.html';
// }

// function buildNavbar(role) {
//   const links = {
//     student: [
//       { href: 'student-dashboard.html', label: 'Dashboard'     },
//       { href: 'events.html',            label: 'Events'        },
//       { href: 'notifications.html',     label: 'Notifications' },
//       { href: 'student-profile.html',   label: 'Profile'       },
//     ],
//     faculty: [
//       { href: 'faculty-dashboard.html', label: 'Dashboard' },
//       { href: 'faculty-profile.html',   label: 'Profile'   },
//     ],
//     admin: [
//       { href: 'admin-dashboard.html', label: 'Overview' },
//       { href: 'admin-events.html',    label: 'Events'   },
//       { href: 'admin-faculty.html',   label: 'Faculty'  },
//     ],
//   };

//   const current  = window.location.pathname.split('/').pop();
//   const homeHref = getHomeHref();

//   const navLinks = (links[role] || []).map(l => `
//     <a href="${l.href}" class="nav-link ${current === l.href ? 'active' : ''}">${l.label}</a>
//   `).join('');

//   return `
//     <nav class="navbar">
//       <a href="${homeHref}" class="nav-brand">Certify <small>Activity Management</small></a>
//       <div class="nav-links">${navLinks}</div>
//       <div class="nav-actions">
//         <span id="navUserName" class="text-muted text-sm"></span>
//         <button class="btn btn-outline btn-sm" onclick="logout()">Sign out</button>
//       </div>
//     </nav>`;
// }

// function renderNavbar(role, userName) {
//   document.getElementById('navbar').innerHTML = buildNavbar(role);
//   const el = document.getElementById('navUserName');
//   if (el) el.textContent = userName;
// }

// function buildSidebar(items) {
//   const current = window.location.pathname.split('/').pop();
//   return items.map(item => {
//     if (item.divider) return '<div class="sidebar-divider"></div>';
//     const isActive = item.href === current;
//     return `<a href="${item.href}" class="sidebar-item ${isActive ? 'active' : ''}">
//       <span class="sidebar-icon">${item.icon}</span>${item.label}
//     </a>`;
//   }).join('');
// }

// function statusBadge(status) {
//   const label = status.charAt(0).toUpperCase() + status.slice(1);
//   return `<span class="badge badge-${status}">${label}</span>`;
// }


//4th time

/* ============================================================
   utils.js — shared utility functions
   ============================================================ */

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(msg, duration = 2800) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}
function clearError(id) { setError(id, ''); }

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.orig = btn.dataset.orig || btn.textContent;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.orig;
}

// All pages inside /pages/ — brand always goes up one level to index.html
// pages link to each other by filename only (same directory)
function buildNavbar(role) {
  const links = {
    student: [
      { href: 'student-dashboard.html', label: 'Dashboard'     },
      { href: 'events.html',            label: 'Events'        },
      { href: 'leaderboard.html',       label: 'Leaderboard'   },
      { href: 'notifications.html',     label: 'Notifications' },
      { href: 'student-profile.html',   label: 'Profile'       },
    ],
    faculty: [
      { href: 'faculty-dashboard.html', label: 'Dashboard' },
      { href: 'leaderboard.html',       label: 'Leaderboard'},
      { href: 'faculty-profile.html',   label: 'Profile'   },
    ],
    admin: [
      { href: 'admin-dashboard.html', label: 'Overview' },
      { href: 'admin-events.html',    label: 'Events'   },
      { href: 'admin-faculty.html',   label: 'Faculty'  },
      { href: 'leaderboard.html',     label: 'Leaderboard' }
    ],
  };

  const current = window.location.pathname.split('/').pop();

  const navLinks = (links[role] || []).map(l => `
    <a href="${l.href}" class="nav-link ${current === l.href ? 'active' : ''}">${l.label}</a>
  `).join('');

  // Pages inside /pages/ → brand goes ../index.html (up one level)
  const brandHref = '../index.html';

  return `
    <nav class="navbar">
      <a href="${brandHref}" class="nav-brand">Certify <small>Activity Management</small></a>
      <div class="nav-links">${navLinks}</div>
      <div class="nav-actions">
        <span id="navUserName" class="text-muted text-sm"></span>
        <button class="btn btn-outline btn-sm" onclick="logout()">Sign out</button>
      </div>
    </nav>`;
}

function renderNavbar(role, userName) {
  document.getElementById('navbar').innerHTML = buildNavbar(role);
  const el = document.getElementById('navUserName');
  if (el) el.textContent = userName;
}

function buildSidebar(items) {
  const current = window.location.pathname.split('/').pop();
  return items.map(item => {
    if (item.divider) return '<div class="sidebar-divider"></div>';
    const isActive = item.href === current;
    return `<a href="${item.href}" class="sidebar-item ${isActive ? 'active' : ''}">
      <span class="sidebar-icon">${item.icon}</span>${item.label}
    </a>`;
  }).join('');
}

function statusBadge(status) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span class="badge badge-${status}">${label}</span>`;
}

// ── Socket.io Client Initialization ─────────────────────────
(function initSocket() {
  const script = document.createElement('script');
  script.src = 'http://localhost:5000/socket.io/socket.io.js';
  script.onload = () => {
    if (window.io) {
      const socket = window.io('http://localhost:5000');
      
      socket.on('connect', () => {
        console.log('Connected to real-time notifications');
        // Join user room if logged in
        const token = localStorage.getItem('cert_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload.id) {
              socket.emit('join', payload.id);
            }
          } catch(e) {}
        }
      });

      socket.on('notification', (data) => {
        showToast(`🔔 ${data.title}: ${data.message}`, 5000);
      });
    }
  };
  document.head.appendChild(script);
})();
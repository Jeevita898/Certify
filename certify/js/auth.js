/* ============================================================
   auth.js — API calls, JWT session helpers
   Updated for dynamic points approval + dashboards
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';

/* ============================================================
   PATH HELPERS
   ============================================================ */

function inPagesFolder() {
  return window.location.pathname.includes('/pages/');
}

function pageUrl(filename) {
  return inPagesFolder() ? filename : 'pages/' + filename;
}

function homeUrl() {
  return inPagesFolder() ? '../index.html' : 'index.html';
}

/* ============================================================
   SESSION HELPERS
   ============================================================ */

function saveSession(user, token) {
  localStorage.setItem('cert_token', token);
  localStorage.setItem('cert_user', JSON.stringify(user));
}

function getSession() {
  const token = localStorage.getItem('cert_token');
  const user = localStorage.getItem('cert_user');

  if (!token || !user) return null;

  return JSON.parse(user);
}

function clearSession() {
  localStorage.removeItem('cert_token');
  localStorage.removeItem('cert_user');
}

function getToken() {
  return localStorage.getItem('cert_token');
}

/* ============================================================
   AUTH GUARDS
   ============================================================ */

function requireAuth(role) {

  const user = getSession();

  if (!user) {
    window.location.href = pageUrl('login.html');
    return null;
  }

  if (role && user.role !== role) {
    alert('Access denied');
    redirectByRole(user.role);
    return null;
  }

  return user;
}

function redirectByRole(role) {

  const map = {
    student: pageUrl('student-dashboard.html'),
    faculty: pageUrl('faculty-dashboard.html'),
    admin: pageUrl('admin-dashboard.html')
  };

  window.location.href =
    map[role] || pageUrl('login.html');
}

function logout() {
  clearSession();
  window.location.href = homeUrl();
}

/* ============================================================
   FETCH WRAPPER
   ============================================================ */

async function apiFetch(endpoint, options = {}) {

  const token = getToken();

  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${API_BASE}${endpoint}`,
    { ...options, headers }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

/* ============================================================
   AUTH
   ============================================================ */

async function doLogin(email, password) {

  try {

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    saveSession(data.user, data.token);

    return {
      success: true,
      user: data.user
    };

  } catch (err) {

    return {
      success: false,
      message: err.message
    };

  }
}

async function doRegister(formData) {

  try {

    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    saveSession(data.user, data.token);

    return {
      success: true,
      user: data.user
    };

  } catch (err) {

    return {
      success: false,
      message: err.message
    };

  }
}

/* ============================================================
   COMMON
   ============================================================ */

async function getFacultyList() {

  try {

    const data =
      await apiFetch('/faculty/list');

    return data.faculty || [];

  } catch {

    return [];

  }
}

/* ============================================================
   STUDENT
   ============================================================ */

async function getStudentProfile() {
  return apiFetch('/students/profile');
}

async function updateStudentProfile(body) {
  return apiFetch('/students/profile', {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

async function getStudentStats() {
  return apiFetch('/students/stats');
}

async function getMyActivities() {
  return apiFetch('/activities/my');
}

async function getMyEvents() {
  return apiFetch('/events/my');
}

async function uploadActivity(formData) {
  return apiFetch('/activities', {
    method: 'POST',
    body: formData
  });
}

/* ============================================================
   FACULTY
   ============================================================ */

async function getFacultyProfile() {
  return apiFetch('/faculty/profile');
}

async function getAssignedStudents() {
  return apiFetch('/faculty/students');
}

async function getFacultyActivities(status = '') {

  const q = status
    ? `?status=${status}`
    : '';

  return apiFetch(
    `/activities/faculty${q}`
  );
}

/* IMPORTANT UPDATED FUNCTION */

async function validateActivity(
  id,
  status,
  remark = '',
  points = 0
) {

  return apiFetch(
    `/activities/${id}/validate`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        remark,
        points
      })
    }
  );
}

/* Faculty PDF Report */

function downloadFacultyPDF() {
  window.open(
    `${API_BASE}/reports/faculty-report`,
    '_blank'
  );
}

/* ============================================================
   EVENTS
   ============================================================ */

async function getEvents(type = '') {

  const q = type
    ? `?type=${type}`
    : '';

  return apiFetch(`/events${q}`);
}

async function registerForEvent(eventId) {

  return apiFetch(
    `/events/${eventId}/register`,
    { method: 'POST' }
  );
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */

async function getNotifications() {
  return apiFetch('/notifications');
}

async function markNotifRead(id) {
  return apiFetch(
    `/notifications/${id}/read`,
    { method: 'PATCH' }
  );
}

async function markAllNotifsRead() {
  return apiFetch(
    '/notifications/read-all',
    { method: 'PATCH' }
  );
}

/* ============================================================
   ADMIN
   ============================================================ */

async function getAdminStats() {
  return apiFetch('/admin/stats');
}

async function getAllStudents() {
  return apiFetch('/admin/students');
}

async function getAllActivitiesAdmin() {
  return apiFetch('/admin/activities');
}

async function createEvent(body) {
  return apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function updateEvent(id, body) {
  return apiFetch(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

async function deleteEvent(id) {
  return apiFetch(`/events/${id}`, {
    method: 'DELETE'
  });
}

async function getAllEvents(type = '') {

  const q = type
    ? `?type=${type}`
    : '';

  return apiFetch(`/events${q}`);
}
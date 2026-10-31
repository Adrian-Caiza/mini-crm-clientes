/* ================================================================
   Mini CRM — app.js
   Vanilla JavaScript application logic.
   No frameworks or external libraries required.
   ================================================================ */

'use strict';

/* ================================================================
   1. API ROUTE BUILDERS
   ================================================================ */
const API = {
  clientList:   '/api/clients/',
  clientCreate: '/api/clients/create/',
  /** @param {number} id */
  clientDetail: (id) => `/api/clients/${id}/`,
  /** @param {number} id */
  clientUpdate: (id) => `/api/clients/${id}/update/`,
  /** @param {number} id */
  clientDelete: (id) => `/api/clients/${id}/delete/`,
};

/* ================================================================
   2. APPLICATION STATE
   ================================================================ */
const appState = {
  /** ID of the client currently being edited (null for create mode). */
  currentEditId: null,
  /** ID of the client pending deletion. */
  pendingDeleteId: null,
  /** Human-readable name of the client pending deletion. */
  pendingDeleteName: null,
};

/* ================================================================
   3. DOM ELEMENT REFERENCES
   Gathered once on DOMContentLoaded to avoid repeated queries.
   ================================================================ */
let dom = {};

function cacheDomReferences() {
  dom = {
    // Modal
    modalOverlay:   document.getElementById('modal-overlay'),
    clientModal:    document.getElementById('client-modal'),
    modalTitle:     document.getElementById('modal-title'),
    modalSubtitle:  document.getElementById('modal-subtitle'),
    modalCloseBtn:  document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    clientForm:     document.getElementById('client-form'),
    submitBtn:      document.getElementById('submit-btn'),

    // Delete confirm dialog
    confirmOverlay:   document.getElementById('confirm-overlay'),
    confirmClientName: document.getElementById('confirm-client-name'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),

    // Table & toolbar
    tableBody:    document.getElementById('table-body'),
    tableCount:   document.getElementById('table-count'),
    emptyState:   document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateText:  document.getElementById('empty-state-text'),
    searchInput:  document.getElementById('search-input'),
    filterSelect: document.getElementById('filter-select'),

    // New-client triggers
    newClientBtn:         document.getElementById('new-client-btn'),
    sidebarNewClientBtn:  document.getElementById('sidebar-new-client-btn'),

    // Toast container
    toastContainer: document.getElementById('toast-container'),

    // Mobile sidebar
    hamburgerBtn:   document.getElementById('hamburger-btn'),
    sidebar:        document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
  };
}

/* ================================================================
   4. CSRF TOKEN HELPER
   Reads the csrfmiddlewaretoken from the hidden form input.
   ================================================================ */
function getCsrfToken() {
  const tokenInput = document.querySelector('[name=csrfmiddlewaretoken]');
  return tokenInput ? tokenInput.value : '';
}

/* ================================================================
   5. INITIALISATION
   ================================================================ */
function initDashboard() {
  cacheDomReferences();
  attachEventListeners();
  applyFilters();        // Set initial table-count correctly
  animateCounters();     // Animate stat card numbers on load
}

function attachEventListeners() {
  // Open create modal
  dom.newClientBtn?.addEventListener('click', openCreateModal);
  dom.sidebarNewClientBtn?.addEventListener('click', () => {
    closeMobileSidebar();
    openCreateModal();
  });

  // Close modal
  dom.modalCloseBtn?.addEventListener('click', closeModal);
  dom.modalCancelBtn?.addEventListener('click', closeModal);
  dom.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === dom.modalOverlay) closeModal();
  });

  // Form submit
  dom.clientForm?.addEventListener('submit', handleFormSubmit);

  // Delete confirmation dialog
  dom.confirmCancelBtn?.addEventListener('click', closeConfirmDialog);
  dom.confirmDeleteBtn?.addEventListener('click', executeDelete);
  dom.confirmOverlay?.addEventListener('click', (e) => {
    if (e.target === dom.confirmOverlay) closeConfirmDialog();
  });

  // Search & filter
  dom.searchInput?.addEventListener('input', debounce(applyFilters, 180));
  dom.filterSelect?.addEventListener('change', applyFilters);

  // Mobile sidebar
  dom.hamburgerBtn?.addEventListener('click', toggleMobileSidebar);
  dom.sidebarOverlay?.addEventListener('click', closeMobileSidebar);

  // Global keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
}

/* ================================================================
   6. KEYBOARD SHORTCUTS
   ================================================================ */
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    if (dom.confirmOverlay?.classList.contains('open')) {
      closeConfirmDialog();
    } else if (dom.modalOverlay?.classList.contains('open')) {
      closeModal();
    }
  }
}

/* ================================================================
   7. MOBILE SIDEBAR
   ================================================================ */
function toggleMobileSidebar() {
  dom.sidebar?.classList.toggle('open');
  dom.sidebarOverlay?.classList.toggle('open');
}

function closeMobileSidebar() {
  dom.sidebar?.classList.remove('open');
  dom.sidebarOverlay?.classList.remove('open');
}

/* ================================================================
   8. MODAL — OPEN / CLOSE
   ================================================================ */
/**
 * Opens the modal in "create" mode, clearing the form.
 */
function openCreateModal() {
  appState.currentEditId = null;
  setModalMode('create');
  clearForm();
  openModal();
}

/**
 * Opens the modal in "edit" mode and fetches client data to pre-fill.
 * @param {number} clientId
 */
async function openEditModal(clientId) {
  appState.currentEditId = clientId;
  setModalMode('edit');
  clearForm();

  // Show modal immediately with loading state on submit button
  openModal();
  setSubmitLoading(true);

  try {
    const response = await fetch(API.clientDetail(clientId), {
      headers: { 'X-CSRFToken': getCsrfToken() },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const clientData = await response.json();
    populateForm(clientData);
  } catch (err) {
    closeModal();
    showToast('Error', 'No se pudo cargar la información del cliente.', 'error');
    console.error('[CRM] openEditModal error:', err);
  } finally {
    setSubmitLoading(false);
  }
}

/**
 * Configures modal title, subtitle, and submit button text.
 * @param {'create'|'edit'} mode
 */
function setModalMode(mode) {
  if (mode === 'create') {
    dom.modalTitle.textContent     = 'Nuevo Cliente';
    dom.modalSubtitle.textContent  = 'Completa la información para registrar un nuevo cliente.';
    dom.submitBtn.textContent      = 'Crear Cliente';
  } else {
    dom.modalTitle.textContent     = 'Editar Cliente';
    dom.modalSubtitle.textContent  = 'Actualiza la información del cliente.';
    dom.submitBtn.textContent      = 'Guardar Cambios';
  }
}

function openModal() {
  dom.modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus first focusable field after animation starts
  setTimeout(() => {
    const firstInput = dom.clientForm?.querySelector('input:not([type=hidden])');
    firstInput?.focus();
  }, 120);
}

function closeModal() {
  dom.modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  clearFormErrors();
}

/* ================================================================
   9. FORM UTILITIES
   ================================================================ */
function clearForm() {
  dom.clientForm?.reset();
  clearFormErrors();
}

/**
 * Fills the form fields with data from an API response.
 * @param {{ name, email, status, company, phone }} data
 */
function populateForm(data) {
  const f = dom.clientForm;
  if (!f) return;
  f.querySelector('[name=name]').value    = data.name    ?? '';
  f.querySelector('[name=email]').value   = data.email   ?? '';
  f.querySelector('[name=status]').value  = data.status  ?? 'Prospecto';
  f.querySelector('[name=company]').value = data.company ?? '';
  f.querySelector('[name=phone]').value   = data.phone   ?? '';
}

function clearFormErrors() {
  dom.clientForm?.querySelectorAll('.form-error').forEach((el) => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  dom.clientForm?.querySelectorAll('.form-control.error').forEach((el) => {
    el.classList.remove('error');
  });
}

/**
 * Displays backend validation errors next to the relevant fields.
 * @param {Object} errors  Django form errors (field → [messages])
 */
function displayFormErrors(errors) {
  Object.entries(errors).forEach(([field, messages]) => {
    const errorEl = document.getElementById(`error-${field}`);
    const inputEl = dom.clientForm?.querySelector(`[name="${field}"]`);

    if (errorEl) {
      errorEl.textContent = messages.join(' ');
      errorEl.classList.add('visible');
    }

    if (inputEl) {
      inputEl.classList.add('error');
      // Auto-clear error on next user input
      inputEl.addEventListener('input', () => {
        inputEl.classList.remove('error');
        if (errorEl) errorEl.classList.remove('visible');
      }, { once: true });
    }
  });
}

function setSubmitLoading(isLoading) {
  if (!dom.submitBtn) return;
  dom.submitBtn.disabled = isLoading;
  dom.submitBtn.classList.toggle('btn--loading', isLoading);
}

/* ================================================================
   10. FORM SUBMISSION (Create & Update)
   ================================================================ */
async function handleFormSubmit(event) {
  event.preventDefault();
  clearFormErrors();

  const f = dom.clientForm;
  const payload = {
    name:    f.querySelector('[name=name]').value.trim(),
    email:   f.querySelector('[name=email]').value.trim(),
    status:  f.querySelector('[name=status]').value,
    company: f.querySelector('[name=company]').value.trim(),
    phone:   f.querySelector('[name=phone]').value.trim(),
  };

  const isEdit = appState.currentEditId !== null;
  const url    = isEdit
    ? API.clientUpdate(appState.currentEditId)
    : API.clientCreate;

  setSubmitLoading(true);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      closeModal();
      showToast('Éxito', result.message, 'success');

      if (isEdit) {
        updateTableRow(result.client);
        refreshStatCounts();
      } else {
        insertTableRow(result.client);
        // Increment total and correct status counter
        animateStat('stat-total', +1);
        animateStatByStatus(result.client.status, +1);
      }

      applyFilters();
    } else {
      displayFormErrors(result.errors ?? {});
    }
  } catch (err) {
    showToast('Error de red', 'No se pudo conectar con el servidor.', 'error');
    console.error('[CRM] handleFormSubmit error:', err);
  } finally {
    setSubmitLoading(false);
  }
}

/* ================================================================
   11. DELETE — PROMPT & EXECUTE
   ================================================================ */
/**
 * Opens the delete-confirmation dialog for a given client.
 * Called inline from the table row action button.
 * @param {number} clientId
 * @param {string} clientName
 */
function promptDeleteClient(clientId, clientName) {
  appState.pendingDeleteId   = clientId;
  appState.pendingDeleteName = clientName;

  if (dom.confirmClientName) {
    dom.confirmClientName.textContent = clientName;
  }

  dom.confirmOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeConfirmDialog() {
  dom.confirmOverlay.classList.remove('open');
  document.body.style.overflow = '';
  appState.pendingDeleteId   = null;
  appState.pendingDeleteName = null;
}

async function executeDelete() {
  if (!appState.pendingDeleteId) return;

  dom.confirmDeleteBtn.disabled = true;
  dom.confirmDeleteBtn.classList.add('btn--loading');

  try {
    const response = await fetch(API.clientDelete(appState.pendingDeleteId), {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
    });

    const result = await response.json();

    if (result.success) {
      const row = dom.tableBody.querySelector(
        `tr[data-client-id="${appState.pendingDeleteId}"]`
      );

      if (row) {
        const deletedStatus = row.dataset.clientStatus;
        // Animate row out before removal
        row.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
        row.style.opacity    = '0';
        row.style.transform  = 'translateX(-16px)';

        setTimeout(() => {
          row.remove();
          animateStat('stat-total', -1);
          animateStatByStatus(deletedStatus, -1);
          applyFilters();
        }, 290);
      }

      closeConfirmDialog();
      showToast('Eliminado', result.message, 'success');
    } else {
      showToast('Error', 'No se pudo eliminar el cliente.', 'error');
    }
  } catch (err) {
    showToast('Error de red', 'No se pudo conectar con el servidor.', 'error');
    console.error('[CRM] executeDelete error:', err);
  } finally {
    dom.confirmDeleteBtn.disabled = false;
    dom.confirmDeleteBtn.classList.remove('btn--loading');
  }
}

/* ================================================================
   12. TABLE ROW BUILDERS
   ================================================================ */
/**
 * Generates the inner HTML for a client table row.
 * @param {{ id, name, company, email, phone, status }} client
 * @returns {string}  HTML string for the <tr> element's children
 */
function buildRowInnerHtml(client) {
  const avatarLetter = (client.name || '?').charAt(0).toUpperCase();
  const statusClass  = getStatusBadgeClass(client.status);
  const safeQuote    = (s) => escapeHtml(s || '').replace(/'/g, '&#39;');

  return `
    <td>
      <div class="client-name-cell">
        <div class="client-avatar" aria-hidden="true">${avatarLetter}</div>
        <span class="client-full-name">${escapeHtml(client.name)}</span>
      </div>
    </td>
    <td class="cell-company">${escapeHtml(client.company) || '—'}</td>
    <td class="cell-email">${escapeHtml(client.email)}</td>
    <td class="cell-phone">${escapeHtml(client.phone) || '—'}</td>
    <td>
      <span class="status-badge ${statusClass}">${escapeHtml(client.status)}</span>
    </td>
    <td>
      <div class="actions-cell">
        <button
          class="btn btn--icon"
          type="button"
          onclick="openEditModal(${client.id})"
          title="Editar ${escapeHtml(client.name)}"
          aria-label="Editar cliente ${escapeHtml(client.name)}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          class="btn btn--icon btn--danger-icon"
          type="button"
          onclick="promptDeleteClient(${client.id}, '${safeQuote(client.name)}')"
          title="Eliminar ${escapeHtml(client.name)}"
          aria-label="Eliminar cliente ${escapeHtml(client.name)}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </td>
  `;
}

/**
 * Creates a new <tr> element and prepends it to the table body.
 * @param {{ id, name, company, email, phone, status, created_at }} client
 */
function insertTableRow(client) {
  const row = document.createElement('tr');
  setRowDataAttributes(row, client);
  row.innerHTML = buildRowInnerHtml(client);
  row.classList.add('row-new');
  dom.tableBody.insertBefore(row, dom.tableBody.firstChild);
}

/**
 * Finds an existing row and updates its content in-place.
 * @param {{ id, name, company, email, phone, status }} client
 */
function updateTableRow(client) {
  const row = dom.tableBody.querySelector(`tr[data-client-id="${client.id}"]`);
  if (!row) return;

  setRowDataAttributes(row, client);
  row.innerHTML = buildRowInnerHtml(client);

  // Pulse animation to signal the row was updated
  row.classList.remove('row-new');
  void row.offsetWidth; // Force reflow to restart animation
  row.classList.add('row-new');
}

/**
 * Sets dataset attributes used by the client-side filter.
 * @param {HTMLTableRowElement} row
 * @param {{ id, name, company, email, phone, status, created_at }} client
 */
function setRowDataAttributes(row, client) {
  row.dataset.clientId      = client.id;
  row.dataset.clientName    = client.name    ?? '';
  row.dataset.clientCompany = client.company ?? '';
  row.dataset.clientEmail   = client.email   ?? '';
  row.dataset.clientPhone   = client.phone   ?? '';
  row.dataset.clientStatus  = client.status  ?? '';
  row.dataset.clientCreated = client.created_at ?? '';
}

/**
 * Returns the CSS class for a status badge.
 * @param {string} status
 * @returns {string}
 */
function getStatusBadgeClass(status) {
  const map = {
    Prospecto: 'status-badge--prospecto',
    Cliente:   'status-badge--cliente',
    Inactivo:  'status-badge--inactivo',
  };
  return map[status] ?? '';
}

/* ================================================================
   13. SEARCH & FILTER
   ================================================================ */
/**
 * Shows/hides table rows based on current search term and status filter.
 * Updates the client count badge and empty-state visibility.
 */
function applyFilters() {
  const search       = (dom.searchInput?.value ?? '').trim().toLowerCase();
  const statusFilter = dom.filterSelect?.value ?? '';

  const rows      = dom.tableBody?.querySelectorAll('tr[data-client-id]') ?? [];
  let visibleCount = 0;

  rows.forEach((row) => {
    const nameMatch    = (row.dataset.clientName    ?? '').toLowerCase().includes(search);
    const companyMatch = (row.dataset.clientCompany ?? '').toLowerCase().includes(search);
    const statusMatch  = !statusFilter || row.dataset.clientStatus === statusFilter;
    const searchMatch  = !search || nameMatch || companyMatch;

    if (searchMatch && statusMatch) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  // Update count badge
  if (dom.tableCount) {
    dom.tableCount.textContent = `${visibleCount} cliente${visibleCount !== 1 ? 's' : ''}`;
  }

  // Show/hide empty state
  const isEmpty = visibleCount === 0;
  if (dom.emptyState) {
    dom.emptyState.classList.toggle('visible', isEmpty);
  }

  // Contextualise empty-state message
  if (isEmpty && dom.emptyStateTitle && dom.emptyStateText) {
    const noRecordsAtAll = rows.length === 0;
    dom.emptyStateTitle.textContent = noRecordsAtAll
      ? 'No hay clientes registrados'
      : 'Sin resultados';
    dom.emptyStateText.textContent = noRecordsAtAll
      ? 'Crea tu primer cliente haciendo clic en "Nuevo Cliente".'
      : 'Ningún cliente coincide con tu búsqueda. Intenta con otros términos.';
  }
}

/* ================================================================
   14. STAT CARD ANIMATIONS
   ================================================================ */
/**
 * Animates all stat card counter elements on page load.
 */
function animateCounters() {
  document.querySelectorAll('[data-count-target]').forEach((el) => {
    const target = parseInt(el.dataset.countTarget, 10) || 0;
    animateNumber(el, 0, target, 900);
  });
}

/**
 * Increments or decrements a stat card by a delta, animating the transition.
 * @param {string} statId   Element ID (e.g. 'stat-total')
 * @param {number} delta    +1 or -1
 */
function animateStat(statId, delta) {
  const el = document.getElementById(statId);
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 0;
  animateNumber(el, current, Math.max(0, current + delta));
}

/**
 * Maps a client status string to the correct stat card ID and animates it.
 * @param {string} status
 * @param {number} delta
 */
function animateStatByStatus(status, delta) {
  const statusMap = {
    Prospecto: 'stat-prospecto',
    Cliente:   'stat-activo',
    Inactivo:  'stat-inactivo',
  };
  const id = statusMap[status];
  if (id) animateStat(id, delta);
}

/**
 * Recalculates all four stat counters by reading the current DOM rows.
 * Called after an edit (status may have changed).
 */
function refreshStatCounts() {
  const rows       = Array.from(dom.tableBody?.querySelectorAll('tr[data-client-id]') ?? []);
  const total      = rows.length;
  const prospectos = rows.filter((r) => r.dataset.clientStatus === 'Prospecto').length;
  const activos    = rows.filter((r) => r.dataset.clientStatus === 'Cliente').length;
  const inactivos  = rows.filter((r) => r.dataset.clientStatus === 'Inactivo').length;

  animateStat('stat-total',     (parseInt(document.getElementById('stat-total')?.textContent, 10) || 0) - total);
  animateNumber(document.getElementById('stat-total'),     parseInt(document.getElementById('stat-total')?.textContent,     10) || 0, total);
  animateNumber(document.getElementById('stat-prospecto'), parseInt(document.getElementById('stat-prospecto')?.textContent, 10) || 0, prospectos);
  animateNumber(document.getElementById('stat-activo'),    parseInt(document.getElementById('stat-activo')?.textContent,    10) || 0, activos);
  animateNumber(document.getElementById('stat-inactivo'),  parseInt(document.getElementById('stat-inactivo')?.textContent,  10) || 0, inactivos);
}

/**
 * Smooth numeric counter animation using requestAnimationFrame.
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {number} [duration=350]  milliseconds
 */
function animateNumber(el, from, to, duration = 350) {
  if (!el) return;
  const startTime = performance.now();
  const diff = to - from;

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(from + diff * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/** Cubic ease-out timing function. */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ================================================================
   15. TOAST NOTIFICATIONS
   ================================================================ */
const TOAST_ICON_SVG = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
};

const TOAST_LABEL = {
  success: 'Éxito',
  error:   'Error',
  info:    'Info',
};

/**
 * Displays a toast notification.
 * @param {string} title
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='info']
 * @param {number} [autoHideMs=5000]
 */
function showToast(title, message, type = 'info', autoHideMs = 5000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-label', `${TOAST_LABEL[type] ?? type}: ${title}`);

  toast.innerHTML = `
    <div class="toast__icon">${TOAST_ICON_SVG[type] ?? TOAST_ICON_SVG.info}</div>
    <div class="toast__content">
      <div class="toast__title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast__message">${escapeHtml(message)}</div>` : ''}
    </div>
    <button
      class="toast__close"
      type="button"
      aria-label="Cerrar notificación"
      onclick="dismissToast(this.closest('.toast'))"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  `;

  dom.toastContainer.appendChild(toast);

  // Schedule auto-dismiss
  toast._autoHideTimer = setTimeout(() => dismissToast(toast), autoHideMs);
}

/**
 * Animates a toast out and removes it from the DOM.
 * @param {HTMLElement} toastEl
 */
function dismissToast(toastEl) {
  if (!toastEl || !toastEl.parentElement) return;
  clearTimeout(toastEl._autoHideTimer);
  toastEl.classList.add('removing');
  setTimeout(() => toastEl.remove(), 250);
}

/* ================================================================
   16. UTILITY FUNCTIONS
   ================================================================ */
/**
 * Escapes HTML special characters to prevent XSS when inserting
 * user-supplied content via innerHTML.
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}

/**
 * Returns a debounced version of the given function.
 * @param {Function} fn
 * @param {number} delay  milliseconds
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ================================================================
   17. PUBLIC API
   Functions that must be accessible from inline onclick handlers
   in the server-rendered HTML are attached to the window object.
   ================================================================ */
window.openCreateModal    = openCreateModal;
window.openEditModal      = openEditModal;
window.promptDeleteClient = promptDeleteClient;
window.dismissToast       = dismissToast;

/* ================================================================
   18. BOOT
   ================================================================ */
document.addEventListener('DOMContentLoaded', initDashboard);

import { addDays, describeError, formatDate, loanStatusLabel, statusLabel } from './ui.js';

// US-09 · Interface web du parcours d'emprunt. Tout passe par l'API ; aucun texte n'est injecté en HTML brut.

const state = {
  users: [],
  tools: [],
  userId: null,
  selectedToolId: null,
  loans: [], // demandes envoyées depuis cette page : { id, toolId, toolName, borrowerName, startDate, endDate, status }
};

const $ = (selector) => document.querySelector(selector);

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of children) {
    if (child !== null && child !== undefined) node.append(child);
  }
  return node;
}

class ApiError extends Error {
  constructor(status, body) {
    super(describeError(status, body));
    this.status = status;
  }
}

async function api(method, path, body) {
  const headers = {};
  if (state.userId) headers['X-User-Id'] = state.userId;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

function userName(id) {
  const user = state.users.find((u) => u.id === id);
  return user ? user.firstName : id;
}

function localToday() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Bandeau de message : succès en vert, erreur en rouge avec le code HTTP.
function notify(message, error) {
  const notice = $('#notice');
  notice.replaceChildren();
  if (error) {
    notice.classList.add('is-error');
    notice.append(el('strong', { textContent: `Erreur ${error.status ?? ''}`.trim() }), ' ', message);
  } else {
    notice.classList.remove('is-error');
    notice.append(message);
  }
  notice.hidden = false;
}

async function run(action, successMessage) {
  try {
    const result = await action();
    if (successMessage) notify(typeof successMessage === 'function' ? successMessage(result) : successMessage);
    return result;
  } catch (error) {
    notify(error.message, error);
    return null;
  }
}

/* ---------- Profil ---------- */

function renderProfiles() {
  const select = $('#profile');
  select.replaceChildren(
    ...state.users.map((user) =>
      el('option', { value: user.id, textContent: `${user.firstName} (${user.district})` }),
    ),
  );
  select.value = state.userId;
}

/* ---------- Catalogue (US-01) ---------- */

async function loadCatalogue() {
  state.tools = await api('GET', '/api/tools');
  renderCatalogue();
}

function renderCatalogue() {
  const available = state.tools.filter((tool) => tool.status === 'available').length;
  $('#board-count').textContent = `${available} disponible${available > 1 ? 's' : ''} sur ${state.tools.length}`;

  const list = $('#catalogue');
  if (state.tools.length === 0) {
    list.replaceChildren(el('li', { className: 'empty', textContent: 'Aucun outil pour le moment.' }));
    return;
  }
  list.replaceChildren(
    ...state.tools.map((tool) => {
      const button = el(
        'button',
        { type: 'button', className: `tag${tool.status === 'unavailable' ? ' is-unavailable' : ''}` },
        el('span', { className: 'tag-name', textContent: tool.name }),
        el('span', { className: 'tag-category', textContent: tool.category }),
        el('span', { className: `status status-${tool.status}`, textContent: statusLabel(tool.status) }),
      );
      button.setAttribute('aria-pressed', String(tool.id === state.selectedToolId));
      button.addEventListener('click', () => selectTool(tool.id));
      return el('li', {}, button);
    }),
  );
}

/* ---------- Fiche et demande (US-03, US-04) ---------- */

async function selectTool(toolId) {
  state.selectedToolId = toolId;
  renderCatalogue();
  await run(async () => renderDetail(await api('GET', `/api/tools/${toolId}`)));
  // Sur petit écran, la fiche est sous le catalogue : on l'amène à l'écran.
  if (window.matchMedia('(max-width: 959px)').matches) {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('#detail').scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }
}

function renderDetail(tool) {
  const detail = $('#detail');
  // La fiche ne renvoie que le prénom et le quartier du propriétaire : on les compare au profil choisi.
  const owner = tool.owner;
  const me = state.users.find((user) => user.id === state.userId);
  const isMine = Boolean(owner && me && me.firstName === owner.firstName && me.district === owner.district);

  const start = addDays(localToday(), 1);
  const form = el(
    'form',
    { className: 'form' },
    el(
      'div',
      { className: 'dates' },
      el('label', {}, 'Du', el('input', { type: 'date', name: 'startDate', value: start, required: true })),
      el('label', {}, 'Au', el('input', { type: 'date', name: 'endDate', value: addDays(start, 2), required: true })),
    ),
    el('button', { type: 'submit', className: 'button', textContent: 'Demander cet outil' }),
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    requestTool(tool, data.get('startDate'), data.get('endDate'));
  });

  detail.replaceChildren(
    el('h2', { textContent: tool.name }),
    el('p', { className: 'category', textContent: tool.category }),
    el('span', { className: `status status-${tool.status}`, textContent: statusLabel(tool.status) }),
    tool.description ? el('p', { className: 'description', textContent: tool.description }) : null,
    owner
      ? el('p', {
          className: `owner${isMine ? ' is-me' : ''}`,
          textContent: isMine
            ? 'C’est votre outil : vos voisins peuvent le demander.'
            : `Prêté par ${owner.firstName}, quartier ${owner.district}.`,
        })
      : null,
    isMine ? null : form,
  );
}

async function requestTool(tool, startDate, endDate) {
  const loan = await run(
    () => api('POST', '/api/loans', { toolId: tool.id, startDate, endDate }),
    () => `Demande envoyée pour « ${tool.name} », du ${formatDate(startDate)} au ${formatDate(endDate)}.`,
  );
  if (!loan) return;
  state.loans.unshift({ ...loan, toolName: tool.name, borrowerName: userName(loan.borrowerId) });
  renderLoans();
}

/* ---------- Demandes (US-05, US-06, US-07) ---------- */

const LOAN_ACTIONS = {
  pending: [
    { path: 'accept', label: 'Accepter', done: 'Demande acceptée : l’outil est maintenant prêté.' },
    { path: 'refuse', label: 'Refuser', done: 'Demande refusée.', secondary: true },
  ],
  accepted: [{ path: 'return', label: 'Déclarer le retour', done: 'Retour déclaré : l’outil est de nouveau disponible.' }],
};

function renderLoans() {
  $('#loans').replaceChildren(
    ...state.loans.map((loan) => {
      const actions = (LOAN_ACTIONS[loan.status] ?? []).map((action) => {
        const button = el('button', {
          type: 'button',
          className: `button small${action.secondary ? ' secondary' : ''}`,
          textContent: action.label,
        });
        button.addEventListener('click', () => decide(loan, action));
        return button;
      });
      return el(
        'li',
        { className: 'loan' },
        el('div', { className: 'loan-tool', textContent: loan.toolName }),
        el('p', {
          className: 'loan-meta',
          textContent: `Demandé par ${loan.borrowerName}, du ${formatDate(loan.startDate)} au ${formatDate(loan.endDate)}.`,
        }),
        el('span', { className: `loan-status ${loan.status}`, textContent: loanStatusLabel(loan.status) }),
        actions.length ? el('div', { className: 'loan-actions' }, ...actions) : null,
      );
    }),
  );
}

async function decide(loan, action) {
  const updated = await run(() => api('POST', `/api/loans/${loan.id}/${action.path}`), action.done);
  if (!updated) return;
  loan.status = updated.status;
  renderLoans();
  await loadCatalogue();
  if (state.selectedToolId === loan.toolId) await selectTool(loan.toolId);
}

/* ---------- Proposer un outil (US-02) ---------- */

function setupNewToolForm() {
  const form = $('#new-tool');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.description) delete data.description;
    const tool = await run(
      () => api('POST', '/api/tools', data),
      (created) => `« ${created.name} » est sur le panneau.`,
    );
    if (!tool) return;
    form.reset();
    await loadCatalogue();
    await selectTool(tool.id);
  });
}

/* ---------- Démarrage ---------- */

async function start() {
  state.users = await api('GET', '/api/users');
  state.userId = state.users[1]?.id ?? state.users[0]?.id ?? null;
  renderProfiles();
  $('#profile').addEventListener('change', async (event) => {
    state.userId = event.target.value;
    notify(`Vous agissez maintenant en tant que ${userName(state.userId)}.`);
    if (state.selectedToolId) await selectTool(state.selectedToolId);
  });
  setupNewToolForm();
  renderLoans();
  await loadCatalogue();
}

start().catch((error) => notify(`L’interface n’a pas pu charger les données : ${error.message}`, error));

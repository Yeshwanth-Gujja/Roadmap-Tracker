(() => {
  'use strict';
  const KEYS = { data: 'fsai-final-data-v1', config: 'fsai-final-github-v1', theme: 'fsai-final-theme-v1' };
  const $ = id => document.getElementById(id),
    copy = x => JSON.parse(JSON.stringify(x));

  let roadmap = [],
    undoStack = [],
    redoStack = [],
    drag = null,
    mode = 'edit',
    editingParent = null,
    syncing = false;

  function uid() {
    return 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
  }

  function normalize(list) {
    return (Array.isArray(list) ? list : []).map(n => ({
      id: n.id || uid(),
      name: String(n.name || 'Untitled'),
      type: n.type || 'Topic',
      description: String(n.description || ''),
      status: n.status || 'not-started',
      difficulty: n.difficulty || 'medium',
      priority: n.priority || 'medium',
      targetDate: n.targetDate || '',
      notes: String(n.notes || ''),
      resources: Array.isArray(n.resources) ? n.resources.map(String) : [],
      children: normalize(n.children)
    }))
  }

  function all(list, out = []) {
    for (const n of list) {
      out.push(n);
      all(n.children, out)
    }
    return out
  }

  function leaves(list, out = []) {
    for (const n of list) {
      if (!n.children.length) out.push(n);
      else leaves(n.children, out)
    }
    return out
  }

  function find(id, list = roadmap) {
    for (const n of list) {
      if (n.id === id) return n;
      const x = find(id, n.children);
      if (x) return x
    }
    return null
  }

  function parentOf(id, list = roadmap, parent = null) {
    for (const n of list) {
      if (n.id === id) return parent;
      const x = parentOf(id, n.children, n);
      if (x !== undefined) return x
    }
    return undefined
  }

  function percent(list) {
    const x = leaves(list);
    return x.length ? Math.round(x.filter(n => n.status === 'completed').length / x.length * 100) : 0
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]))
  }

  function statusLabel(s) {
    return ({
      'not-started': 'Not started',
      'in-progress': 'In progress',
      completed: 'Completed'
    })[s] || s
  }

  function config() {
    try {
      const c = JSON.parse(localStorage.getItem(KEYS.config) || 'null');
      return c && c.owner && c.repo && c.branch && c.token ? c : null
    } catch {
      return null
    }
  }

  function saveLocal() {
    localStorage.setItem(KEYS.data, JSON.stringify(roadmap))
  }

  function remember() {
    undoStack.push(copy(roadmap));
    if (undoStack.length > 100) undoStack.shift();
    redoStack = []
  }

  function change(fn, githubMessage = 'Update roadmap') {
    remember();
    fn();
    saveLocal();
    render();
    queueGithubCommit(githubMessage);
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 2800)
  }

  function setSync(kind) {
    const b = $('sync');
    b.className = 'pill ' + (
      kind === 'ok' ? 'ok' :
      kind === 'busy' ? 'busy' :
      kind === 'err' ? 'err' : ''
    );

    b.textContent =
      kind === 'busy' ? 'Saving to GitHub…' :
      kind === 'ok' ? 'GitHub synced' :
      kind === 'err' ? 'GitHub error' :
      config() ? 'GitHub connected' :
      'Local only'
  }

  function render() {
    const q = $('search').value.trim().toLowerCase(),
      st = $('status').value,
      di = $('difficulty').value,
      pr = $('priority').value;

    $('roadmap').innerHTML = '';
    let visible = 0;

    const match = n => {
      const text = [
        n.name,
        n.description,
        n.notes,
        n.targetDate,
        ...n.resources
      ].join(' ').toLowerCase();

      return (!q || text.includes(q)) &&
        (st === 'all' || n.status === st) &&
        (di === 'all' || n.difficulty === di) &&
        (pr === 'all' || n.priority === pr)
    };

    const has = n => match(n) || n.children.some(has);

    const draw = (n, parent, isRoot = false) => {
      if (!has(n)) return null;

      visible++;

      const wrap = document.createElement(isRoot ? 'section' : 'div');
      wrap.className = isRoot ? 'section' : 'node';
      wrap.dataset.id = n.id;
      wrap.draggable = true;

      const open = q || st !== 'all' || di !== 'all' || pr !== 'all' || n._open;

      if (n.children.length) {
        wrap.innerHTML =
          `<div class="head"><span class="drag">⋮⋮</span><button class="toggle">${open ? '⌄' : '›'}</button><div class="main"><div class="title">${esc(n.name)}</div>${n.description ? `<div class="desc">${esc(n.description)}</div>` : ''}${isRoot ? `<div class="mini"><i style="width:${percent([n])}%"></i></div><div class="percent">${percent([n])}% complete</div>` : ''}</div><div class="actions2"><button class="small edit">Edit</button><button class="small add">+</button><button class="small del">×</button></div></div><div class="children" style="display:${open ? 'block' : 'none'}"></div>`;

        const body = wrap.querySelector('.children');

        n.children.forEach(c => {
          const e = draw(c, n, false);
          if (e) body.appendChild(e)
        });

        body.insertAdjacentHTML(
          'beforeend',
          `<div class="addrow"><button class="addchild">+ Add item</button></div>`
        );

        wrap.querySelector('.toggle').onclick = () => {
          n._open = !n._open;
          render()
        };

        wrap.querySelector('.main').onclick = () => {
          n._open = !n._open;
          render()
        };

        wrap.querySelector('.edit').onclick = () =>
          openEditor('edit', n, parent);

        wrap.querySelector('.add').onclick = () =>
          openEditor('add', null, n);

        wrap.querySelector('.addchild').onclick = () =>
          openEditor('add', null, n);

        wrap.querySelector('.del').onclick = () =>
          deleteNode(n.id);

        setupDrag(wrap, n, parent);

      } else {
        wrap.className = 'leaf';

        wrap.innerHTML =
          `<span class="drag">⋮⋮</span><input class="check" type="checkbox" ${n.status === 'completed' ? 'checked' : ''}><div class="leafBody"><div class="leafName">${esc(n.name)}</div>${n.description ? `<div class="desc">${esc(n.description)}</div>` : ''}<div class="badges"><span class="badge ${esc(n.difficulty)}">${esc(n.difficulty)}</span><span class="badge ${esc(n.status)}">${statusLabel(n.status)}</span><span class="badge ${esc(n.priority)}">${esc(n.priority)} priority</span></div>${n.targetDate ? `<div class="extra">Target: ${esc(n.targetDate)}</div>` : ''}${n.notes ? `<div class="extra"><b>Notes</b><div class="notes">${esc(n.notes)}</div></div>` : ''}${n.resources.length ? `<div class="extra"><b>Resources</b><div class="resources">${n.resources.map(u => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>`).join('')}</div></div>` : ''}</div><div class="actions2"><button class="small edit">Edit</button><button class="small del">×</button></div>`;

        wrap.querySelector('.check').onchange = e =>
          change(
            () => n.status = e.target.checked ? 'completed' : 'not-started',
            e.target.checked ? 'Complete: ' + n.name : 'Reopen: ' + n.name
          );

        wrap.querySelector('.edit').onclick = () =>
          openEditor('edit', n, parent);

        wrap.querySelector('.del').onclick = () =>
          deleteNode(n.id);

        setupDrag(wrap, n, parent);
      }

      return wrap;
    };

    roadmap.forEach(n => {
      const e = draw(n, null, true);
      if (e) $('roadmap').appendChild(e)
    });

    if (!visible) {
      $('roadmap').innerHTML =
        '<section class="section"><div style="padding:30px;text-align:center;color:var(--muted)">No matching roadmap items.</div></section>';
    }

    const ls = leaves(roadmap),
      ns = all(roadmap),
      done = ls.filter(n => n.status === 'completed').length,
      ip = ls.filter(n => n.status === 'in-progress').length,
      hard = ls.filter(n => n.difficulty === 'hard').length,
      p = percent(roadmap);

    $('pct').textContent = p + '%';
    $('pct2').textContent = p + '%';
    $('bar').style.width = p + '%';
    $('progressText').textContent = `${done} of ${ls.length} leaf topics completed`;

    $('stats').innerHTML = [
      ['Total nodes', ns.length],
      ['Leaf topics', ls.length],
      ['Completed', done],
      ['In progress', ip],
      ['Hard', hard]
    ].map(x =>
      `<div class="stat"><small>${x[0]}</small><strong>${x[1]}</strong></div>`
    ).join('');

    $('sectionProgress').innerHTML = roadmap.map(n =>
      `<div class="meterBox"><div class="meterHead"><b>${esc(n.name)}</b><span>${percent([n])}%</span></div><div class="meter"><i style="width:${percent([n])}%"></i></div></div>`
    ).join('');

    $('undo').disabled = !undoStack.length;
    $('redo').disabled = !redoStack.length;

    setSync(
      config() ? (syncing ? 'busy' : 'ok') : ''
    );
  }

  function setupDrag(el, n, parent) {
    el.addEventListener('dragstart', e => {
      drag = { n, parent };
      e.dataTransfer.effectAllowed = 'move';
      el.style.opacity = '.45'
    });

    el.addEventListener('dragend', () => {
      el.style.opacity = '';
      drag = null
    });

    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move'
    });

    el.addEventListener('drop', e => {
      e.preventDefault();

      if (!drag || drag.n.id === n.id) return;
      if (isInside(drag.n, n)) return;

      const from = drag.parent ? drag.parent.children : roadmap;

      if (n.children.length) {
        const i = from.indexOf(drag.n);

        if (i >= 0) {
          from.splice(i, 1);
          n.children.push(drag.n);
          saveAndCommit('Move ' + drag.n.name + ' into ' + n.name)
        }

      } else if (from === (parent ? parent.children : roadmap)) {
        const a = from.indexOf(drag.n),
          b = from.indexOf(n);

        if (a >= 0 && b >= 0) {
          from.splice(a, 1);
          from.splice(from.indexOf(n), 0, drag.n);
          saveAndCommit('Reorder ' + drag.n.name)
        }
      }
    })
  }

  function isInside(a, b) {
    return a.children.some(c =>
      c.id === b.id || isInside(c, b)
    )
  }

  function saveAndCommit(msg) {
    remember();
    saveLocal();
    render();
    queueGithubCommit(msg);
  }

  function openEditor(m, n, p) {
    mode = m;
    editingParent = p || null;

    $('editor').classList.add('show');
    $('editorTitle').textContent =
      m === 'edit' ? 'Edit item' : 'Add item';

    $('editId').value = n?.id || '';
    $('parentId').value = p?.id || '';
    $('name').value = n?.name || '';
    $('description').value = n?.description || '';
    $('editStatus').value = n?.status || 'not-started';
    $('editDifficulty').value = n?.difficulty || 'medium';
    $('editPriority').value = n?.priority || 'medium';
    $('target').value = n?.targetDate || '';
    $('notes').value = n?.notes || '';
    $('resources').value = (n?.resources || []).join('\n');

    $('leafFields').style.display =
      m === 'edit' && n && n.children.length ? 'none' : 'block';

    setTimeout(() => $('name').focus(), 30)
  }

  function close(id) {
    $(id).classList.remove('show')
  }

  $('form').onsubmit = e => {
    e.preventDefault();

    const id = $('editId').value,
      name = $('name').value.trim();

    if (!name) return;

    const data = {
      name,
      description: $('description').value.trim(),
      status: $('editStatus').value,
      difficulty: $('editDifficulty').value,
      priority: $('editPriority').value,
      targetDate: $('target').value,
      notes: $('notes').value.trim(),
      resources: $('resources').value
        .split(/\n+/)
        .map(x => x.trim())
        .filter(Boolean)
    };

    change(() => {
      if (mode === 'edit') {
        const n = find(id);

        if (!n) return;

        n.name = data.name;
        n.description = data.description;

        if (!n.children.length) Object.assign(n, data)

      } else {
        const n = {
          id: uid(),
          ...data,
          type: editingParent?.type === 'Section' ? 'Topic' : 'Skill',
          children: []
        };

        if (editingParent) {
          editingParent.children.push(n)
        } else {
          n.type = 'Section';
          roadmap.push(n)
        }
      }

    }, mode === 'edit' ? 'Edit: ' + name : 'Add: ' + name);

    close('editor');
    toast('Saved locally' + (config() ? ' — GitHub commit queued' : ''))
  };

  function deleteNode(id) {
    const n = find(id);

    if (!n || !confirm(`Delete "${n.name}" and all children?`)) return;

    change(() => {
      const p = parentOf(id);
      const a = p ? p.children : roadmap;
      const i = a.findIndex(x => x.id === id);

      if (i >= 0) a.splice(i, 1)

    }, 'Delete: ' + n.name);

    toast('Deleted')
  }

  function undo() {
    if (!undoStack.length) return;

    redoStack.push(copy(roadmap));
    roadmap = undoStack.pop();
    saveLocal();
    render();
    queueGithubCommit('Undo change');
    toast('Undone')
  }

  function redo() {
    if (!redoStack.length) return;

    undoStack.push(copy(roadmap));
    roadmap = redoStack.pop();
    saveLocal();
    render();
    queueGithubCommit('Redo change');
    toast('Redone')
  }

  function expandAll() {
    all(roadmap).forEach(n => {
      if (n.children.length) n._open = true
    });
    render()
  }

  function collapseAll() {
    all(roadmap).forEach(n => n._open = false);
    render()
  }

  async function gh(path, opts = {}) {
    const c = config();
    if (!c) throw Error('GitHub is not connected');

    const r = await fetch('https://api.github.com' + path, {
      ...opts,
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        'Authorization': 'Bearer ' + c.token,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });

    if (!r.ok) {
      const text = await r.text();
      const error = Error(text.slice(0, 400));
      error.status = r.status;
      throw error;
    }

    return r.status === 204 ? null : r.json();
  }

  function b64(s) {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin)
  }

  function text64(s) {
    const bin = atob(s.replace(/\n/g, ''));
    const bytes = Uint8Array.from(
      bin,
      c => c.charCodeAt(0)
    );
    return new TextDecoder().decode(bytes)
  }

  async function getRemote() {
    const c = config();
  
    if (!c) return null;
  
    try {
      // Cache-busting query parameter is enough.
      // Do NOT send Cache-Control or Pragma headers because
      // GitHub API CORS preflight rejects those custom headers.
      const cacheBust = Date.now().toString();
  
      return await gh(
        `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/roadmap.json?ref=${encodeURIComponent(c.branch)}&_=${cacheBust}`
      );
  
    } catch (e) {
      if (
        String(e.message).startsWith('{') ||
        !String(e.message).includes('404')
      ) {
        throw e;
      }
  
      return null;
    }
  }

  let githubQueue = Promise.resolve();
  let githubStartup = Promise.resolve();

  function queueGithubCommit(message) {
    githubQueue = githubQueue
      .then(() => githubStartup)
      .then(() => githubCommit(message))
      .catch(e => {
        console.error('GitHub queue error:', e);
      });
  
    return githubQueue;
  }

  async function githubCommit(message = 'Update roadmap') {
    const c = config();

    if (!c) return;

    syncing = true;
    setSync('busy');

    try {
      let file = await getRemote();

      const makeBody = remoteFile => {
        const body = {
          message: 'Roadmap: ' + message,
          content: b64(
            JSON.stringify(roadmap, null, 2) + '\n'
          ),
          branch: c.branch
        };

        if (remoteFile?.sha) {
          body.sha = remoteFile.sha;
        }

        return body;
      };

      try {
        await gh(
          `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/roadmap.json`,
          {
            method: 'PUT',
            body: JSON.stringify(makeBody(file))
          }
        );

      } catch (e) {
        // If another write changed roadmap.json between GET and PUT,
        // fetch the newest SHA and retry once.
        if (e.status !== 409) throw e;

        file = await getRemote();

        await gh(
          `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/roadmap.json`,
          {
            method: 'PUT',
            body: JSON.stringify(makeBody(file))
          }
        );
      }

      localStorage.setItem(
        'fsai-last-sync',
        new Date().toISOString()
      );

      setSync('ok');

    } catch (e) {
      setSync('err');
      toast('GitHub save failed: ' + e.message)

    } finally {
      syncing = false
    }
  }

  async function pull(show = true) {
    if (!config()) {
      toast('Connect GitHub first');
      return
    }

    syncing = true;
    setSync('busy');

    try {
      const f = await getRemote();

      if (!f) {
        throw Error(
          'roadmap.json was not found in this repository'
        )
      }

      const remote = JSON.parse(
        text64(f.content)
      );

      if (!Array.isArray(remote)) {
        throw Error(
          'roadmap.json must contain an array'
        )
      }

      if (show) {
        remember();
      }

      roadmap = normalize(remote);
      saveLocal();
      render();
      setSync('ok');
      toast('Latest GitHub version loaded')

    } catch (e) {
      setSync('err');
      toast('Pull failed: ' + e.message)

    } finally {
      syncing = false
    }
  }

  async function connect() {
    const c = {
      owner: $('owner').value.trim(),
      repo: $('repo').value.trim(),
      branch: $('branch').value.trim() || 'main',
      token: $('token').value.trim()
    };

    if (!c.owner || !c.repo || !c.token) {
      toast(
        'Owner, repository and token are required'
      );
      return
    }

    try {
      const r = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`,
        {
          cache: 'no-store',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: 'Bearer ' + c.token,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );

      if (!r.ok) {
        const error = Error(
          (await r.text()).slice(0, 350)
        );
        error.status = r.status;
        throw error;
      }

      localStorage.setItem(
        KEYS.config,
        JSON.stringify(c)
      );

      close('githubModal');

      githubStartup = pull(false);
      await githubStartup;

      await queueGithubCommit(
        'Connect / save current state'
      );

      toast('GitHub connected')

    } catch (e) {
      toast(
        'GitHub connection failed: ' + e.message
      );
      setSync('err')
    }
  }

  async function versions() {
    if (!config()) {
      toast('Connect GitHub first');
      return
    }

    $('historyModal').classList.add('show');
    $('historyStatus').textContent = 'Loading versions…';
    $('historyList').innerHTML = '';

    try {
      const c = config();

      const xs = await gh(
        `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/commits?path=roadmap.json&sha=${encodeURIComponent(c.branch)}&per_page=50`
      );

      $('historyStatus').textContent =
        `${xs.length} versions found`;

      for (const x of xs) {
        const d = document.createElement('div');

        d.className = 'historyItem';

        d.innerHTML =
          `<b>${esc(x.commit.message.split('\n')[0])}</b><div class="historyMeta">${esc(x.commit.author?.name || 'Unknown')} · ${new Date(x.commit.author?.date || x.committer?.date).toLocaleString()} · ${esc(x.sha.slice(0, 7))}</div><div class="historyActions"><a href="${esc(x.html_url)}" target="_blank" rel="noopener">Open commit</a> <button>Restore</button></div>`;

        d.querySelector('button').onclick = () =>
          restore(x.sha);

        $('historyList').appendChild(d)
      }

    } catch (e) {
      $('historyStatus').textContent =
        'Could not load history: ' + e.message
    }
  }

  async function restore(sha) {
    if (!confirm(
      'Restore this version? It will be committed as a new version.'
    )) return;

    try {
      const c = config();

      const f = await gh(
        `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/roadmap.json?ref=${encodeURIComponent(sha)}`
      );

      const remote = JSON.parse(
        text64(f.content)
      );

      remember();

      roadmap = normalize(remote);
      saveLocal();
      render();

      await queueGithubCommit(
        'Restore version ' + sha.slice(0, 7)
      );

      close('historyModal');

      toast(
        'Restored and committed as a new version'
      )

    } catch (e) {
      toast(
        'Restore failed: ' + e.message
      )
    }
  }

  function exportData() {
    const a = document.createElement('a');

    a.href = URL.createObjectURL(
      new Blob(
        [JSON.stringify(roadmap, null, 2)],
        { type: 'application/json' }
      )
    );

    a.download = 'roadmap.json';
    a.click();

    setTimeout(
      () => URL.revokeObjectURL(a.href),
      1000
    )
  }

  $('import').onclick = () =>
    $('file').click();

  $('file').onchange = e => {
    const f = e.target.files[0];

    if (!f) return;

    const r = new FileReader();

    r.onload = () => {
      try {
        const x = JSON.parse(r.result);

        if (!Array.isArray(x)) {
          throw Error('JSON must be an array')
        }

        change(
          () => roadmap = normalize(x),
          'Import roadmap'
        );

        toast('Imported')

      } catch (err) {
        toast(
          'Import failed: ' + err.message
        )

      } finally {
        e.target.value = ''
      }
    };

    r.readAsText(f)
  };

  $('search').oninput = render;
  $('status').onchange = render;
  $('difficulty').onchange = render;
  $('priority').onchange = render;
  $('expand').onclick = expandAll;
  $('collapse').onclick = collapseAll;
  $('undo').onclick = undo;
  $('redo').onclick = redo;
  $('export').onclick = exportData;

  $('addRoot').onclick = () =>
    openEditor('add', null, null);

  $('github').onclick = () => {
    const c = config();

    if (c) {
      $('owner').value = c.owner;
      $('repo').value = c.repo;
      $('branch').value = c.branch;
      $('token').value = c.token
    }

    $('githubModal').classList.add('show')
  };

  $('saveGithub').onclick = connect;

  $('pull').onclick = () =>
    pull(true);

  $('disconnect').onclick = () => {
    localStorage.removeItem(KEYS.config);
    setSync('');
    close('githubModal');
    toast('GitHub disconnected')
  };

  $('history').onclick = versions;

  $('theme').onclick = () => {
    const dark =
      !document.body.classList.contains('dark');

    document.body.classList.toggle(
      'dark',
      dark
    );

    localStorage.setItem(
      KEYS.theme,
      dark ? 'dark' : 'light'
    );

    $('theme').textContent =
      dark ? 'Light' : 'Dark'
  };

  document.querySelectorAll('[data-close]')
    .forEach(b =>
      b.onclick = () =>
        close(b.dataset.close)
    );

  document.addEventListener('keydown', e => {
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === 'z'
    ) {
      e.preventDefault();
      e.shiftKey ? redo() : undo()

    } else if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === 'y'
    ) {
      e.preventDefault();
      redo()

    } else if (e.key === 'Escape') {
      [
        'editor',
        'githubModal',
        'historyModal'
      ].forEach(close)
    }
  });

  async function boot() {
    document.body.classList.toggle(
      'dark',
      localStorage.getItem(KEYS.theme) === 'dark'
    );
  
    $('theme').textContent =
      document.body.classList.contains('dark')
        ? 'Light'
        : 'Dark';
  
    let initial = null;
    let loadedFromFile = false;
  
    // Always load the latest published roadmap first.
    // GitHub Pages is the source of truth for the public roadmap.
    try {
      const cacheBust = Date.now().toString();
  
      const r = await fetch(
        './roadmap.json?_=' + cacheBust,
        { cache: 'no-store' }
      );
  
      if (r.ok) {
        initial = await r.json();
  
        if (Array.isArray(initial)) {
          loadedFromFile = true;
        }
      }
    } catch (e) {
      console.warn(
        'Could not load latest roadmap.json:',
        e
      );
    }
  
    // Fallback if roadmap.json cannot be loaded.
    if (!Array.isArray(initial)) {
      try {
        initial = copy(window.ORIGINAL_ROADMAP);
      } catch (e) {
        initial = [];
      }
    }
  
    const local = (() => {
      try {
        return JSON.parse(
          localStorage.getItem(KEYS.data) || 'null'
        );
      } catch {
        return null;
      }
    })();
  
    // Published GitHub Pages data always wins when available.
    // LocalStorage is used only when the published file cannot
    // be loaded.
    if (loadedFromFile) {
      roadmap = normalize(initial);
    } else if (local && Array.isArray(local)) {
      roadmap = normalize(local);
    } else {
      roadmap = normalize(initial);
    }
  
    // Keep localStorage synchronized with the published roadmap.
    saveLocal();
  
    render();
  
    // If GitHub is connected, check the repository version too.
    if (config()) {
      githubStartup = pull(false);
    }
  }

  boot();
})();
const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// READ - own records only
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM capsules WHERE user_id = ?').all(req.user.id);
  res.json(rows);
});

// CREATE
router.post('/', (req, res) => {
  const {
    project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness,
    reviewed, improved, screenshot_url, notes
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'project_name, prompt_title and prompt_text are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO capsules
      (user_id, project_name, prompt_title, prompt_version, prompt_text,
       response_summary, category, usefulness, reviewed, improved, screenshot_url, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    req.user.id, project_name, prompt_title, prompt_version || null, prompt_text,
    response_summary || null, category || null, usefulness || null,
    reviewed ? 1 : 0, improved ? 1 : 0, screenshot_url || null, notes || null
  );

  const newRecord = db.prepare('SELECT * FROM capsules WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newRecord);
});

// UPDATE - own records only
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const {
    project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness,
    reviewed, improved, screenshot_url, notes
  } = req.body;

  db.prepare(`
    UPDATE capsules SET
      project_name = ?, prompt_title = ?, prompt_version = ?, prompt_text = ?,
      response_summary = ?, category = ?, usefulness = ?,
      reviewed = ?, improved = ?, screenshot_url = ?, notes = ?
    WHERE id = ?
  `).run(
    project_name ?? existing.project_name,
    prompt_title ?? existing.prompt_title,
    prompt_version ?? existing.prompt_version,
    prompt_text ?? existing.prompt_text,
    response_summary ?? existing.response_summary,
    category ?? existing.category,
    usefulness ?? existing.usefulness,
    reviewed !== undefined ? (reviewed ? 1 : 0) : existing.reviewed,
    improved !== undefined ? (improved ? 1 : 0) : existing.improved,
    screenshot_url ?? existing.screenshot_url,
    notes ?? existing.notes,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE - own records only
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.prepare('DELETE FROM capsules WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
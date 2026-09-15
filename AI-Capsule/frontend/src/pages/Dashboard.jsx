import { useEffect, useState } from 'react';
import { getCapsules, createCapsule, updateCapsule, deleteCapsule } from '../api/capsules';

const emptyForm = {
  project_name: '',
  prompt_title: '',
  prompt_version: '',
  prompt_text: '',
  response_summary: '',
  category: '',
  usefulness: '',
  reviewed: false,
  improved: false,
  screenshot_url: '',
  notes: ''
};

function Dashboard() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  async function loadCapsules() {
    try {
      setLoading(true);
      const data = await getCapsules();
      setCapsules(data);
      setError(null);
    } catch (err) {
      setError('Could not load capsules. You may need to log in.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCapsules();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCapsule(editingId, form);
      } else {
        await createCapsule(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadCapsules();
    } catch (err) {
      setError('Save failed.');
    }
  }

  function startEdit(capsule) {
    setForm({
      project_name: capsule.project_name || '',
      prompt_title: capsule.prompt_title || '',
      prompt_version: capsule.prompt_version || '',
      prompt_text: capsule.prompt_text || '',
      response_summary: capsule.response_summary || '',
      category: capsule.category || '',
      usefulness: capsule.usefulness || '',
      reviewed: !!capsule.reviewed,
      improved: !!capsule.improved,
      screenshot_url: capsule.screenshot_url || '',
      notes: capsule.notes || ''
    });
    setEditingId(capsule.id);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this capsule?')) return;
    await deleteCapsule(id);
    loadCapsules();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 30 }}>
        <input name="project_name" placeholder="Project name" value={form.project_name} onChange={handleChange} required />
        <input name="prompt_title" placeholder="Prompt title" value={form.prompt_title} onChange={handleChange} required />
        <input name="prompt_version" placeholder="Version (v1, v2...)" value={form.prompt_version} onChange={handleChange} />
        <textarea name="prompt_text" placeholder="Prompt text" value={form.prompt_text} onChange={handleChange} required />
        <textarea name="response_summary" placeholder="Response summary" value={form.response_summary} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="usefulness" placeholder="Usefulness" value={form.usefulness} onChange={handleChange} />
        <label><input type="checkbox" name="reviewed" checked={form.reviewed} onChange={handleChange} /> Reviewed</label>
        <label><input type="checkbox" name="improved" checked={form.improved} onChange={handleChange} /> Improved</label>
        <input name="screenshot_url" placeholder="Screenshot URL" value={form.screenshot_url} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update capsule' : 'Add capsule'}</button>
        {editingId && (
          <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
            Cancel edit
          </button>
        )}
      </form>

      {capsules.length === 0 && <p>No capsules yet.</p>}

      {capsules.map(c => (
        <div key={c.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 10, borderRadius: 6 }}>
          <strong>{c.prompt_title}</strong> ({c.project_name}, {c.prompt_version})
          <p>{c.prompt_text}</p>
          <button onClick={() => startEdit(c)}>Edit</button>
          <button onClick={() => handleDelete(c.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
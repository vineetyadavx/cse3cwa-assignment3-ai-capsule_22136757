const BASE_URL = import.meta.env.PROD ? '/api/capsules' : 'http://localhost:5000/api/capsules';

async function getCapsules() {
  const res = await fetch(BASE_URL, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch capsules');
  return res.json();
}

async function createCapsule(data) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create capsule');
  return res.json();
}

async function updateCapsule(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update capsule');
  return res.json();
}

async function deleteCapsule(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete capsule');
}

export { getCapsules, createCapsule, updateCapsule, deleteCapsule };
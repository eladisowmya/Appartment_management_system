const residentForm = document.getElementById('residentForm');
const visitorForm = document.getElementById('visitorForm');
const residentSelect = document.getElementById('residentSelect');
const visitorRows = document.getElementById('visitorRows');
const messageBox = document.getElementById('message');

function showMessage(text, isError=false) {
  messageBox.textContent = text;
  messageBox.style.color = isError ? '#b91c1c' : '#166534';
}
async function loadResidents() {
  const res = await fetch('/api/residents');
  const residents = await res.json();
  document.getElementById('residentCount').textContent = residents.length;
  residentSelect.innerHTML = '<option value="">Choose resident</option>';
  residents.forEach(r => {
    const option = document.createElement('option');
    option.value = r.resident_id;
    option.textContent = `${r.name} (${r.flat_no})`;
    residentSelect.appendChild(option);
  });
}
async function loadVisitors() {
  const res = await fetch('/api/visitors');
  const visitors = await res.json();
  document.getElementById('visitorCount').textContent = visitors.length;
  document.getElementById('insideCount').textContent = visitors.filter(v => v.status === 'IN').length;
  visitorRows.innerHTML = '';
  visitors.forEach(v => {
    const tr = document.createElement('tr');
    const entry = v.entry_time ? new Date(v.entry_time).toLocaleString() : '-';
    const exit = v.exit_time ? new Date(v.exit_time).toLocaleString() : '-';
    tr.innerHTML = `<td>${v.visitor_id}</td><td>${escapeHTML(v.name)}</td><td>${escapeHTML(v.resident_name)} / ${escapeHTML(v.flat_no)}</td><td>${entry}</td><td>${exit}</td><td><span class="pill ${v.status === 'IN' ? 'in' : 'out'}">${v.status}</span></td><td>${v.status === 'IN' ? `<button onclick="checkout(${v.visitor_id})">Record Exit</button>` : 'Completed'}</td>`;
    visitorRows.appendChild(tr);
  });
}
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
residentForm.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(residentForm));
  const res = await fetch('/api/residents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const result = await res.json();
  if(!res.ok) return showMessage(result.error, true);
  residentForm.reset(); await loadResidents(); showMessage(result.message);
});
visitorForm.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(visitorForm));
  const res = await fetch('/api/visitors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const result = await res.json();
  if(!res.ok) return showMessage(result.error, true);
  visitorForm.reset(); await loadVisitors(); showMessage(result.message);
});
async function checkout(id) {
  const res = await fetch(`/api/visitors/${id}/exit`,{method:'PATCH'});
  const result = await res.json();
  if(!res.ok) return showMessage(result.error, true);
  await loadVisitors(); showMessage(result.message);
}
document.getElementById('refreshBtn').addEventListener('click', async()=>{await loadResidents();await loadVisitors();showMessage('Records refreshed.');});
(async()=>{try{await loadResidents();await loadVisitors();}catch(e){showMessage('Cannot connect to server. Start Node.js and MySQL, then refresh.',true);}})();

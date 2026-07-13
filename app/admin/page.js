'use client';
import { useEffect, useMemo, useState } from 'react';

function Login({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) onDone();
    else setError('Invalid email or password.');
  };

  return (
    <div className="login-box">
      <h1>Admin Login</h1>
      <p>Vinsup Skill Academy — Portfolio Builder</p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        </div>
        <button className="btn" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(null); // null = checking
  const [subs, setSubs] = useState([]);
  const [warning, setWarning] = useState('');
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [fBatch, setFBatch] = useState('all');
  const [fCourse, setFCourse] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [details, setDetails] = useState({});

  const load = async () => {
    const res = await fetch('/api/admin/submissions');
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setSubs(data.submissions || []);
    setWarning(data.warning || '');
    setAuthed(true);
  };

  useEffect(() => { load(); }, []);

  const decide = async (slug, action) => {
    if (action === 'delete' && !confirm('Delete this submission permanently?')) return;
    setBusyId(slug);
    await fetch('/api/admin/decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, action }),
    });
    setBusyId(null);
    load();
  };

  const toggleView = async (slug) => {
    if (openId === slug) {
      setOpenId(null);
      return;
    }
    setOpenId(slug);
    if (!details[slug]) {
      const res = await fetch('/api/admin/student?slug=' + encodeURIComponent(slug));
      if (res.ok) {
        const data = await res.json();
        setDetails((d) => ({ ...d, [slug]: data.student }));
      }
    }
  };

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
  };

  const batches = useMemo(() => [...new Set(subs.map((s) => s.batch).filter(Boolean))].sort(), [subs]);
  const courses = useMemo(() => [...new Set(subs.map((s) => s.course).filter(Boolean))].sort(), [subs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return subs.filter((s) => {
      if (fStatus !== 'all' && s.status !== fStatus) return false;
      if (fBatch !== 'all' && s.batch !== fBatch) return false;
      if (fCourse !== 'all' && s.course !== fCourse) return false;
      if (!needle) return true;
      return (
        String(s.phone || '').toLowerCase().includes(needle) ||
        String(s.email || '').toLowerCase().includes(needle) ||
        String(s.rollNumber || '').toLowerCase().includes(needle) ||
        String(s.name || '').toLowerCase().includes(needle)
      );
    });
  }, [subs, q, fStatus, fBatch, fCourse]);

  const counts = useMemo(() => ({
    total: subs.length,
    pending: subs.filter((s) => s.status === 'pending').length,
    approved: subs.filter((s) => s.status === 'approved').length,
    rejected: subs.filter((s) => s.status === 'rejected').length,
  }), [subs]);

  const copyLink = (slug) => {
    const url = window.location.origin + '/p/' + slug;
    navigator.clipboard.writeText(url);
    alert('Portfolio link copied:\n' + url);
  };

  if (authed === null) return <div className="not-live"><p>Loading…</p></div>;
  if (authed === false) return <Login onDone={load} />;

  return (
    <>
      <div className="topbar">
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="brand">Vinsup <span>Skill</span> Academy — Admin</div>
          <button className="btn btn-sm btn-outline" onClick={logout} style={{ background: '#fff' }}>Logout</button>
        </div>
      </div>
      <div className="admin-wrap">
        <div className="container">
          {warning && <div className="warn-banner">⚠ {warning}</div>}

          <div className="stats">
            <div className="stat"><b>{counts.total}</b><span>Total submissions</span></div>
            <div className="stat"><b>{counts.pending}</b><span>Pending review</span></div>
            <div className="stat"><b>{counts.approved}</b><span>Approved &amp; live</span></div>
            <div className="stat"><b>{counts.rejected}</b><span>Rejected</span></div>
          </div>

          <div className="toolbar">
            <input className="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search by phone number, email or roll number…" />
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={fBatch} onChange={(e) => setFBatch(e.target.value)}>
              <option value="all">All batches</option>
              {batches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={fCourse} onChange={(e) => setFCourse(e.target.value)}>
              <option value="all">All courses</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-sm btn-gray" onClick={load}>Refresh</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Batch</th><th>Course</th><th>Roll No</th>
                  <th>Phone</th><th>Email</th><th>Status</th><th>Portfolio</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                    No submissions found.
                  </td></tr>
                )}
                {filtered.map((s) => (
                  <FragmentRow key={s.slug} s={s} openId={openId} toggleView={toggleView}
                    detail={details[s.slug]} decide={decide} busyId={busyId} copyLink={copyLink} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function FragmentRow({ s, openId, toggleView, detail, decide, busyId, copyLink }) {
  const open = openId === s.slug;
  const d = detail;
  return (
    <>
      <tr>
        <td><b>{s.name}</b><br /><small style={{ color: '#6b7280' }}>{new Date(s.submittedAt).toLocaleDateString()}</small></td>
        <td>{s.batch}</td>
        <td>{s.course}</td>
        <td>{s.rollNumber}</td>
        <td>{s.phone}</td>
        <td>{s.email}</td>
        <td><span className={'badge ' + s.status}>{s.status}</span></td>
        <td>
          {s.status === 'approved' ? (
            <div className="actions">
              <a href={'/p/' + s.slug} target="_blank" rel="noreferrer">Open</a>
              <button className="btn btn-sm btn-outline" onClick={() => copyLink(s.slug)}>Copy link</button>
            </div>
          ) : (
            <a href={'/p/' + s.slug} target="_blank" rel="noreferrer" style={{ color: '#6b7280' }}>Preview</a>
          )}
        </td>
        <td>
          <div className="actions">
            <button className="btn btn-sm btn-gray" onClick={() => toggleView(s.slug)}>
              {open ? 'Hide' : 'View'}
            </button>
            {s.status !== 'approved' && (
              <button className="btn btn-sm btn-green" disabled={busyId === s.slug} onClick={() => decide(s.slug, 'approved')}>Approve</button>
            )}
            {s.status !== 'rejected' && (
              <button className="btn btn-sm btn-red" disabled={busyId === s.slug} onClick={() => decide(s.slug, 'rejected')}>Reject</button>
            )}
            {s.status !== 'pending' && (
              <button className="btn btn-sm btn-gray" disabled={busyId === s.slug} onClick={() => decide(s.slug, 'pending')}>Set pending</button>
            )}
            <button className="btn btn-sm btn-red" style={{ opacity: 0.7 }} disabled={busyId === s.slug} onClick={() => decide(s.slug, 'delete')}>Delete</button>
          </div>
        </td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={9}>
            {!d ? (
              <div style={{ color: '#6b7280' }}>Loading details…</div>
            ) : (
              <div className="detail-grid">
                <div><h4>About</h4>{d.about || '—'}</div>
                <div><h4>Skills</h4>
                  {(d.skillGroups || []).map((g, i) => <div key={i}><b>{g.category}:</b> {g.items}</div>)}
                  {!(d.skillGroups || []).length && (d.skills || d.softSkills || '—')}
                </div>
                <div><h4>Address</h4>{d.address || '—'}</div>
                <div><h4>Education</h4>{(d.education || []).map((e, i) => <div key={i}>{e.degree} — {e.institution} ({e.year}) {e.score}</div>)}{!(d.education || []).length && '—'}</div>
                <div><h4>Experience</h4>{(d.experience || []).map((e, i) => <div key={i}>{e.role} @ {e.company} ({e.duration})</div>)}{!(d.experience || []).length && '—'}</div>
                <div><h4>Internships</h4>{(d.internships || []).map((e, i) => <div key={i}>{e.role} @ {e.company} ({e.duration})</div>)}{!(d.internships || []).length && '—'}</div>
                <div><h4>Projects</h4>{(d.projects || []).map((p, i) => <div key={i}>{p.title} ({p.tech})</div>)}{!(d.projects || []).length && '—'}</div>
                <div><h4>Links</h4>
                  {d.linkedin && <div><a href={d.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></div>}
                  {d.github && <div><a href={d.github} target="_blank" rel="noreferrer">GitHub</a></div>}
                  {d.website && <div><a href={d.website} target="_blank" rel="noreferrer">Website</a></div>}
                  {!d.linkedin && !d.github && !d.website && '—'}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

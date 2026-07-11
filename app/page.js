'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const emptyEdu = { degree: '', institution: '', year: '', score: '' };
const emptyExp = { role: '', company: '', duration: '', description: '' };
const emptyInt = { role: '', company: '', duration: '', description: '' };
const emptyProj = { title: '', tech: '', link: '', description: '' };
const emptySkill = { category: '', items: '' };

function ListEditor({ items, setItems, empty, fields, addLabel }) {
  const update = (i, key, val) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    setItems(next);
  };
  return (
    <div>
      {items.map((it, i) => (
        <div className="entry" key={i}>
          <button type="button" className="remove" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
            ✕ Remove
          </button>
          <div className="grid2">
            {fields.map((f) =>
              f.type === 'textarea' ? (
                <div className="field" key={f.key} style={{ gridColumn: '1 / -1' }}>
                  <label>{f.label}</label>
                  <textarea
                    value={it[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.ph || ''}
                    rows={2}
                  />
                </div>
              ) : (
                <div className="field" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    value={it[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.ph || ''}
                  />
                </div>
              )
            )}
          </div>
        </div>
      ))}
      <button type="button" className="add-link" onClick={() => setItems([...items, { ...empty }])}>
        + {addLabel}
      </button>
    </div>
  );
}

export default function StudentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [basic, setBasic] = useState({
    name: '', batch: '', course: '', rollNumber: '', phone: '', email: '',
  });
  const [about, setAbout] = useState('');
  const [photo, setPhoto] = useState('');
  const [skillGroups, setSkillGroups] = useState([{ ...emptySkill }]);
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState([{ ...emptyEdu }]);
  const [experience, setExperience] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [links, setLinks] = useState({ linkedin: '', github: '', website: '' });

  const setB = (k) => (e) => setBasic({ ...basic, [k]: e.target.value });

  const onPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    for (const [k, label] of [
      ['name', 'Full Name'], ['batch', 'Batch No'], ['course', 'Course'],
      ['rollNumber', 'Roll Number'], ['phone', 'Contact Number'], ['email', 'Email'],
    ]) {
      if (!basic[k].trim()) {
        setError(label + ' is required.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(basic.email)) {
      setError('Please enter a valid email address.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!/^[0-9+\-() ]{7,15}$/.test(basic.phone)) {
      setError('Please enter a valid contact number.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basic, about, photo, address,
          skillGroups: skillGroups.filter((x) => x.category || x.items),
          education: education.filter((x) => x.degree || x.institution),
          experience: experience.filter((x) => x.role || x.company),
          internships: internships.filter((x) => x.role || x.company),
          projects: projects.filter((x) => x.title),
          ...links,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/thanks');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="brand">Vinsup <span>Skill</span> Academy</div>
          <div style={{ fontSize: '0.85rem' }}>Student Portfolio Builder</div>
        </div>
      </div>
      <div className="form-wrap container">
        <div className="form-hero">
          <h1>Build Your Portfolio</h1>
          <p>Fill in your details below. After review and approval by the academy, your personal portfolio link will be shared with you.</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={submit}>
          <div className="card">
            <h2>Student Details</h2>
            <div className="grid2">
              <div className="field"><label>Full Name <span className="req">*</span></label>
                <input value={basic.name} onChange={setB('name')} placeholder="e.g. Priya Sharma" /></div>
              <div className="field"><label>Batch No <span className="req">*</span></label>
                <input value={basic.batch} onChange={setB('batch')} placeholder="e.g. B-12" /></div>
              <div className="field"><label>Course <span className="req">*</span></label>
                <input value={basic.course} onChange={setB('course')} placeholder="e.g. Full Stack Development" /></div>
              <div className="field"><label>Roll Number <span className="req">*</span></label>
                <input value={basic.rollNumber} onChange={setB('rollNumber')} placeholder="e.g. VSA2026001" /></div>
              <div className="field"><label>Contact Number <span className="req">*</span></label>
                <input value={basic.phone} onChange={setB('phone')} placeholder="e.g. 9876543210" /></div>
              <div className="field"><label>Email <span className="req">*</span></label>
                <input type="email" value={basic.email} onChange={setB('email')} placeholder="e.g. priya@gmail.com" /></div>
            </div>
          </div>

          <div className="card">
            <h2>About Me <small>— a short introduction shown on your portfolio</small></h2>
            <div className="field">
              <textarea value={about} onChange={(e) => setAbout(e.target.value)}
                placeholder="Write 3–5 lines about yourself, your goals and what you are passionate about..." />
            </div>
            <div className="field">
              <label>Profile Photo (optional)</label>
              <input type="file" accept="image/*" onChange={onPhoto} />
              {photo && <img src={photo} alt="preview" className="photo-preview" />}
            </div>
          </div>

          <div className="card">
            <h2>Education</h2>
            <ListEditor items={education} setItems={setEducation} empty={emptyEdu} addLabel="Add education"
              fields={[
                { key: 'degree', label: 'Degree / Qualification', ph: 'e.g. B.Sc Computer Science' },
                { key: 'institution', label: 'School / College', ph: 'e.g. Anna University' },
                { key: 'year', label: 'Year', ph: 'e.g. 2022 – 2025' },
                { key: 'score', label: 'Score / CGPA', ph: 'e.g. 8.2 CGPA' },
              ]} />
          </div>

          <div className="card">
            <h2>Experience <small>— leave empty if fresher</small></h2>
            <ListEditor items={experience} setItems={setExperience} empty={emptyExp} addLabel="Add experience"
              fields={[
                { key: 'role', label: 'Role / Designation', ph: 'e.g. Junior Developer' },
                { key: 'company', label: 'Company', ph: 'e.g. TCS' },
                { key: 'duration', label: 'Duration', ph: 'e.g. Jan 2024 – Present' },
                { key: 'description', label: 'What did you do?', type: 'textarea', ph: 'Brief description of your work...' },
              ]} />
          </div>

          <div className="card">
            <h2>Internships</h2>
            <ListEditor items={internships} setItems={setInternships} empty={emptyInt} addLabel="Add internship"
              fields={[
                { key: 'role', label: 'Internship Role', ph: 'e.g. Web Development Intern' },
                { key: 'company', label: 'Organization', ph: 'e.g. Vinsup Skill Academy' },
                { key: 'duration', label: 'Duration', ph: 'e.g. 3 months (2025)' },
                { key: 'description', label: 'What did you learn / build?', type: 'textarea' },
              ]} />
          </div>

          <div className="card">
            <h2>Skills <small>— group them by category, e.g. SEO, SMM, Web Development, Soft Skills</small></h2>
            <ListEditor items={skillGroups} setItems={setSkillGroups} empty={emptySkill} addLabel="Add skill category"
              fields={[
                { key: 'category', label: 'Category', ph: 'e.g. SEO / Web Development / Soft Skills' },
                { key: 'items', label: 'Skills in this category (separate with commas)', ph: 'e.g. WordPress, Google Analytics, Business Listing' },
              ]} />
          </div>

          <div className="card">
            <h2>Projects <small>— optional but highly recommended</small></h2>
            <ListEditor items={projects} setItems={setProjects} empty={emptyProj} addLabel="Add project"
              fields={[
                { key: 'title', label: 'Project Title', ph: 'e.g. E-commerce Website' },
                { key: 'tech', label: 'Technologies Used', ph: 'e.g. React, Node.js' },
                { key: 'link', label: 'Project Link (optional)', ph: 'https://...' },
                { key: 'description', label: 'Description', type: 'textarea' },
              ]} />
          </div>

          <div className="card">
            <h2>Contact & Links</h2>
            <div className="grid2">
              <div className="field"><label>LinkedIn (optional)</label>
                <input value={links.linkedin} onChange={(e) => setLinks({ ...links, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." /></div>
              <div className="field"><label>GitHub (optional)</label>
                <input value={links.github} onChange={(e) => setLinks({ ...links, github: e.target.value })} placeholder="https://github.com/..." /></div>
              <div className="field"><label>Website / Other (optional)</label>
                <input value={links.website} onChange={(e) => setLinks({ ...links, website: e.target.value })} placeholder="https://..." /></div>
              <div className="field"><label>Address (optional)</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Teacher's Colony, Coimbatore 641035" /></div>
            </div>
          </div>

          <div className="submit-row">
            {error && <div className="error-msg">{error}</div>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
      <div className="pf-footer">
        <div className="container">
          <span className="powered">Powered by <img src="https://clever-pithivier-419872.netlify.app/Untitled_design-removebg-preview.png" alt="Vinsup Skill Academy" style={{ height: 34 }} /></span>
        </div>
      </div>
    </>
  );
}

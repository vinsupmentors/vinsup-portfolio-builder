import { cookies } from 'next/headers';
import { checkToken } from '../../../lib/auth';
import { readAll, storageReady } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  try {
    if (!storageReady()) return { title: 'Portfolio — Vinsup Skill Academy' };
    const all = await readAll();
    const s = all.find((x) => x.slug === params.slug);
    return { title: s ? s.name + ' — Portfolio | Vinsup Skill Academy' : 'Portfolio — Vinsup Skill Academy' };
  } catch {
    return { title: 'Portfolio — Vinsup Skill Academy' };
  }
}

function NotLive({ title, msg }) {
  return (
    <div className="not-live">
      <h1>{title}</h1>
      <p>{msg}</p>
    </div>
  );
}

function csv(str) {
  return String(str || '').split(',').map((x) => x.trim()).filter(Boolean);
}

export default async function Portfolio({ params }) {
  if (!storageReady()) {
    return <NotLive title="Portfolio not available" msg="Storage is not configured yet." />;
  }
  let all = [];
  try {
    all = await readAll();
  } catch {
    return <NotLive title="Portfolio not available" msg="Could not load data. Please try again later." />;
  }
  const s = all.find((x) => x.slug === params.slug);
  if (!s) {
    return <NotLive title="Portfolio not found" msg="No portfolio exists at this link." />;
  }
  const isAdmin = checkToken(cookies().get('vsa_admin')?.value);
  if (s.status !== 'approved' && !isAdmin) {
    return (
      <NotLive
        title="This portfolio is not published yet"
        msg="It is awaiting review by Vinsup Skill Academy. Please check back later."
      />
    );
  }

  const tech = csv(s.skills);
  const soft = csv(s.softSkills);
  const hasContactLinks = s.linkedin || s.github || s.website;

  return (
    <>
      {s.status !== 'approved' && isAdmin && (
        <div style={{ background: '#fef9c3', color: '#854d0e', textAlign: 'center', padding: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
          Admin preview — this portfolio is {s.status} and not visible to the public yet.
        </div>
      )}
      <header className="pf-hero">
        <div className="container">
          {s.photo ? <img src={s.photo} alt={s.name} className="pf-photo" /> : null}
          <div>
            <h1>{s.name}</h1>
            <div className="pf-sub">{s.course}</div>
            <div className="pf-meta">
              <b>Batch:</b> {s.batch} &nbsp;•&nbsp; <b>Roll No:</b> {s.rollNumber}
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {s.about && (
          <section className="pf-section">
            <h2>About Me</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{s.about}</p>
          </section>
        )}

        {(s.experience || []).length > 0 && (
          <section className="pf-section">
            <h2>Experience</h2>
            {s.experience.map((e, i) => (
              <div className="pf-item" key={i}>
                <h3>{e.role}</h3>
                <div className="where">{e.company}</div>
                <div className="when">{e.duration}</div>
                {e.description && <p>{e.description}</p>}
              </div>
            ))}
          </section>
        )}

        {(s.education || []).length > 0 && (
          <section className="pf-section">
            <h2>Education</h2>
            {s.education.map((e, i) => (
              <div className="pf-item" key={i}>
                <h3>{e.degree}</h3>
                <div className="where">{e.institution}</div>
                <div className="when">{[e.year, e.score].filter(Boolean).join(' • ')}</div>
              </div>
            ))}
          </section>
        )}

        {(s.internships || []).length > 0 && (
          <section className="pf-section">
            <h2>Internships</h2>
            {s.internships.map((e, i) => (
              <div className="pf-item" key={i}>
                <h3>{e.role}</h3>
                <div className="where">{e.company}</div>
                <div className="when">{e.duration}</div>
                {e.description && <p>{e.description}</p>}
              </div>
            ))}
          </section>
        )}

        {(tech.length > 0 || soft.length > 0) && (
          <section className="pf-section">
            <h2>Skills</h2>
            {tech.length > 0 && (
              <div className="chips" style={{ marginBottom: 12 }}>
                {tech.map((t, i) => <span className="chip" key={i}>{t}</span>)}
              </div>
            )}
            {soft.length > 0 && (
              <div className="chips">
                {soft.map((t, i) => <span className="chip soft" key={i}>{t}</span>)}
              </div>
            )}
          </section>
        )}

        {(s.projects || []).length > 0 && (
          <section className="pf-section">
            <h2>Projects</h2>
            {s.projects.map((p, i) => (
              <div className="pf-item" key={i}>
                <h3>{p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.title} ↗</a> : p.title}</h3>
                {p.tech && <div className="where">{p.tech}</div>}
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </section>
        )}

        <section className="pf-section">
          <h2>Contact</h2>
          <ul className="contact-list">
            <li><b>Email:</b> <a href={'mailto:' + s.email}>{s.email}</a></li>
            <li><b>Phone:</b> <a href={'tel:' + s.phone}>{s.phone}</a></li>
            {s.linkedin && <li><b>LinkedIn:</b> <a href={s.linkedin} target="_blank" rel="noreferrer">{s.linkedin}</a></li>}
            {s.github && <li><b>GitHub:</b> <a href={s.github} target="_blank" rel="noreferrer">{s.github}</a></li>}
            {s.website && <li><b>Website:</b> <a href={s.website} target="_blank" rel="noreferrer">{s.website}</a></li>}
          </ul>
        </section>
      </main>

      <footer className="pf-footer">
        <div className="container">
          <span className="powered">
            Powered by&nbsp;
            <span className="vs-mark">Vinsup <span>Skill</span> Academy</span>
          </span>
        </div>
      </footer>
    </>
  );
}

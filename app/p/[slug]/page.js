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

const I = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  ),
};

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
  const initials = s.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const navItems = [
    s.about && ['about', 'About'],
    (s.experience || []).length && ['experience', 'Experience'],
    (s.education || []).length && ['education', 'Education'],
    (s.internships || []).length && ['internships', 'Internships'],
    (tech.length || soft.length) && ['skills', 'Skills'],
    (s.projects || []).length && ['projects', 'Projects'],
    ['contact', 'Contact'],
  ].filter(Boolean);

  return (
    <div className="pf">
      {s.status !== 'approved' && isAdmin && (
        <div className="pf-preview-banner">
          Admin preview — this portfolio is {s.status} and not visible to the public yet.
        </div>
      )}

      <nav className="pf-nav">
        <div className="container pf-nav-inner">
          <span className="pf-nav-name">{s.name.split(' ')[0]}<span className="dot">.</span></span>
          <div className="pf-nav-links">
            {navItems.map(([id, label]) => (
              <a key={id} href={'#' + id}>{label}</a>
            ))}
          </div>
        </div>
      </nav>

      <header className="pf-hero">
        <div className="container pf-hero-inner">
          {s.photo ? (
            <img src={s.photo} alt={s.name} className="pf-photo" />
          ) : (
            <div className="pf-photo pf-initials">{initials}</div>
          )}
          <div className="pf-hero-text">
            <div className="pf-kicker">Hello, I&apos;m</div>
            <h1>{s.name}</h1>
            <div className="pf-underline" />
            <div className="pf-sub">{s.course}</div>
            <div className="pf-meta">
              <span><b>Batch</b> {s.batch}</span>
              <span className="sep" />
              <span><b>Roll No</b> {s.rollNumber}</span>
            </div>
            <div className="pf-cta">
              <a className="pf-btn solid" href={'mailto:' + s.email}>{I.mail} Email Me</a>
              <a className="pf-btn ghost" href={'tel:' + s.phone}>{I.phone} Call</a>
              {s.linkedin && <a className="pf-icon-btn" href={s.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">{I.linkedin}</a>}
              {s.github && <a className="pf-icon-btn" href={s.github} target="_blank" rel="noreferrer" aria-label="GitHub">{I.github}</a>}
              {s.website && <a className="pf-icon-btn" href={s.website} target="_blank" rel="noreferrer" aria-label="Website">{I.globe}</a>}
            </div>
          </div>
        </div>
      </header>

      <main className="container pf-main">
        {s.about && (
          <section className="pf-section" id="about">
            <h2><span className="num">01</span> About Me</h2>
            <div className="pf-card pf-about">
              <p style={{ whiteSpace: 'pre-line' }}>{s.about}</p>
            </div>
          </section>
        )}

        {(s.experience || []).length > 0 && (
          <section className="pf-section" id="experience">
            <h2><span className="num">02</span> Experience</h2>
            <div className="pf-timeline">
              {s.experience.map((e, i) => (
                <div className="pf-titem" key={i}>
                  <div className="pf-tdot" />
                  <div className="pf-card">
                    <div className="pf-titem-head">
                      <h3>{e.role}</h3>
                      {e.duration && <span className="pf-when">{e.duration}</span>}
                    </div>
                    <div className="pf-where">{e.company}</div>
                    {e.description && <p>{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(s.education || []).length > 0 && (
          <section className="pf-section" id="education">
            <h2><span className="num">03</span> Education</h2>
            <div className="pf-timeline">
              {s.education.map((e, i) => (
                <div className="pf-titem" key={i}>
                  <div className="pf-tdot" />
                  <div className="pf-card">
                    <div className="pf-titem-head">
                      <h3>{e.degree}</h3>
                      {e.year && <span className="pf-when">{e.year}</span>}
                    </div>
                    <div className="pf-where">{e.institution}</div>
                    {e.score && <p>{e.score}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(s.internships || []).length > 0 && (
          <section className="pf-section" id="internships">
            <h2><span className="num">04</span> Internships</h2>
            <div className="pf-timeline">
              {s.internships.map((e, i) => (
                <div className="pf-titem" key={i}>
                  <div className="pf-tdot" />
                  <div className="pf-card">
                    <div className="pf-titem-head">
                      <h3>{e.role}</h3>
                      {e.duration && <span className="pf-when">{e.duration}</span>}
                    </div>
                    <div className="pf-where">{e.company}</div>
                    {e.description && <p>{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(tech.length > 0 || soft.length > 0) && (
          <section className="pf-section" id="skills">
            <h2><span className="num">05</span> Skills</h2>
            <div className="pf-card">
              {tech.length > 0 && (
                <>
                  <div className="pf-skill-label">Technical</div>
                  <div className="chips">
                    {tech.map((t, i) => <span className="chip" key={i}>{t}</span>)}
                  </div>
                </>
              )}
              {soft.length > 0 && (
                <>
                  <div className="pf-skill-label" style={{ marginTop: tech.length ? 18 : 0 }}>Soft Skills</div>
                  <div className="chips">
                    {soft.map((t, i) => <span className="chip soft" key={i}>{t}</span>)}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {(s.projects || []).length > 0 && (
          <section className="pf-section" id="projects">
            <h2><span className="num">06</span> Projects</h2>
            <div className="pf-grid">
              {s.projects.map((p, i) => (
                <div className="pf-card pf-project" key={i}>
                  <h3>{p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.title} ↗</a> : p.title}</h3>
                  {p.tech && (
                    <div className="chips" style={{ margin: '8px 0' }}>
                      {csv(p.tech).map((t, j) => <span className="chip mini" key={j}>{t}</span>)}
                    </div>
                  )}
                  {p.description && <p>{p.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="pf-section" id="contact">
          <h2><span className="num">{String(navItems.length).padStart(2, '0')}</span> Contact</h2>
          <div className="pf-grid pf-contact-grid">
            <a className="pf-card pf-contact" href={'mailto:' + s.email}>
              <span className="pf-cicon">{I.mail}</span>
              <div><b>Email</b><span>{s.email}</span></div>
            </a>
            <a className="pf-card pf-contact" href={'tel:' + s.phone}>
              <span className="pf-cicon">{I.phone}</span>
              <div><b>Phone</b><span>{s.phone}</span></div>
            </a>
            {s.linkedin && (
              <a className="pf-card pf-contact" href={s.linkedin} target="_blank" rel="noreferrer">
                <span className="pf-cicon">{I.linkedin}</span>
                <div><b>LinkedIn</b><span>View profile</span></div>
              </a>
            )}
            {s.github && (
              <a className="pf-card pf-contact" href={s.github} target="_blank" rel="noreferrer">
                <span className="pf-cicon">{I.github}</span>
                <div><b>GitHub</b><span>View projects</span></div>
              </a>
            )}
            {s.website && (
              <a className="pf-card pf-contact" href={s.website} target="_blank" rel="noreferrer">
                <span className="pf-cicon">{I.globe}</span>
                <div><b>Website</b><span>Visit site</span></div>
              </a>
            )}
          </div>
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
    </div>
  );
}

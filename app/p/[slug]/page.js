import { cookies } from 'next/headers';
import { checkToken } from '../../../lib/auth';
import { readStudent, storageReady } from '../../../lib/store';
import ScrollFX from './scrollfx';

export const dynamic = 'force-dynamic';

const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  'https://clever-pithivier-419872.netlify.app/Untitled_design-removebg-preview.png';

export async function generateMetadata({ params }) {
  try {
    if (!storageReady()) return { title: 'Portfolio — Vinsup Skill Academy' };
    const s = await readStudent(params.slug);
    return { title: s ? s.name + ' - Portfolio' : 'Portfolio — Vinsup Skill Academy' };
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
  let s = null;
  try {
    s = await readStudent(params.slug);
  } catch {
    return <NotLive title="Portfolio not available" msg="Could not load data. Please try again later." />;
  }
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

  // Skill groups: new format, with fallback to old flat skills/softSkills fields
  let groups = (s.skillGroups || []).filter((g) => (g.category || '').trim() || (g.items || '').trim());
  if (!groups.length) {
    const legacy = [];
    if (csv(s.skills).length) legacy.push({ category: 'Technical Skills', items: s.skills });
    if (csv(s.softSkills).length) legacy.push({ category: 'Soft Skills', items: s.softSkills });
    groups = legacy;
  }

  const initials = s.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const hasTimeline = (arr) => Array.isArray(arr) && arr.length > 0;

  const navItems = [
    s.about && ['about', 'About'],
    hasTimeline(s.experience) && ['experience', 'Experience'],
    hasTimeline(s.education) && ['education', 'Education'],
    hasTimeline(s.internships) && ['internships', 'Internships'],
    hasTimeline(s.projects) && ['projects', 'Projects'],
    groups.length && ['skills', 'Skills'],
    ['contact', 'Contact'],
  ].filter(Boolean);

  const year = new Date().getFullYear();

  return (
    <div className="pf">
      <ScrollFX />
      {s.status !== 'approved' && isAdmin && (
        <div className="pf-preview-banner">
          Admin preview — this portfolio is {s.status} and not visible to the public yet.
        </div>
      )}

      <nav className="pf-nav">
        <div className="container pf-nav-inner">
          <span className="pf-nav-name">{s.name}</span>
          <div className="pf-nav-links">
            {navItems.map(([id, label]) => (
              <a key={id} href={'#' + id}>{label}</a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero — centered like the reference */}
      <header className="pf-hero2">
        <div className="container">
          {s.photo ? (
            <img src={s.photo} alt={s.name} className="pf-photo2" />
          ) : (
            <div className="pf-photo2 pf-initials2">{initials}</div>
          )}
          <h1>{s.name}</h1>
          <p className="pf-tagline">{s.tagline || s.course}</p>
        </div>
        <div className="pf-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,56 C240,92 480,8 720,36 C960,64 1200,92 1440,44 L1440,90 L0,90 Z" fill="#ffffff" />
          </svg>
        </div>
      </header>

      {/* About */}
      {s.about && (
        <section className="pf-sec" id="about">
          <div className="container reveal">
            <h2 className="pf-h2">About Me</h2>
            <div className={'pf-about2' + (s.photo ? ' with-img' : '')}>
              {s.photo && <img src={s.photo} alt={s.name} className="pf-about-img" />}
              <p style={{ whiteSpace: 'pre-line' }}>{s.about}</p>
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {hasTimeline(s.experience) && (
        <section className="pf-sec alt" id="experience">
          <div className="container reveal">
            <h2 className="pf-h2">Experience</h2>
            <div className="pf-grid">
              {s.experience.map((e, i) => (
                <div className="pf-card2" key={i}>
                  <h3>{e.role}</h3>
                  <div className="pf-where2">{e.company}</div>
                  {e.duration && <div className="pf-when2">{e.duration}</div>}
                  {e.description && <p>{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {hasTimeline(s.education) && (
        <section className="pf-sec" id="education">
          <div className="container reveal">
            <h2 className="pf-h2">Education</h2>
            <div className="pf-grid">
              {s.education.map((e, i) => (
                <div className="pf-card2" key={i}>
                  <h3>{e.degree}</h3>
                  <div className="pf-where2">{e.institution}</div>
                  {(e.year || e.score) && (
                    <div className="pf-when2">{[e.year, e.score].filter(Boolean).join(' • ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internships */}
      {hasTimeline(s.internships) && (
        <section className="pf-sec alt" id="internships">
          <div className="container reveal">
            <h2 className="pf-h2">Internships</h2>
            <div className="pf-grid">
              {s.internships.map((e, i) => (
                <div className="pf-card2" key={i}>
                  <h3>{e.role}</h3>
                  <div className="pf-where2">{e.company}</div>
                  {e.duration && <div className="pf-when2">{e.duration}</div>}
                  {e.description && <p>{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {hasTimeline(s.projects) && (
        <section className="pf-sec" id="projects">
          <div className="container reveal">
            <h2 className="pf-h2">My Projects</h2>
            <div className="pf-grid">
              {s.projects.map((p, i) => (
                <div className="pf-card2 pf-project2" key={i}>
                  <h3>{p.title}</h3>
                  {p.tech && <div className="pf-when2">{p.tech}</div>}
                  {p.description && <p>{p.description}</p>}
                  {p.link && (
                    <a className="pf-viewlink" href={p.link} target="_blank" rel="noreferrer">
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {groups.length > 0 && (
        <section className="pf-sec alt" id="skills">
          <div className="container reveal">
            <h2 className="pf-h2">Skills</h2>
            <div className="pf-grid pf-skills-grid">
              {groups.map((g, i) => (
                <div className="pf-card2 pf-skillcard" key={i}>
                  <h3>{g.category || 'Skills'}</h3>
                  <ul>
                    {csv(g.items).map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="pf-sec" id="contact">
        <div className="container pf-contact2 reveal">
          <h2 className="pf-h2">Get In Touch</h2>
          <p className="pf-contact-intro">
            I&apos;m open to opportunities and would love to connect. Find me on these platforms:
          </p>
          <div className="pf-social-row">
            {s.linkedin && <a className="pf-social" href={s.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            {s.github && <a className="pf-social" href={s.github} target="_blank" rel="noreferrer">GitHub</a>}
            {s.website && <a className="pf-social" href={s.website} target="_blank" rel="noreferrer">Website</a>}
          </div>
          <div className="pf-contact-lines">
            <div>📧 <a href={'mailto:' + s.email}>{s.email}</a></div>
            <div>📞 <a href={'tel:' + s.phone}>{s.phone}</a></div>
            {s.address && <div>📍 {s.address}</div>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pf-footer2">
        <div className="container pf-footer2-inner">
          <div>© {year} {s.name}. All Rights Reserved.</div>
          <div className="powered2">
            Powered by
            <img src={LOGO_URL} alt="Vinsup Skill Academy" />
          </div>
        </div>
      </footer>
    </div>
  );
}

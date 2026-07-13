import { NextResponse } from 'next/server';
import {
  storageReady, slugify, studentExists, writeStudent, updateIndex, indexEntry, readIndex,
} from '../../../lib/store';

const RESERVED = new Set(['admin', 'thanks', 'api', 'p', '_next', 'favicon.ico', 'robots.txt']);

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    if (!storageReady()) {
      return NextResponse.json(
        { error: 'Storage is not configured yet. Please contact the academy.' },
        { status: 503 }
      );
    }
    const b = await req.json();
    const required = [
      ['name', 'Full Name'], ['batch', 'Batch No'], ['course', 'Course'],
      ['rollNumber', 'Roll Number'], ['phone', 'Contact Number'], ['email', 'Email'],
    ];
    for (const [f, label] of required) {
      if (!b[f] || !String(b[f]).trim()) {
        return NextResponse.json({ error: label + ' is required.' }, { status: 400 });
      }
    }
    if (b.photo && String(b.photo).length > 400000) {
      return NextResponse.json({ error: 'Photo is too large. Please choose a smaller image.' }, { status: 400 });
    }
    // one submission per roll number
    const roll = String(b.rollNumber).trim().toLowerCase();
    const idx = await readIndex();
    if (idx.some((e) => String(e.rollNumber || '').trim().toLowerCase() === roll)) {
      return NextResponse.json(
        { error: 'A submission with this roll number already exists. Please contact the academy if this is a mistake.' },
        { status: 409 }
      );
    }
    // clean URL from the student's name, e.g. /venkatesh-prasad-s
    let base = slugify(b.name) || 'student';
    if (RESERVED.has(base)) base = base + '-vsa';
    let slug = base;
    for (let n = 2; RESERVED.has(slug) || (await studentExists(slug)); n++) {
      slug = base + '-' + n;
    }
    const student = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      slug,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      name: String(b.name).trim(),
      batch: String(b.batch).trim(),
      course: String(b.course).trim(),
      rollNumber: String(b.rollNumber).trim(),
      phone: String(b.phone).trim(),
      email: String(b.email).trim().toLowerCase(),
      tagline: b.tagline ? String(b.tagline).trim() : '',
      about: b.about || '',
      photo: b.photo || '',
      skills: b.skills || '',
      softSkills: b.softSkills || '',
      skillGroups: Array.isArray(b.skillGroups) ? b.skillGroups : [],
      address: b.address ? String(b.address).trim() : '',
      education: Array.isArray(b.education) ? b.education : [],
      experience: Array.isArray(b.experience) ? b.experience : [],
      internships: Array.isArray(b.internships) ? b.internships : [],
      projects: Array.isArray(b.projects) ? b.projects : [],
      linkedin: b.linkedin || '',
      github: b.github || '',
      website: b.website || '',
    };
    try {
      await writeStudent(student, { overwrite: false });
    } catch (e) {
      if (e && e.message && /exist/i.test(e.message)) {
        return NextResponse.json(
          { error: 'A submission with this roll number already exists.' },
          { status: 409 }
        );
      }
      throw e;
    }
    await updateIndex((entries) => [
      ...entries.filter((x) => x.slug !== slug),
      indexEntry(student),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Something went wrong: ' + (e && e.message ? e.message : 'unknown error') },
      { status: 500 }
    );
  }
}

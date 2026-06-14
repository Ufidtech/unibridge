// Lightweight profile helpers used by frontend components
export const defaultMenteeProfile = {
  school: '',
  classLevel: '',
  dreamCourse: '',
};

export const defaultMentorProfile = {
  title: '',
  bio: '',
  university: '',
  skills: [],
  sessionPrice: '',
};

export function normalizeSchool(school) {
  if (!school) return '';
  return String(school).trim();
}

export function buildMenteePayload(form) {
  const classLevel = form.classLevel || form.studentClass || '';
  const school = normalizeSchool(form.school || form.university || form.universityName || '');

  return {
    school,
    university: school,
    universityName: school,
    classLevel,
    studentClass: classLevel,
    dreamCourse: form.dreamCourse || '',
    selectedVibes: Array.isArray(form.selectedVibes) ? form.selectedVibes : [],
  };
}


export function buildMentorPayload(form) {
  return {
    title: form.title || '',
    bio: form.bio || '',
    university: form.university || '',
    skills: Array.isArray(form.skills) ? form.skills : (form.skills ? [form.skills] : []),
    responseTime: form.responseTime || form.response_time || form.response || '',
    sessionPrice: form.sessionPrice === '' || form.sessionPrice == null ? '' : Number(form.sessionPrice),
  };
}

export default {
  defaultMenteeProfile,
  defaultMentorProfile,
  normalizeSchool,
  buildMenteePayload,
  buildMentorPayload,
};


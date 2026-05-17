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
};

export function normalizeSchool(school) {
  if (!school) return '';
  return String(school).trim();
}

export function buildMenteePayload(form) {
  return {
    school: normalizeSchool(form.school || ''),
    classLevel: form.classLevel || '',
    dreamCourse: form.dreamCourse || '',
  };
}

export function buildMentorPayload(form) {
  return {
    title: form.title || '',
    bio: form.bio || '',
    university: form.university || '',
    skills: Array.isArray(form.skills) ? form.skills : (form.skills ? [form.skills] : []),
    responseTime: form.responseTime || form.response_time || form.response || '',
  };
}

export default {
  defaultMenteeProfile,
  defaultMentorProfile,
  normalizeSchool,
  buildMenteePayload,
};

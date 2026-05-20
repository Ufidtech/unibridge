import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateMe } from '../../lib/api/auth';
import { buildMenteePayload } from '../../lib/profile';

export default function MenteeProfile({ userInfo, universitySuggestions, onNavigate }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ school: '', classLevel: '', dreamCourse: '' });
  const [schoolChoice, setSchoolChoice] = useState('');
  const [schoolManual, setSchoolManual] = useState('');

  // Initialize form when userInfo changes
  useEffect(() => {
    if (userInfo?.menteeProfile) {
      const existingSchool = userInfo.menteeProfile.school || userInfo.menteeProfile.university || '';
      setProfileForm({
        school: existingSchool,
        classLevel: userInfo.menteeProfile.classLevel || '',
        dreamCourse: userInfo.menteeProfile.dreamCourse || '',
      });
      setSchoolManual(existingSchool);
    }
  }, [userInfo]);

  const handleSaveProfile = async () => {
    try {
      const schoolToSave = (schoolChoice === 'Other') ? (schoolManual || profileForm.school) : (schoolChoice || profileForm.school);
      const payload = buildMenteePayload({ ...profileForm, school: schoolToSave });
      const updated = await updateMe(payload);
      const newUser = updated.user;
      
      if (newUser && newUser.role === 'MENTEE') {
        localStorage.setItem('menteeData', JSON.stringify(newUser));
        if (onNavigate) onNavigate('/mentee-dashboard', newUser);
      }
      
      setEditingProfile(false);
      setProfileForm({
        school: newUser?.menteeProfile?.school || newUser?.menteeProfile?.university || '',
        classLevel: newUser?.menteeProfile?.classLevel || '',
        dreamCourse: newUser?.menteeProfile?.dreamCourse || '',
      });
      setSchoolChoice('');
      setSchoolManual('');
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      school: userInfo?.menteeProfile?.school || userInfo?.menteeProfile?.university || '',
      classLevel: userInfo?.menteeProfile?.classLevel || '',
      dreamCourse: userInfo?.menteeProfile?.dreamCourse || '',
    });
    setEditingProfile(false);
    setSchoolChoice('');
    setSchoolManual('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Your Profile</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-slate-300 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Name</label>
          <input 
            value={userInfo?.name || ''} 
            readOnly 
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 cursor-not-allowed" 
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Which school would you like to attend?</label>
          {!editingProfile ? (
            <input 
              value={profileForm.school} 
              readOnly 
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 cursor-not-allowed" 
            />
          ) : (
            <div className="space-y-2">
              <select
                aria-label="Select suggested school"
                value={universitySuggestions.includes(schoolChoice) ? schoolChoice : (universitySuggestions.includes(profileForm.school) ? profileForm.school : (schoolChoice || ''))}
                onChange={(e) => {
                  const v = e.target.value;
                  setSchoolChoice(v);
                  if (v !== 'Other') {
                    setProfileForm({ ...profileForm, school: v });
                    setSchoolManual('');
                  } else {
                    setSchoolManual(profileForm.school || '');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- choose a school --</option>
                {universitySuggestions.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="Other">Other (enter manually)</option>
              </select>

              {schoolChoice === 'Other' || (!schoolChoice && !universitySuggestions.includes(profileForm.school)) ? (
                <input
                  placeholder="Type your school name"
                  value={schoolManual}
                  onChange={(e) => setSchoolManual(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                />
              ) : null}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Dream Course</label>
          <input 
            value={profileForm.dreamCourse} 
            readOnly={!editingProfile} 
            onChange={(e) => setProfileForm({ ...profileForm, dreamCourse: e.target.value })} 
            className={`w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500 ${editingProfile ? 'bg-slate-800 border border-slate-700 text-slate-100' : 'bg-slate-900 border border-slate-900 text-slate-500 cursor-not-allowed'}`} 
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Class Level</label>
          <input 
            value={profileForm.classLevel} 
            readOnly={!editingProfile} 
            onChange={(e) => setProfileForm({ ...profileForm, classLevel: e.target.value })} 
            className={`w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500 ${editingProfile ? 'bg-slate-800 border border-slate-700 text-slate-100' : 'bg-slate-900 border border-slate-900 text-slate-500 cursor-not-allowed'}`} 
          />
        </div>

        <div className="flex gap-3 items-center pt-2">
          {!editingProfile ? (
            <button 
              onClick={() => setEditingProfile(true)} 
              className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                onClick={handleSaveProfile} 
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded cursor-pointer hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
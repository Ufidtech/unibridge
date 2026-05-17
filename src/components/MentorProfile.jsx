import React from 'react';

export default function MentorProfile({
  editingProfile,
  setEditingProfile,
  profileForm,
  setProfileForm,
  fullMentorProfile,
  loadingProfile,
  mentorInfo,
  computedRating,
  onSave
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-6">👤 My Profile</h2>
      
      {/* Profile Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
        {editingProfile ? (
          <div className="space-y-6">
            {/* Edit Form */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name || fullMentorProfile?.name || mentorInfo?.name || ''}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={fullMentorProfile?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title / Role</label>
              <input
                type="text"
                value={profileForm.title || ''}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">University</label>
              <input
                type="text"
                value={profileForm.university || ''}
                onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Your university"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio / About</label>
              <textarea
                value={profileForm.bio || ''}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Tell mentees about yourself..."
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expertise (comma-separated)</label>
              <input
                type="text"
                value={profileForm.expertise || ''}
                onChange={(e) => setProfileForm({ ...profileForm, expertise: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g., React, JavaScript, Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Availability / Response Time</label>
              <select
                value={profileForm.responseTime || ''}
                onChange={(e) => setProfileForm({ ...profileForm, responseTime: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select availability</option>
                <option value="Not Available">Not Available</option>
                <option value="1-2 hours/week">1-2 hours/week</option>
                <option value="3-4 hours/week">3-4 hours/week</option>
                <option value="5+ hours/week">5+ hours/week</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded border border-slate-700 cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* View Mode */}
            {loadingProfile ? (
              <p className="text-slate-400">Loading profile...</p>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <p className="text-slate-100 font-medium">{fullMentorProfile?.name || mentorInfo?.name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <p className="text-slate-100 font-medium">{fullMentorProfile?.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Title / Role</label>
                  <p className="text-slate-100 font-medium">{fullMentorProfile?.title || mentorInfo?.title || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">University</label>
                  <p className="text-slate-100 font-medium">{fullMentorProfile?.universityName || fullMentorProfile?.university || mentorInfo?.university || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                  <p className="text-slate-100">{fullMentorProfile?.bio || mentorInfo?.bio || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Expertise / Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {fullMentorProfile?.skills && Array.isArray(fullMentorProfile.skills) && fullMentorProfile.skills.length > 0 ? (
                      fullMentorProfile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400">Not set</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Availability / Response Time</label>
                  <p className="text-slate-100">{fullMentorProfile?.responseTime || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Average Rating</label>
                  <p className="text-slate-100 font-medium">
                    {computedRating?.average ? `${computedRating.average.toFixed(1)} ⭐` : 'No ratings yet'}
                  </p>
                  {computedRating?.count > 0 && (
                    <p className="text-slate-400 text-sm">Based on {computedRating.count} reviews</p>
                  )}
                </div>

                <button
                  onClick={() => setEditingProfile(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
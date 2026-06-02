import React, { useState } from "react";
import toast from "react-hot-toast";
import { createMentorGroupSession } from "../../lib/api/sessions";

export default function GroupSessionCreate({
  onSessionCreated,
}) {

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);

  const [loading, setLoading] = useState(false);

  const [meetLink, setMeetLink] = useState("");
  const [meetingProvider, setMeetingProvider] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await createMentorGroupSession({
          topic,
          notes,
          sessionDate,
          sessionTime,
          maxParticipants,
          timezone:
            Intl.DateTimeFormat()
              .resolvedOptions()
              .timeZone,
        });

      const session = response.session;

      setMeetLink(
        session.meetLink || ""
      );

      setMeetingProvider(
        session.meetingProvider || ""
      );

      toast.success(
        "Session created successfully!"
      );

      setTopic("");
      setNotes("");
      setSessionDate("");
      setSessionTime("");
      setMaxParticipants(10);

      onSessionCreated?.();

    } catch (err) {

      console.log(err);

      toast.error(
        err?.response?.data?.error ||
        err?.message ||
        "Failed creating session"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="max-w-xl mx-auto mt-8">

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-lg p-8"
      >

        <h2 className="text-2xl font-bold text-white mb-6">
          Create Group Session
        </h2>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">
            Topic
          </label>

          <input
            value={topic}
            onChange={(e)=>
              setTopic(e.target.value)
            }
            required
            className="w-full p-3 rounded bg-slate-800 text-white"
          />
        </div>

        <div className="mb-4">

          <label className="block text-gray-300 mb-2">
            Description
          </label>

          <textarea
            value={notes}
            onChange={(e)=>
              setNotes(e.target.value)
            }
            className="w-full p-3 rounded bg-slate-800 text-white"
          />

        </div>

        <div className="flex gap-4 mb-4">

          <div className="flex-1">

            <label className="block text-gray-300 mb-2">
              Date
            </label>

            <input
              type="date"
              value={sessionDate}
              onChange={(e)=>
                setSessionDate(e.target.value)
              }
              required
              className="w-full p-3 rounded bg-slate-800 text-white"
            />

          </div>

          <div className="flex-1">

            <label className="block text-gray-300 mb-2">
              Time
            </label>

            <input
              type="time"
              value={sessionTime}
              onChange={(e)=>
                setSessionTime(e.target.value)
              }
              required
              className="w-full p-3 rounded bg-slate-800 text-white"
            />

          </div>

        </div>

        <div className="mb-6">

          <label className="block text-gray-300 mb-2">
            Max Participants
          </label>

          <input
            type="number"
            min={2}
            max={100}
            value={maxParticipants}
            onChange={(e)=>
              setMaxParticipants(
                Number(e.target.value)
              )
            }
            className="w-full p-3 rounded bg-slate-800 text-white"
          />

        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 rounded p-3 text-white"
        >
          {loading
            ? "Creating..."
            : "Create Session"}
        </button>

      </form>

      {meetLink && (

        <div className="mt-6 bg-slate-900 border border-green-600 rounded-lg p-4">

          <h3 className="text-green-400 font-bold mb-2">

            {meetingProvider === "GOOGLE_MEET"
              ? "Google Meet Generated"
              : "Meeting Room Generated"}

          </h3>

          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 break-all"
          >
            {meetLink}
          </a>

          {meetingProvider === "JITSI" && (

            <div className="bg-yellow-900 rounded p-3 mt-4 text-yellow-100">

              Temporary meeting room generated.

              Google Meet will automatically replace
              this after OAuth approval.

            </div>

          )}

        </div>

      )}

    </div>
  );
}
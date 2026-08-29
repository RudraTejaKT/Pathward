import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import "./StudyNotesPad.css";

export default function StudyNotesPad({ topic = "General Study Notes", courseId = "", isOpen, onClose }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [noteTag, setNoteTag] = useState("Key Concept");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Load existing notes
  useEffect(() => {
    if (user) {
      api
        .getStudyNotes()
        .then((res) => {
          setNotes(res || []);
        })
        .catch(() => {
          // Fallback to local storage
          const local = JSON.parse(localStorage.getItem(`backlox_study_notes_${user?.id || "guest"}`) || "[]");
          setNotes(local);
        });
    } else {
      const local = JSON.parse(localStorage.getItem(`backlox_study_notes_${user?.id || "guest"}`) || "[]");
      setNotes(local);
    }
  }, [user]);

  async function handleSaveNote(e) {
    e.preventDefault();
    if (!currentNote.trim()) return;

    setSaving(true);
    const newNoteObj = {
      id: Date.now(),
      topic: topic || "Course Notes",
      course_id: courseId,
      note_content: currentNote.trim(),
      tags: noteTag,
      created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    try {
      if (user) {
        const saved = await api.saveStudyNote({
          topic: topic || "Course Notes",
          courseId,
          noteContent: currentNote.trim(),
          tags: noteTag,
        });
        setNotes((prev) => [saved, ...prev]);
      } else {
        const updated = [newNoteObj, ...notes];
        setNotes(updated);
        localStorage.setItem(`backlox_study_notes_${user?.id || "guest"}`, JSON.stringify(updated));
      }
      setCurrentNote("");
    } catch {
      const updated = [newNoteObj, ...notes];
      setNotes(updated);
      localStorage.setItem(`backlox_study_notes_${user?.id || "guest"}`, JSON.stringify(updated));
      setCurrentNote("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(id) {
    if (user) {
      try {
        await api.deleteStudyNote(id);
      } catch {
        // ignore
      }
    }
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`backlox_study_notes_${user?.id || "guest"}`, JSON.stringify(updated));
  }

  function handleCopyNote(n) {
    const text = `[${n.topic} — ${n.tags}]\n${n.note_content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleExportNotes() {
    const markdown = `# Study Notes: ${topic}\nGenerated via Backlox Universe DRM Protected LMS\n\n` +
      notes.map((n) => `### [${n.tags || "Note"}] ${n.topic}\n*${n.created_at || "Recent"}*\n\n${n.note_content}\n\n---`).join("\n\n");

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Backlox_Notes_${(topic || "Course").replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isOpen) return null;

  return (
    <div className="study-notes-drawer glass-card animate-slide-left">
      <div className="notes-drawer-header">
        <div className="notes-title-wrap">
          <span className="material-symbols-outlined notes-header-icon">edit_note</span>
          <div>
            <h3 className="notes-title">Smart Study Notes</h3>
            <span className="mono text-xs text-muted">{topic}</span>
          </div>
        </div>
        <button type="button" className="notes-close-btn" onClick={onClose} title="Close Notes">
          ✕
        </button>
      </div>

      <form onSubmit={handleSaveNote} className="notes-create-form">
        <div className="notes-tag-pills">
          {["Key Concept", "Formula / Derivation", "Exam Question", "Action Item"].map((tag) => (
            <button
              type="button"
              key={tag}
              className={`note-tag-chip mono ${noteTag === tag ? "active" : ""}`}
              onClick={() => setNoteTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          required
          placeholder="Type your notes, formulas, or clinical mnemonic here..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="notes-textarea"
        />

        <div className="notes-form-actions">
          <button type="submit" className="cyber-btn cyber-btn--primary" disabled={saving}>
            {saving ? "Saving…" : "💾 Save Note"}
          </button>
          {notes.length > 0 && (
            <button
              type="button"
              className="cyber-btn cyber-btn--secondary"
              onClick={handleExportNotes}
              title="Export all notes to Markdown"
            >
              📥 Export .MD
            </button>
          )}
        </div>
      </form>

      <div className="notes-list-stack">
        <div className="notes-list-header">
          <span className="mono text-xs text-muted">SAVED NOTES ({notes.length})</span>
        </div>

        {notes.length === 0 ? (
          <div className="empty-notes-box">
            <span className="material-symbols-outlined">description</span>
            <p className="mono text-xs">No notes captured yet for this lecture.</p>
          </div>
        ) : (
          notes.map((n) => (
            <div className="saved-note-card glass-card" key={n.id}>
              <div className="note-card-header">
                <span className="note-chip mono">{n.tags || "Note"}</span>
                <div className="note-card-actions">
                  <button
                    type="button"
                    className="note-action-btn"
                    onClick={() => handleCopyNote(n)}
                    title="Copy note"
                  >
                    {copiedId === n.id ? "✓ Copied" : "📋 Copy"}
                  </button>
                  <button
                    type="button"
                    className="note-action-btn note-del-btn"
                    onClick={() => handleDeleteNote(n.id)}
                    title="Delete note"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="note-text-body">{n.note_content}</p>
              <div className="note-time-bar mono text-xs text-muted">
                <span>{n.created_at || "Recent"}</span>
                {n.topic && <span>· {n.topic}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

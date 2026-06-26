import React, { useState, useEffect } from 'react';
import { taskAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const CommentSection = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!taskId) return;
    taskAPI.getComments(taskId)
      .then(({ data }) => setComments(data.data.comments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await taskAPI.addComment(taskId, text.trim());
      setComments(c => [...c, data.data.comment]);
      setText('');
      toast.success('Comment added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment.');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const { data } = await commentAPI.edit(id, editText.trim());
      setComments(c => c.map(cm => cm._id === id ? data.data.comment : cm));
      setEditingId(null);
      toast.success('Comment updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentAPI.delete(id);
      setComments(c => c.filter(cm => cm._id !== id));
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 Comments
        <span style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>
          {comments.length}
        </span>
      </div>

      {/* Comment list */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
      ) : comments.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>No comments yet. Be the first!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {comments.map(cm => (
            <div key={cm._id} style={{ display: 'flex', gap: 10 }}>
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0, background: cm.author?.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>
                {getInitials(cm.author?.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{cm.author?.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(cm.createdAt), { addSuffix: true })}
                  </span>
                  {cm.isEdited && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>(edited)</span>}
                </div>

                {editingId === cm._id ? (
                  <div>
                    <textarea
                      className="form-textarea"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      style={{ minHeight: 60, fontSize: 13, marginBottom: 6 }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleEdit(cm._id)}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {cm.text}
                    </p>
                    {(String(cm.author?._id) === String(user?._id) || user?.role === 'admin') && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {String(cm.author?._id) === String(user?._id) && (
                          <button
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                            onClick={() => { setEditingId(cm._id); setEditText(cm.text); }}
                          >Edit</button>
                        )}
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                          onClick={() => handleDelete(cm._id)}
                        >Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0, background: user?.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>
          {getInitials(user?.name)}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            className="form-textarea"
            placeholder="Write a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ minHeight: 60, fontSize: 13, marginBottom: 6 }}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAdd(e); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter to submit</span>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !text.trim()}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;

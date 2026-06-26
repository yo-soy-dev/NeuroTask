import React, { useState, useEffect, useCallback } from 'react';
import { activityAPI } from '../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import Pagination from '../components/Pagination';

const ACTION_ICONS = {
  task_created: { icon: '✅', color: 'var(--success)', label: 'Created task' },
  task_updated: { icon: '✏️', color: 'var(--info)', label: 'Updated task' },
  task_deleted: { icon: '🗑️', color: 'var(--danger)', label: 'Deleted task' },
  task_status_changed: { icon: '🔄', color: 'var(--warning)', label: 'Changed status' },
  task_assigned: { icon: '👤', color: 'var(--accent-light)', label: 'Assigned task' },
  task_commented: { icon: '💬', color: 'var(--info)', label: 'Commented on' },
  task_attachment_added: { icon: '📎', color: 'var(--warning)', label: 'Attached file to' },
  user_created: { icon: '👥', color: 'var(--success)', label: 'Created user' },
  user_updated: { icon: '✏️', color: 'var(--info)', label: 'Updated user' },
  user_deleted: { icon: '🗑️', color: 'var(--danger)', label: 'Deleted user' },
  user_login: { icon: '🔐', color: 'var(--accent-light)', label: 'Logged in' },
  user_register: { icon: '🎉', color: 'var(--success)', label: 'Registered' },
};

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');

  const fetchActivity = useCallback(() => {
    setLoading(true);
    activityAPI.getAll({ page, limit: 20, ...(entityFilter ? { entity: entityFilter } : {}) })
      .then(({ data }) => {
        setActivities(data.data.activities);
        setMeta(data.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, entityFilter]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Activity Log</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Track all actions across the system</p>
      </div>

      {/* Filter */}
      <div className="toolbar">
        <select className="form-select" style={{ width: 'auto' }} value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }}>
          <option value="">All Activities</option>
          <option value="task">Tasks Only</option>
          <option value="user">Users Only</option>
          <option value="auth">Auth Only</option>
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{meta.total} total events</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-full"><div className="loading-spinner" /></div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No activity yet.</div>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {activities.map((act, idx) => {
              const info = ACTION_ICONS[act.action] || { icon: '📌', color: 'var(--text-muted)', label: act.action };
              return (
                <div key={act._id} style={{
                  display: 'flex', gap: 14, padding: '12px 20px',
                  borderBottom: idx < activities.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  {/* Avatar */}
                  <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, flexShrink: 0, background: act.user?.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>
                    {getInitials(act.user?.name)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600 }}>{act.user?.name || 'Unknown'}</span>
                      {' '}
                      <span style={{ color: info.color, fontWeight: 500 }}>{info.icon} {info.label}</span>
                      {act.entityTitle && (
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}> "{act.entityTitle}"</span>
                      )}
                      {act.meta?.from && act.meta?.to && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {' '}({act.meta.from} → {act.meta.to})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'flex', gap: 10 }}>
                      <span>{formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</span>
                      <span>·</span>
                      <span>{format(new Date(act.createdAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>

                  {/* Entity badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: act.entity === 'task' ? 'var(--accent-dim)' : 'var(--info-dim)',
                    color: act.entity === 'task' ? 'var(--accent-light)' : 'var(--info)',
                    textTransform: 'uppercase', flexShrink: 0,
                  }}>{act.entity}</span>
                </div>
              );
            })}
          </div>
        )}
        {!loading && activities.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <Pagination {...meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
    fetchSessionsThunk,
    createSessionThunk,
    setActiveSession,
    fetchHistoryThunk,
    deleteSessionThunk,
    renameSessionThunk,
} from '../../store/slices/chatSlice';
import { Plus, LogOut, User, Settings, Database, Monitor, Puzzle, MoreHorizontal, Pencil, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PluginSidebarExtensions = () => {
    const extensions = useSelector((state) => state.plugins.uiExtensions.sidebar);
    const navigate = useNavigate();

    if (extensions.length === 0) return null;

    return (
        <div style={{ marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {extensions.map((ext) => (
                <button
                    key={ext.id}
                    onClick={() => navigate(ext.path)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', color: 'var(--text-secondary)',
                        width: '100%', cursor: 'pointer', padding: '0.5rem', marginBottom: '0.5rem'
                    }}
                >
                    <Puzzle size={18} />
                    <span>{ext.label}</span>
                </button>
            ))}
        </div>
    );
};

export default function ChatSidebar() {
    const { sessions, activeSessionId } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [menuSessionId, setMenuSessionId] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const menuRef = useRef(null);
    const renameInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchSessionsThunk());
    }, [dispatch]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuSessionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus rename input when editing
    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    const handleNewChat = () => {
        dispatch(createSessionThunk());
        navigate('/chat');
    };

    const handleSelectSession = (sessionId) => {
        if (renamingId) return; // Don't navigate while renaming
        dispatch(setActiveSession(sessionId));
        dispatch(fetchHistoryThunk(sessionId));
        navigate('/chat');
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleMenuToggle = (e, sessionId) => {
        e.stopPropagation();
        setMenuSessionId(menuSessionId === sessionId ? null : sessionId);
    };

    const handleDelete = (e, sessionId) => {
        e.stopPropagation();
        dispatch(deleteSessionThunk(sessionId));
        setMenuSessionId(null);
    };

    const handleStartRename = (e, session) => {
        e.stopPropagation();
        setRenamingId(session.id);
        setRenameValue(session.title || 'Untitled Chat');
        setMenuSessionId(null);
    };

    const handleConfirmRename = (sessionId) => {
        if (renameValue.trim()) {
            dispatch(renameSessionThunk({ sessionId, title: renameValue.trim() }));
        }
        setRenamingId(null);
    };

    const handleCancelRename = () => {
        setRenamingId(null);
        setRenameValue('');
    };

    const handleRenameKeyDown = (e, sessionId) => {
        if (e.key === 'Enter') {
            handleConfirmRename(sessionId);
        } else if (e.key === 'Escape') {
            handleCancelRename();
        }
    };

    return (
        <div className="chat-sidebar">
            <h3>AI Coordinator</h3>

            <button className="new-chat-btn" onClick={handleNewChat}>
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                New Chat
            </button>

            <div className="session-list">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className={`session-item ${activeSessionId === session.id ? 'active' : ''}`}
                        onClick={() => handleSelectSession(session.id)}
                    >
                        {renamingId === session.id ? (
                            <div className="rename-wrapper" onClick={(e) => e.stopPropagation()}>
                                <input
                                    ref={renameInputRef}
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                                    className="rename-input"
                                />
                                <button className="rename-action confirm" onClick={() => handleConfirmRename(session.id)}>
                                    <Check size={14} />
                                </button>
                                <button className="rename-action cancel" onClick={handleCancelRename}>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="session-title">{session.title || 'Untitled Chat'}</span>
                                <button
                                    className="session-menu-btn"
                                    onClick={(e) => handleMenuToggle(e, session.id)}
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                            </>
                        )}

                        {menuSessionId === session.id && (
                            <div className="session-context-menu" ref={menuRef}>
                                <button onClick={(e) => handleStartRename(e, session)}>
                                    <Pencil size={14} />
                                    <span>Rename</span>
                                </button>
                                <button className="danger" onClick={(e) => handleDelete(e, session.id)}>
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {sessions.length === 0 && <div className="session-item muted">No recent chats</div>}
            </div>

            <div style={{ marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                    onClick={() => navigate('/mcp')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', color: 'var(--text-secondary)',
                        width: '100%', cursor: 'pointer', padding: '0.5rem', marginBottom: '0.5rem'
                    }}
                >
                    <Settings size={18} />
                    <span>MCP Controls</span>
                </button>

                <button
                    onClick={() => navigate('/models')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', color: 'var(--text-secondary)',
                        width: '100%', cursor: 'pointer', padding: '0.5rem', marginBottom: '0.5rem'
                    }}
                >
                    <Database size={18} />
                    <span>Models</span>
                </button>



                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', color: 'var(--text-secondary)',
                        width: '100%', cursor: 'pointer', padding: '0.5rem'
                    }}
                >
                    <Monitor size={18} />
                    <span>Settings</span>
                </button>
            </div>

            <PluginSidebarExtensions />

            <div className="user-profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} />
                    <span>{user?.username}</span>
                </div>
                <button onClick={handleLogout} title="Logout" style={{ background: 'none' }}>
                    <LogOut size={20} color="var(--text-secondary)" />
                </button>
            </div>
        </div>
    );
}

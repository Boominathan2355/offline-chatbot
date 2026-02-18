
import { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import ChatSidebar from '../components/chat/ChatSidebar';
import { Server, ToggleLeft, ToggleRight, Activity, Terminal, Plus, Trash2, X, Info } from 'lucide-react';
import '../styles/components/agent.scss';

export default function MCPControls() {
    const [mcps, setMcps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [form, setForm] = useState({
        id: '',
        name: '',
        command: '',
        args: '',
        env: '',
        description: ''
    });

    const fetchMcps = async () => {
        try {
            setLoading(true);
            const data = await agentApi.listMcps();
            setMcps(data.mcps || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMcps();
    }, []);

    const handleToggle = async (mcpId, currentStatus) => {
        try {
            setMcps(prev => prev.map(m =>
                m.id === mcpId ? { ...m, enabled: !currentStatus } : m
            ));
            await agentApi.toggleMcp(mcpId, !currentStatus);
        } catch (err) {
            fetchMcps(); // Refresh to sync on error
            alert('Failed to update MCP status');
        }
    };

    const handleDelete = async (mcpId) => {
        if (!confirm(`Are you sure you want to delete MCP server "${mcpId}"?`)) return;
        try {
            await agentApi.deleteMcp(mcpId);
            fetchMcps();
        } catch (err) {
            alert('Failed to delete MCP');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            // Parse args (comma or space separated)
            const argsList = form.args.split(',').map(a => a.trim()).filter(a => a);

            // Parse env (key=value lines)
            const envObj = {};
            form.env.split('\n').forEach(line => {
                const [key, ...rest] = line.split('=');
                if (key && rest.length) envObj[key.trim()] = rest.join('=').trim();
            });

            await agentApi.addMcp({
                id: form.id,
                name: form.name,
                command: form.command,
                args: argsList,
                env: envObj,
                description: form.description
            });

            setShowAddModal(false);
            setForm({ id: '', name: '', command: '', args: '', env: '', description: '' });
            fetchMcps();
        } catch (err) {
            alert('Failed to add MCP: ' + err.message);
        }
    };

    return (
        <div className="mcp-page" style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            <ChatSidebar />
            <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
                <div className="mcp-controls" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '2rem',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '1.5rem'
                    }}>
                        <div>
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '2rem' }}>
                                <Server size={32} color="var(--accent-color)" /> MCP Controls
                            </h1>
                            <p className="subtitle" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                                Manage Model Context Protocol (MCP) servers and system capabilities.
                            </p>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => setShowAddModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            <Plus size={20} /> Add Server
                        </button>
                    </div>

                    {loading && <div style={{ textAlign: 'center', padding: '4rem' }}><Activity className="spin" size={32} /> <br />Loading MCPs...</div>}

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ef4444' }}>
                            <Info size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Error: {error}
                        </div>
                    )}

                    <div className="mcp-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                        {!loading && mcps.map((mcp) => (
                            <div key={mcp.id} className="mcp-card" style={{
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                border: '1px solid var(--border-color)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="info">
                                        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                            {mcp.name}
                                            {mcp.id === 'terminal' && <Terminal size={18} color="var(--accent-color)" />}
                                            {mcp.isCustom && <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--accent-bg)', color: 'var(--accent-color)', borderRadius: '4px', textTransform: 'uppercase' }}>Custom</span>}
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                            {mcp.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {mcp.isCustom && (
                                            <button
                                                onClick={() => handleDelete(mcp.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
                                                title="Delete Server"
                                            >
                                                <Trash2 size={20} className="hover-danger" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggle(mcp.id, mcp.enabled)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: mcp.enabled ? 'var(--success-color)' : 'var(--text-secondary)' }}
                                            title={mcp.enabled ? "Disable" : "Enable"}
                                        >
                                            {mcp.enabled ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                                        </button>
                                    </div>
                                </div>

                                {mcp.command && mcp.command !== 'builtin' && (
                                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                        <div style={{ color: 'var(--accent-color)', marginBottom: '4px' }}>$ {mcp.command} {mcp.args.join(' ')}</div>
                                        {Object.keys(mcp.env).length > 0 && (
                                            <div style={{ opacity: 0.7 }}>
                                                {Object.entries(mcp.env).map(([k, v]) => `${k}=${v}`).join(' ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Server Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '24px',
                        width: '100%', maxWidth: '550px', border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Add MCP Server</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Server ID (UniqueID)</label>
                                <input required placeholder="e.g. gcal-mcp" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Name</label>
                                <input required placeholder="e.g. Google Calendar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Command</label>
                                <input required placeholder="e.g. npx, node, python" value={form.command} onChange={e => setForm({ ...form, command: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Arguments (Comma separated)</label>
                                <input placeholder="e.g. -y, @modelcontextprotocol/server-gcal" value={form.args} onChange={e => setForm({ ...form, args: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Env Vars (KEY=VALUE per line)</label>
                                <textarea rows={3} placeholder="GOOGLE_CLIENT_ID=xxx" value={form.env} onChange={e => setForm({ ...form, env: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
                                <input placeholder="Brief explanation of capabilities" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    transition: 'background-color 0.2s'
                                }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--primary-color)',
                                    color: 'white',
                                    fontWeight: '600',
                                    transition: 'opacity 0.2s'
                                }}>Add Server</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

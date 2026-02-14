import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectDirectory } from '../store/middleware/ipcMiddleware';
import ChatSidebar from '../components/chat/ChatSidebar';
import { Save, Moon, Sun, Monitor } from 'lucide-react';

export default function Settings() {
    const dispatch = useDispatch();
    const [theme, setTheme] = useState('dark');
    const [modelPath, setModelPath] = useState('~/AIModels');
    const [useGpu, setUseGpu] = useState(false);

    // Mock save function
    const handleSave = () => {
        alert('Settings saved (Mock)!');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <ChatSidebar />
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

                <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Appearance Section */}
                    <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Appearance</h2>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setTheme('light')}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: 'var(--radius-sm)',
                                    border: `2px solid ${theme === 'light' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Sun /> Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: 'var(--radius-sm)',
                                    border: `2px solid ${theme === 'dark' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Moon /> Dark
                            </button>
                        </div>
                    </section>

                    {/* Storage Section */}
                    <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Storage & Compute</h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model Storage Path</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={modelPath}
                                    onChange={(e) => setModelPath(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    onClick={async () => {
                                        const path = await dispatch(selectDirectory());
                                        if (path) setModelPath(path);
                                    }}
                                    style={{
                                        padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Browse
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                Absolute path where GGUF models are stored.
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                checked={useGpu}
                                onChange={(e) => setUseGpu(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem' }}
                            />
                            <label>Enable GPU Offloading (Experimental)</label>
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        style={{
                            padding: '0.75rem', backgroundColor: 'var(--primary-color)', color: 'white',
                            borderRadius: 'var(--radius-sm)', fontWeight: 'bold', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <Save size={18} /> Save Settings
                    </button>

                </div>
            </div>
        </div>
    );
}

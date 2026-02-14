import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, loginFailure, setLoading } from '../store/slices/authSlice';
import apiClient from '../api/apiClient';
import '../styles/main.scss';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        dispatch(setLoading(true));

        try {
            // Call backend login endpoint
            const data = await apiClient.post('/auth/login', { username, password });
            const { accessToken } = data;

            // Update store
            dispatch(loginSuccess({ accessToken, user: { username } }));
            dispatch(setLoading(false));

            // Redirect to chat
            navigate('/chat');
        } catch (err) {
            console.error(err);
            const errMsg = 'Invalid credentials';
            setLocalError(errMsg);
            dispatch(loginFailure(errMsg));
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2>AI Coordinator Login</h2>
                {localError && <div style={{ color: 'var(--danger-color)' }}>{localError}</div>}

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        required
                        style={{ width: '100%' }}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        required
                        style={{ width: '100%' }}
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? 'var(--text-secondary)' : 'var(--primary-color)',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold',
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}

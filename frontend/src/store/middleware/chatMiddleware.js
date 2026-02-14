import { addMessage, updateLastMessage, setStreaming, setError } from '../slices/chatSlice';

export const startStream = (content, model) => ({
    type: 'chat/startStream',
    payload: { content, model }
});

export const stopStream = () => ({
    type: 'chat/stopStream'
});

const chatMiddleware = store => next => async action => {
    if (action.type === 'chat/startStream') {
        const { content, model } = action.payload;
        const { token } = store.getState().auth;
        const dispatch = store.dispatch;

        // Optimistic UI updates
        dispatch(addMessage({ role: 'user', content }));
        dispatch(addMessage({ role: 'assistant', content: '' }));
        dispatch(setStreaming(true));

        try {
            const response = await fetch('/api/v1/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: content, model: model })
            });

            if (!response.ok) throw new Error('Network error');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            while (true) {
                // Check if streaming stopped
                const isStreaming = store.getState().chat.isStreaming;
                if (!isStreaming) {
                    reader.cancel();
                    break;
                }

                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim().startsWith('data:')) {
                        const text = line.replace('data:', '').trim();
                        if (text) {
                            assistantMessage += (text + ' ');
                            dispatch(updateLastMessage(assistantMessage));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming middleware error:', error);
            dispatch(setError(error.message));
            dispatch(updateLastMessage('Error: Failed to get response.'));
        } finally {
            dispatch(setStreaming(false));
        }
    }

    return next(action);
};

export default chatMiddleware;

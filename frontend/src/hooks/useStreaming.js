import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { startStream } from '../store/middleware/chatMiddleware';

export const useStreaming = () => {
    const dispatch = useDispatch();

    const sendMessage = useCallback((content, model) => {
        if (!content.trim()) return;
        dispatch(startStream(content, model));
    }, [dispatch]);

    return { sendMessage };
};

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistoryThunk } from '../store/slices/chatSlice';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import '../styles/components/chat.scss';

export default function ChatPage() {
    const dispatch = useDispatch();
    const { activeSessionId } = useSelector((state) => state.chat);

    useEffect(() => {
        if (activeSessionId) {
            dispatch(fetchHistoryThunk(activeSessionId));
        }
    }, [activeSessionId, dispatch]);

    return (
        <div className="chat-layout">
            <ChatSidebar />
            <div className="chat-container">
                <ChatWindow />
                <ChatInput />
            </div>
        </div>
    );
}

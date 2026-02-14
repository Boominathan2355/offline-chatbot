import { useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';

// Memoized Message Component
const Message = memo(({ msg, isStreaming, isLast }) => {
    const isImage = msg.type === 'image' || (typeof msg.content === 'string' && msg.content.startsWith('data:image'));

    return (
        <div className={`message-wrapper ${msg.role}`}>
            <div className={`message ${msg.role}`}>
                <div className={`avatar ${msg.role}`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className="bubble">
                    <div className="content">
                        {isImage ? (
                            <div className="image-content">
                                <img
                                    src={msg.content}
                                    alt="Generated"
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <a
                                    href={msg.content}
                                    download={`generated-${Date.now()}.png`}
                                    style={{
                                        display: 'block',
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Download Image
                                </a>
                            </div>
                        ) : (
                            <>
                                {msg.content}
                                {isStreaming && isLast && msg.role === 'assistant' && (
                                    <span className="cursor-blink">|</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default function ChatWindow() {
    const { messages, isStreaming } = useSelector((state) => state.chat);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-window">
            {messages.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                    <h2>How can I help you regarding AI models or tasks?</h2>
                </div>
            )}

            {messages.map((msg, idx) => (
                <Message
                    key={idx}
                    msg={msg}
                    isStreaming={isStreaming}
                    isLast={idx === messages.length - 1}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

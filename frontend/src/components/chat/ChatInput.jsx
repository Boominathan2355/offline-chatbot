import { useState, useEffect, useRef } from 'react';
import { Send, ChevronDown, ImagePlus, X, Brain } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useStreaming } from '../../hooks/useStreaming';
import { setModel, addMessage } from '../../store/slices/chatSlice';
import { fetchCatalog } from '../../store/slices/modelSlice';
import { imageApi } from '../../api/imageApi';

export default function ChatInput() {
    const [input, setInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [thinkingEnabled, setThinkingEnabled] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const fileInputRef = useRef(null);
    const { isStreaming, selectedModel } = useSelector((state) => state.chat);
    const { catalog } = useSelector((state) => state.models);
    const { sendMessage } = useStreaming();
    const dispatch = useDispatch();

    // Check if the currently selected model supports vision / thinking / image gen
    const selectedModelData = catalog.find(
        (m) => m.id === selectedModel || m.name === selectedModel || m.filename === selectedModel
    );
    const supportsVision = selectedModelData?.supportsVision || false;
    const supportsThinking = selectedModelData?.supportsThinking || false;
    const isImageModel = selectedModelData?.type === 'image';

    useEffect(() => {
        dispatch(fetchCatalog());
    }, [dispatch]);

    // Only show downloaded/installed models
    const downloadedModels = catalog.filter((m) => m.installed);



    // Reset thinking toggle when switching to a model that doesn't support it
    useEffect(() => {
        if (!supportsThinking) {
            setThinkingEnabled(false);
        }
    }, [supportsThinking]);

    // Auto-select first installed model if none is selected or current one isn't installed
    useEffect(() => {
        if (downloadedModels.length > 0) {
            const isCurrentValid = downloadedModels.some(
                (m) => m.id === selectedModel || m.name === selectedModel
            );
            if (!isCurrentValid) {
                dispatch(setModel(downloadedModels[0].id));
            }
        }
    }, [downloadedModels.length, selectedModel, dispatch]);

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const message = input;
        setInput('');
        setImagePreview(null);
        setImageFile(null);

        if (isImageModel) {
            // Handle Image Generation
            dispatch(addMessage({
                role: 'user',
                content: `Generate image: ${message}`
            }));

            // Add a temporary "generating" placeholder? 
            // For now, we'll just await the API. 
            // Better UX would be a loading state in the chat, but let's stick to simple dispatch.

            try {
                // Dispatch a "Thinking..." or similar message could be handled by UI state, 
                // but here we just wait.

                const res = await imageApi.generateImage({
                    model_id: selectedModel,
                    prompt: message,
                    negative_prompt: "blur, low quality, distortion, ugly", // Default
                    steps: selectedModelData?.default_steps || 20,
                    width: selectedModelData?.default_width || 512,
                    height: selectedModelData?.default_height || 512
                });

                if (res.status === 'success') {
                    dispatch(addMessage({
                        role: 'assistant',
                        content: res.image,
                        type: 'image', // Ensure ChatMessage component handles this
                        model: res.meta?.model || selectedModel
                    }));
                } else {
                    dispatch(addMessage({
                        role: 'system',
                        content: `Error generating image: ${res.message || 'Unknown error'}`
                    }));
                }
            } catch (err) {
                dispatch(addMessage({
                    role: 'system',
                    content: `Generation failed: ${err.message}`
                }));
            }
        } else {
            // Handle LLM Chat
            await sendMessage(message, selectedModel);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="chat-input-area">
            <div className="input-wrapper">
                <div className="input-top-row">
                    <div className="model-selector">
                        <ChevronDown size={14} />
                        <select
                            value={selectedModel}
                            onChange={(e) => dispatch(setModel(e.target.value))}
                            disabled={isStreaming}
                        >
                            {downloadedModels.length === 0 ? (
                                <option value="">No models installed</option>
                            ) : (
                                downloadedModels.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name} ({model.params})
                                        {model.supportsVision ? ' 📷' : ''}
                                        {model.supportsThinking ? ' 🧠' : ''}
                                        {model.type === 'image' ? ' 🎨' : ''}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Thinking toggle — only if model supports it */}
                    {supportsThinking && (
                        <button
                            className={`thinking-toggle ${thinkingEnabled ? 'active' : ''}`}
                            onClick={() => setThinkingEnabled(!thinkingEnabled)}
                            disabled={isStreaming}
                            title={thinkingEnabled ? 'Disable thinking mode' : 'Enable thinking mode'}
                        >
                            <Brain size={16} />
                            <span>{thinkingEnabled ? 'Thinking On' : 'Thinking Off'}</span>
                        </button>
                    )}
                </div>

                {/* Image preview */}
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Attached" />
                        <button className="remove-image" onClick={handleRemoveImage}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="textarea-row">
                    {/* Image Generation Button */}


                    {/* Image attachment button — only if model supports vision */}
                    {supportsVision && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="attach-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isStreaming}
                                title="Attach an image for vision"
                            >
                                <ImagePlus size={20} />
                            </button>
                        </>
                    )}

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            downloadedModels.length === 0
                                ? 'Download a model from the Models page to start chatting...'
                                : isImageModel
                                    ? 'Describe the image you want to generate...'
                                    : thinkingEnabled
                                        ? 'Ask a reasoning question... (thinking mode enabled)'
                                        : 'Message AI Coordinator...'
                        }
                        disabled={isStreaming || downloadedModels.length === 0}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming || downloadedModels.length === 0}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                AI can make mistakes. Please verify important information.
            </div>

        </div>
    );
}


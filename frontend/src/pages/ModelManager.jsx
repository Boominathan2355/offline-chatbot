import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCatalog, fetchRecommendations, downloadModelThunk, fetchDownloadStatus, deleteModelThunk, cancelDownloadThunk } from '../store/slices/modelSlice';
import { systemApi } from '../api/systemApi';
import { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import { CheckCircle, Download, HardDrive, Cpu, MemoryStick, Loader, Trash2, Eye, Brain, Code, MessageSquareText, Search, X, SlidersHorizontal } from 'lucide-react';
import '../styles/components/models.scss';

export default function ModelManager() {
    const dispatch = useDispatch();
    const { catalog, downloadStatus, recommendedModels, deletingModelId } = useSelector((state) => state.models);
    const [profile, setProfile] = useState(null);
    const pollingRef = useRef({});

    // ── Filter / Search state ──────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState('all');       // all | tiny | small | medium | large
    const [statusFilter, setStatusFilter] = useState('all');   // all | installed | not_installed
    const [capFilter, setCapFilter] = useState('all');         // all | vision | thinking | code
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        dispatch(fetchCatalog());
        dispatch(fetchRecommendations());
        systemApi.getProfile().then(setProfile).catch(console.error);
    }, [dispatch]);

    // Poll download progress for active downloads
    useEffect(() => {
        const activeDownloads = Object.entries(downloadStatus)
            .filter(([, s]) => s.status === 'downloading');

        activeDownloads.forEach(([modelId]) => {
            if (!pollingRef.current[modelId]) {
                pollingRef.current[modelId] = setInterval(() => {
                    dispatch(fetchDownloadStatus(modelId));
                }, 800);
            }
        });

        // Clear timers for completed/failed downloads
        Object.keys(pollingRef.current).forEach((modelId) => {
            const st = downloadStatus[modelId];
            if (st && (st.status === 'completed' || st.status === 'failed')) {
                clearInterval(pollingRef.current[modelId]);
                delete pollingRef.current[modelId];
                if (st.status === 'completed') {
                    dispatch(fetchCatalog());
                }
            }
        });

        return () => {
            Object.values(pollingRef.current).forEach(clearInterval);
        };
    }, [downloadStatus, dispatch]);

    // ── Derived: filter + search the catalog ───────────────────────
    const filteredCatalog = catalog.filter((model) => {
        // Search: name, description, params
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match =
                (model.name && model.name.toLowerCase().includes(q)) ||
                (model.description && model.description.toLowerCase().includes(q)) ||
                (model.params && model.params.toLowerCase().includes(q)) ||
                (model.id && model.id.toLowerCase().includes(q));
            if (!match) return false;
        }

        // Tier
        if (tierFilter !== 'all' && model.tier !== tierFilter) return false;

        // Status
        if (statusFilter === 'installed' && !model.installed) return false;
        if (statusFilter === 'not_installed' && model.installed) return false;

        // Capability
        if (capFilter === 'vision' && !model.supportsVision) return false;
        if (capFilter === 'thinking' && !model.supportsThinking) return false;
        if (capFilter === 'code' && !model.supportsCode) return false;

        return true;
    });

    const activeFilterCount = [tierFilter, statusFilter, capFilter].filter(f => f !== 'all').length;

    const clearAllFilters = () => {
        setSearchQuery('');
        setTierFilter('all');
        setStatusFilter('all');
        setCapFilter('all');
    };

    const handleDownload = (modelId) => {
        dispatch(downloadModelThunk(modelId));
    };

    const handleDelete = (modelId) => {
        if (window.confirm('Are you sure you want to delete this model? You can re-download it later.')) {
            dispatch(deleteModelThunk(modelId));
        }
    };

    const handleCancel = (modelId) => {
        if (window.confirm('Stop this download?')) {
            dispatch(cancelDownloadThunk(modelId));
        }
    };

    const isRecommended = (modelId) => {
        return recommendedModels.includes(modelId);
    };

    const isImageModel = (model) => {
        return model.type === 'image';
    };

    const getStatusInfo = (modelId, isInstalled) => {
        const ds = downloadStatus[modelId];
        if (isInstalled && (!ds || ds.status !== 'downloading')) {
            return { label: 'Installed', color: 'var(--success-color)', icon: 'check' };
        }
        if (ds?.status === 'downloading' || ds?.status === 'started') {
            return {
                label: `${ds.progress || 0}%`,
                color: 'var(--primary-color)',
                icon: 'loading',
                progress: ds.progress || 0,
                downloaded: ds.downloaded || 0,
                total: ds.total || 0,
                status: ds.status
            };
        }
        if (ds?.status === 'failed') {
            return { label: 'Failed', color: 'var(--danger-color)', icon: 'error' };
        }
        return { label: 'Not Installed', color: 'var(--text-secondary)', icon: 'none' };
    };

    // Grouping Logic:

    // 0. Installed Models (First priority)
    const installedGroup = filteredCatalog.filter(m => m.installed);
    const notInstalled = filteredCatalog.filter(m => !m.installed);

    // 1. Recommended (Text Only, Not Installed)
    const recommendedGroup = notInstalled.filter(m => isRecommended(m.id) && !isImageModel(m));
    // 2. Image Models (Not installed)
    const imageGroup = notInstalled.filter(m => isImageModel(m));
    // 3. Available (Text Only, excluding recommended & installed)
    const availableGroup = notInstalled.filter(m => !isImageModel(m) && !isRecommended(m.id));

    const renderModelCard = (model) => {
        const status = getStatusInfo(model.id, model.installed);
        const recommended = isRecommended(model.id);
        const downloading = downloadStatus[model.id]?.status === 'downloading';
        const progress = downloadStatus[model.id]?.progress || 0;
        const _isImage = isImageModel(model);
        const imageGenBlocked = _isImage && !downloadStatus['sd_available']; // We'll add this to state

        return (
            <div key={model.id} className={`model-card ${model.installed ? 'installed' : ''}`}>
                <div className="header">
                    <h3>{model.name}</h3>
                    <div className="badges">
                        {recommended && <span className="badge recommended">Recommended</span>}
                        {model.installed && <span className="badge installed">Installed</span>}
                        {_isImage && <span className="badge image">🎨 Image</span>}
                        {model.supportsVision && <span className="badge vision"><Eye size={12} /> Vision</span>}
                        {model.supportsThinking && <span className="badge thinking"><Brain size={12} /> Thinking</span>}
                    </div>
                </div>

                <p className="description">{model.description}</p>

                <div className="capabilities">
                    <span className="cap-label">Capabilities:</span>
                    {_isImage && (
                        <span className="cap-tag image">🎨 Image Gen</span>
                    )}
                    {model.supportsVision && (
                        <span className="cap-tag vision"><Eye size={12} /> Vision</span>
                    )}
                    {model.supportsThinking && (
                        <span className="cap-tag thinking"><Brain size={12} /> Thinking</span>
                    )}
                    {model.supportsCode && (
                        <span className="cap-tag code"><Code size={12} /> Code</span>
                    )}
                    {!_isImage && !model.supportsVision && !model.supportsThinking && !model.supportsCode && <span className="cap-tag text"><MessageSquareText size={12} /> Text</span>}
                </div>

                <div className="specs">
                    {_isImage ? (
                        <div className="spec">
                            <span className="spec-label">Resolution</span>
                            <span className="spec-value">{model.default_width}x{model.default_height}</span>
                        </div>
                    ) : (
                        <div className="spec">
                            <span className="spec-label">Parameters</span>
                            <span className="spec-value">{model.params || '-'}</span>
                        </div>
                    )}
                    <div className="spec">
                        <span className="spec-label">Size</span>
                        <span className="spec-value">{model.size}</span>
                    </div>
                    <div className="spec">
                        <span className="spec-label">RAM Required</span>
                        <span className="spec-value">{model.ram || `~${model.size}` || '-'}</span>
                    </div>
                </div>

                {/* Download Progress Bar */}
                {downloading && (
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${(downloadStatus[model.id]?.downloaded / downloadStatus[model.id]?.total * 100) || 0}%` }} />
                        <span className="progress-label">{progress}%</span>
                    </div>
                )}

                <div className="actions">
                    {model.installed ? (
                        <div className="installed-actions">
                            <button className="btn-installed" disabled>
                                <CheckCircle size={16} /> Installed
                            </button>
                            <button
                                className="btn-delete"
                                onClick={() => handleDelete(model.id)}
                                disabled={deletingModelId === model.id}
                                title="Delete model"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : status.icon === 'loading' ? (
                        <div className="downloading-actions">
                            <button className="btn-downloading" disabled>
                                <Loader size={16} className="spin" />
                                {status.progress > 0
                                    ? `Downloading ${status.progress}% (${(status.downloaded / 1024 / 1024).toFixed(0)}/${(status.total / 1024 / 1024).toFixed(0)} MB)`
                                    : status.downloaded > 0
                                        ? `Downloading ${(status.downloaded / 1024 / 1024).toFixed(0)} MB...`
                                        : 'Starting...'}
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={() => handleCancel(model.id)}
                                title="Cancel download"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : imageGenBlocked ? (
                        <div className="unavailable-notice" style={{ color: 'var(--danger-color)', fontSize: '0.8rem', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                            <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Image generation dependency missing on this system.
                        </div>
                    ) : (
                        <button className="btn-download" onClick={() => handleDownload(model.id)}>
                            <Download size={16} /> Download
                        </button>
                    )
                }
                </div>
            </div>
        );
    };



    return (
        <div style={{ display: 'flex' }}>
            <ChatSidebar />

            <div style={{ flex: 1, overflow: 'auto', height: '100vh' }}>
                <div className="model-manager">
                    <h1>Model Hub</h1>
                    <p className="subtitle">Browse and download AI models for local inference</p>

                    {/* System Stats */}
                    <section className="stats-section">
                        <div className="system-stats">
                            <div className="stat-card">
                                <Cpu size={20} />
                                <div className="label">CPU Threads</div>
                                <div className="value">{profile?.cpuThreads || '-'}</div>
                            </div>
                            <div className="stat-card">
                                <MemoryStick size={20} />
                                <div className="label">RAM</div>
                                <div className="value">{profile?.ram || '-'}</div>
                            </div>
                            <div className="stat-card">
                                <HardDrive size={20} />
                                <div className="label">Disk Free</div>
                                <div className="value">{profile?.diskFree || '-'}</div>
                            </div>
                        </div>
                    </section>

                    {/* Search & Filter Bar */}
                    <section className="filter-section">
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search models by name, description, or size..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => setSearchQuery('')}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="filter-row">
                            <button
                                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                            </button>

                            {activeFilterCount > 0 && (
                                <button className="clear-filters" onClick={clearAllFilters}>
                                    <X size={14} /> Clear all
                                </button>
                            )}

                            <span className="result-count">
                                {filteredCatalog.length} of {catalog.length} models
                            </span>
                        </div>

                        {showFilters && (
                            <div className="filter-groups">
                                {/* Tier filter */}
                                <div className="filter-group">
                                    <span className="filter-label">Size</span>
                                    <div className="filter-chips">
                                        {['all', 'tiny', 'small', 'medium', 'large'].map((t) => (
                                            <button
                                                key={t}
                                                className={`chip ${tierFilter === t ? 'active' : ''}`}
                                                onClick={() => setTierFilter(t)}
                                            >
                                                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status filter */}
                                <div className="filter-group">
                                    <span className="filter-label">Status</span>
                                    <div className="filter-chips">
                                        {[
                                            { value: 'all', label: 'All' },
                                            { value: 'installed', label: 'Installed' },
                                            { value: 'not_installed', label: 'Not Installed' },
                                        ].map((s) => (
                                            <button
                                                key={s.value}
                                                className={`chip ${statusFilter === s.value ? 'active' : ''}`}
                                                onClick={() => setStatusFilter(s.value)}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Capability filter */}
                                <div className="filter-group">
                                    <span className="filter-label">Capability</span>
                                    <div className="filter-chips">
                                        {[
                                            { value: 'all', label: 'All', icon: null },
                                            { value: 'vision', label: 'Vision', icon: <Eye size={13} /> },
                                            { value: 'thinking', label: 'Thinking', icon: <Brain size={13} /> },
                                            { value: 'code', label: 'Code', icon: <Code size={13} /> },
                                        ].map((c) => (
                                            <button
                                                key={c.value}
                                                className={`chip ${capFilter === c.value ? 'active' : ''}`}
                                                onClick={() => setCapFilter(c.value)}
                                            >
                                                {c.icon} {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Model Catalog */}
                    <section>
                        <div className="model-sections">
                            {installedGroup.length > 0 && (
                                <section className="model-group">
                                    <h2 className="group-title">✅ Installed Models</h2>
                                    <div className="model-grid">
                                        {installedGroup.map(renderModelCard)}
                                    </div>
                                </section>
                            )}

                            {recommendedGroup.length > 0 && (
                                <section className="model-group">
                                    <h2 className="group-title">✨ Recommended for System</h2>
                                    <div className="model-grid">
                                        {recommendedGroup.map(renderModelCard)}
                                    </div>
                                </section>
                            )}

                            {imageGroup.length > 0 && (
                                <section className="model-group">
                                    <h2 className="group-title">🎨 Image Generation Models</h2>
                                    <div className="model-grid">
                                        {imageGroup.map(renderModelCard)}
                                    </div>
                                </section>
                            )}

                            {availableGroup.length > 0 && (
                                <section className="model-group">
                                    {/* Only show title if there are other groups, otherwise it's just "All Models" */}
                                    {(recommendedGroup.length > 0 || imageGroup.length > 0) && (
                                        <h2 className="group-title">📚 Available Models</h2>
                                    )}
                                    <div className="model-grid">
                                        {availableGroup.map(renderModelCard)}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Empty states */}
                        {catalog.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Loading model catalog... Make sure the AI runtime is running on port 8000.
                            </p>
                        )}
                        {catalog.length > 0 && filteredCatalog.length === 0 && (
                            <div className="empty-results">
                                <Search size={40} />
                                <h3>No models found</h3>
                                <p>Try adjusting your search or filters</p>
                                <button className="btn-download" onClick={clearAllFilters}>
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}


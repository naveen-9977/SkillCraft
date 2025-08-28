'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiPlus, FiVideo, FiEdit, FiTrash2, FiSearch, FiCalendar, FiClock, FiX, FiSave } from 'react-icons/fi';
import '../styles/AdminLiveClasses.css';

const AdminLiveClasses = () => {
    const [classes, setClasses] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [allMentors, setAllMentors] = useState([]);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        topic: '', description: '', mentor: '', batch: [],
        startTime: '', classType: 'external', link: ''
    });
    const [editingClassId, setEditingClassId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [classesRes, batchesRes, usersRes, userRes] = await Promise.all([
                axios.get('/api/admin/live-classes'),
                axios.get('/api/admin/batches'),
                axios.get('/api/admin/users'),
                axios.get('/api/auth/user')
            ]);

            const currentUser = userRes?.data?.user;
            setUser(currentUser);

            setClasses(classesRes?.data?.data || []);
            setAllBatches(batchesRes?.data?.batches || []);

            const allUsers = usersRes?.data?.users || [];
            const approvedMentors = allUsers.filter(user => user.role === 'mentor' && user.status === 'approved');
            setAllMentors(approvedMentors);

            if (currentUser?.role === 'mentor') {
                setFormData(prevState => ({ ...prevState, mentor: currentUser._id }));
            }

        } catch (err) {
            setError('Failed to fetch data. Please refresh the page.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleBatchSelection = (batchId) => {
        setFormData(prevState => {
            const newBatch = prevState.batch.includes(batchId)
                ? prevState.batch.filter(id => id !== batchId)
                : [...prevState.batch, batchId];
            return { ...prevState, batch: newBatch };
        });
    };

    const resetForm = () => {
        setFormData({ 
            topic: '', 
            description: '', 
            mentor: user?.role === 'mentor' ? user._id : '', 
            batch: [],
            startTime: '', 
            classType: 'external', 
            link: '' 
        });
        setEditingClassId(null);
        setShowModal(false);
        setError('');
    };

    const handleEdit = (cls) => {
        setEditingClassId(cls._id);
        setFormData({
            topic: cls.topic,
            description: cls.description,
            mentor: cls.mentor._id,
            batch: Array.isArray(cls.batch) ? cls.batch.map(b => b._id) : [cls.batch._id],
            startTime: new Date(new Date(cls.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
            classType: cls.classType,
            link: cls.link || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await axios.delete(`/api/admin/live-classes?id=${id}`);
            setClasses(classes.filter(c => c._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete class.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = '/api/admin/live-classes';

        try {
            const response = editingClassId 
                ? await axios.put(url, { ...formData, _id: editingClassId })
                : await axios.post(url, formData);

            await fetchInitialData();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save class.');
        }
    };

    const getClassStatus = (startTime) => {
        const now = time.getTime();
        const start = new Date(startTime).getTime();
        const end = start + 60 * 60 * 1000;

        if (now < start) return { status: 'upcoming', text: 'Upcoming' };
        if (now >= start && now <= end) return { status: 'live', text: 'Live Now' };
        return { status: 'ended', text: 'Ended' };
    };

    const filteredClasses = classes.filter(cls => {
        const { status } = getClassStatus(cls.startTime);
        const matchesSearch = cls.topic.toLowerCase().includes(searchQuery.toLowerCase());
        return (activeTab === 'all' || status === activeTab) && matchesSearch;
    });

    const availableBatchesForForm = () => {
        if (user?.role === 'admin') {
            const selectedMentor = allMentors.find(m => m._id === formData.mentor);
            if (selectedMentor) {
                return allBatches.filter(b => selectedMentor.batchCodes.includes(b.batchCode));
            }
            return [];
        }
        if (user?.role === 'mentor') {
            return allBatches.filter(b => user.batchCodes.includes(b.batchCode));
        }
        return [];
    };

    if (isLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="live-class-dashboard">
            <header className="page-header">
                 <div>
                    <h1 className="page-title">Live Classes</h1>
                    <p className="page-subtitle">Create, manage, and monitor live sessions.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="create-btn">
                    <FiPlus /> New Class
                </button>
            </header>

            <div className="controls-container">
                <div className="filter-tabs">
                    <button onClick={() => setActiveTab('all')} className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}>All</button>
                    <button onClick={() => setActiveTab('upcoming')} className={`filter-tab ${activeTab === 'upcoming' ? 'active' : ''}`}>Upcoming</button>
                    <button onClick={() => setActiveTab('live')} className={`filter-tab ${activeTab === 'live' ? 'active' : ''}`}>Live</button>
                    <button onClick={() => setActiveTab('ended')} className={`filter-tab ${activeTab === 'ended' ? 'active' : ''}`}>Ended</button>
                </div>
                <div className="search-container">
                    <div className="search-input">
                        <FiSearch className="search-icon" />
                        <input type="text" placeholder="Search by topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
            </div>

            <main className="classes-grid">
                {error && <div className="error-message">{error}</div>}
                {filteredClasses.length > 0 ? (
                    filteredClasses.map(cls => {
                        const { status, text } = getClassStatus(cls.startTime);
                        const startDate = new Date(cls.startTime);
                        return (
                            <div key={cls._id} className={`class-card ${status}`}>
                                <div className="card-header">
                                    <h3 className="class-topic">{cls.topic}</h3>
                                    <div className={`status-indicator ${status}`}>{text}</div>
                                </div>
                                <p className="class-description">{cls.description}</p>
                                <div className="class-meta">
                                    <div className="meta-item"><span>Mentor:</span> {cls.mentor?.name || 'N/A'}</div>
                                    <div className="meta-item"><span>Batches:</span> {Array.isArray(cls.batch) ? cls.batch.map(b => b.batchName).join(', ') : (cls.batch?.batchName || 'N/A')}</div>
                                    <div className="meta-item"><FiCalendar /> {startDate.toLocaleDateString()}</div>
                                    <div className="meta-item"><FiClock /> {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                                <div className="card-footer">
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(cls)} className="action-btn edit-btn"><FiEdit /></button>
                                        <button onClick={() => handleDelete(cls._id)} className="action-btn delete-btn"><FiTrash2 /></button>
                                    </div>
                                    {status === 'live' && (
                                        cls.classType === 'webrtc' ? (
                                            <Link href={`/admin/live-classes/${cls._id}`} target="_blank" className="join-btn">Join Class</Link>
                                        ) : (
                                            <a href={cls.link} target="_blank" rel="noopener noreferrer" className="join-btn">Join Class</a>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon"><FiVideo /></div>
                        <h3>No Classes Found</h3>
                        <p>No classes match your current filters.</p>
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingClassId ? 'Edit Class' : 'Create New Class'}</h2>
                            <button onClick={resetForm} className="close-btn"><FiX/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            {error && <div className="modal-error">{error}</div>}

                            <div className="form-grid">
                                <div className="form-group span-2">
                                    <label htmlFor="topic">Topic</label>
                                    <input id="topic" type="text" name="topic" value={formData.topic} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group span-2">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mentor">Mentor</label>
                                    <select id="mentor" name="mentor" value={formData.mentor} onChange={handleInputChange} required disabled={user?.role === 'mentor'}>
                                        <option value="">Select Mentor</option>
                                        {allMentors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Batches</label>
                                    <div className="multi-select-container">
                                        {availableBatchesForForm().map(b => (
                                            <div key={b._id} className="multi-select-option">
                                                <input 
                                                    type="checkbox"
                                                    id={`batch-${b._id}`}
                                                    value={b._id}
                                                    checked={formData.batch.includes(b._id)}
                                                    onChange={() => handleBatchSelection(b._id)}
                                                />
                                                <label htmlFor={`batch-${b._id}`}>{b.batchName}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="startTime">Start Time</label>
                                    <input id="startTime" type="datetime-local" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Class Type</label>
                                    <div className="status-options">
                                        <div onClick={() => setFormData({...formData, classType: 'external'})} className={`status-option ${formData.classType === 'external' ? 'active' : ''}`}>External Link</div>
                                        <div onClick={() => setFormData({...formData, classType: 'webrtc'})} className={`status-option ${formData.classType === 'webrtc' ? 'active' : ''}`}>100ms (self-hosted)</div>
                                    </div>
                                </div>
                                {formData.classType === 'external' && (
                                    <div className="form-group span-2">
                                        <label htmlFor="link">Meeting Link</label>
                                        <input id="link" type="url" name="link" value={formData.link} onChange={handleInputChange} placeholder="https://..." />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={resetForm} className="cancel-btn"><FiX /> Cancel</button>
                                <button type="submit" className="save-btn"><FiSave /> {editingClassId ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLiveClasses;
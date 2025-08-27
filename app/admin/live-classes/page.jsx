'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiPlus, FiVideo, FiEdit, FiTrash2, FiSearch, FiCalendar, FiClock, FiX, FiSave } from 'react-icons/fi';
import '../styles/AdminLiveClasses.css';

const AdminLiveClasses = () => {
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        topic: '', description: '', mentor: '', batch: '',
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
            setBatches(batchesRes?.data?.batches || []);
            
            const allUsers = usersRes?.data?.users || [];
            
            if (currentUser?.role === 'mentor') {
                const loggedInMentor = allUsers.find(u => u._id === currentUser._id);
                setMentors(loggedInMentor ? [loggedInMentor] : []);
                setFormData(prevState => ({ ...prevState, mentor: loggedInMentor?._id || '' }));
            } else if (currentUser?.role === 'admin') {
                setMentors(allUsers.filter(user => user.role === 'mentor' && user.status === 'approved'));
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

    const resetForm = () => {
        const initialMentorId = user?.role === 'mentor' && mentors.length > 0 ? mentors[0]._id : '';
        setFormData({ topic: '', description: '', mentor: initialMentorId, batch: '', startTime: '', classType: 'external', link: '' });
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
            batch: cls.batch._id,
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

            if (editingClassId) {
                setClasses(classes.map(c => c._id === editingClassId ? response.data.data : c));
            } else {
                setClasses([response.data.data, ...classes]);
            }
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
                                    <div className="meta-item"><span>Batch:</span> {cls.batch?.batchName || 'N/A'}</div>
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
                                            <a href={cls.link} target="_blank" rel="noopener noreferrer" className="join-btn">Join Link</a>
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
                            <div className="form-group">
                                <label>Topic</label>
                                <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Mentor</label>
                                    <select name="mentor" value={formData.mentor} onChange={handleInputChange} required disabled={user?.role === 'mentor'}>
                                        <option value="">Select Mentor</option>
                                        {mentors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Batch</label>
                                    <select name="batch" value={formData.batch} onChange={handleInputChange} required>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Start Time</label>
                                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Class Type</label>
                                <div className="status-options">
                                    <div onClick={() => setFormData({...formData, classType: 'external'})} className={`status-option ${formData.classType === 'external' ? 'active' : ''}`}>External Link</div>
                                    <div onClick={() => setFormData({...formData, classType: 'webrtc'})} className={`status-option ${formData.classType === 'webrtc' ? 'active' : ''}`}>Self-Hosted</div>
                                </div>
                            </div>
                            {formData.classType === 'external' && (
                                <div className="form-group">
                                    <label>Meeting Link</label>
                                    <input type="url" name="link" value={formData.link} onChange={handleInputChange} placeholder="https://..." />
                                </div>
                            )}
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
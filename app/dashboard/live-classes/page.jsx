'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import '../styles/live-classes-student.css'; 

const LiveClassesPage = () => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('all');

    // SVG component for the Live Icon
    const LiveIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="live-icon">
            <circle cx="12" cy="12" r="4" />
            <path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M12,20c-4.411,0-8-3.589-8-8s3.589-8,8-8 s8,3.589,8,8S16.411,20,12,20z" />
        </svg>
    );

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchLiveClasses = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('/api/live-classes');
                if (response.data.success) {
                    setLiveClasses(response.data.data);
                } else {
                    setError('Failed to load live classes.');
                }
            } catch (err) {
                setError('An error occurred while fetching live classes.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLiveClasses();
    }, []);

    const getClassStatus = (startTime) => {
        const now = time.getTime();
        const start = new Date(startTime).getTime();
        const end = start + 60 * 60 * 1000; // Assuming 1 hour duration

        if (now < start) {
            const diff = start - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            return {
                status: 'upcoming',
                simpleText: 'Upcoming',
                detailedText: `Starts in ${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`
            };
        } else if (now >= start && now <= end) {
            return { status: 'live', simpleText: 'Live', detailedText: 'Live Now' };
        } else {
            return { status: 'ended', simpleText: 'Ended', detailedText: 'Ended' };
        }
    };

    const filteredClasses = liveClasses.filter(cls => {
        const { status } = getClassStatus(cls.startTime);
        return activeTab === 'all' || status === activeTab;
    });

    const liveCount = liveClasses.filter(c => getClassStatus(c.startTime).status === 'live').length;
    const upcomingCount = liveClasses.filter(c => getClassStatus(c.startTime).status === 'upcoming').length;

    if (isLoading) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p>Loading classes...</p>
        </div>
    );

    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="title-section">
                        <h1>Your Live Classes</h1>
                        <p>Join sessions and engage with your mentors</p>
                    </div>
                </div>

                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-value">{liveClasses.length}</div>
                        <div className="stat-label">Total Classes</div>
                    </div>
                    <div className="stat-card accent">
                        <div className="stat-value">{liveCount}</div>
                        <div className="stat-label">Live Now</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{upcomingCount}</div>
                        <div className="stat-label">Upcoming</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="tabs-container">
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Classes
                        </button>
                        <button 
                            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button 
                            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
                            onClick={() => setActiveTab('live')}
                        >
                            Live
                        </button>
                    </div>
                </div>

                <div className="classes-grid">
                    {filteredClasses.length > 0 ? (
                        <div className="class-cards">
                            {filteredClasses.map(cls => {
                                const { status, simpleText, detailedText } = getClassStatus(cls.startTime);
                                const isJoinable = status === 'live';
                                const startDate = new Date(cls.startTime);
                                const formattedDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const formattedTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <div key={cls._id} className={`class-card ${status}`}>
                                        <div className="card-header">
                                            <div className={`status-indicator ${status}`}>
                                                {status === 'live' && <LiveIcon />}
                                                <span>{simpleText}</span>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <h3 className="class-topic">{cls.topic}</h3>
                                            <p className="class-description">{cls.description}</p>

                                            <div className="class-meta">
                                                <div className="meta-item">
                                                    <span className="meta-label">Mentor</span>
                                                    <span className="meta-value">{cls.mentor?.name || 'N/A'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Batch</span>
                                                    <span className="meta-value">{cls.batch?.batchName || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="time-info">
                                                <div className="date-badge">
                                                    <span className="date">{formattedDate}</span>
                                                    <span className="time">{formattedTime}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-footer">
                                            {isJoinable ? (
                                                cls.classType === 'webrtc' ? (
                                                    <Link href={`/dashboard/live-classes/${cls._id}`} className="join-btn">
                                                        Join Class
                                                    </Link>
                                                ) : (
                                                    <a href={cls.link} target="_blank" rel="noopener noreferrer" className="join-btn">
                                                        Join Class
                                                    </a>
                                                )
                                            ) : (
                                                <button className="join-btn btn-disabled" disabled>
                                                    {status === 'upcoming' ? detailedText : 'Class Ended'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📚</div>
                            <h4>No Classes Found</h4>
                            <p>There are no {activeTab} classes available for you right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveClassesPage;
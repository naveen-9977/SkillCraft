'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminMentors.css'; // New CSS file for this page

const AdminMentorsPage = () => {
    const [mentors, setMentors] = useState([]);
    const [newMentor, setNewMentor] = useState({ name: '', email: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get('/api/admin/mentors');
            if (data.success) {
                setMentors(data.data);
            }
        } catch (err) {
            setError('Failed to fetch mentors. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMentor(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCreateMentor = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newMentor.name || !newMentor.email) {
            setError('Both name and email are required.');
            return;
        }

        try {
            const { data } = await axios.post('/api/admin/mentors', newMentor);
            if (data.success) {
                setMentors([data.data, ...mentors]); // Add new mentor to the top of the list
                setNewMentor({ name: '', email: '' });
                setSuccess('Mentor created successfully!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create mentor.');
            console.error(err);
        }
    };

    return (
        <div className="admin-mentors-container">
            <h1>Manage Mentors</h1>

            <div className="create-mentor-form">
                <h2>Add New Mentor</h2>
                <form onSubmit={handleCreateMentor}>
                    <input 
                        type="text" 
                        name="name" 
                        value={newMentor.name} 
                        onChange={handleInputChange} 
                        placeholder="Mentor Name" 
                        required 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        value={newMentor.email} 
                        onChange={handleInputChange} 
                        placeholder="Mentor Email" 
                        required 
                    />
                    <button type="submit">Add Mentor</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </div>

            <div className="mentors-list">
                <h2>Existing Mentors</h2>
                {isLoading ? (
                     <div className="loading-container"><div className="loader"></div></div>
                ) : mentors.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Date Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mentors.map(mentor => (
                                <tr key={mentor._id}>
                                    <td>{mentor.name}</td>
                                    <td>{mentor.email}</td>
                                    <td>{new Date(mentor.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No mentors found. Add one using the form above.</p>
                )}
            </div>
        </div>
    );
};

export default AdminMentorsPage;

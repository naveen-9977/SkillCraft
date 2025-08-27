"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StudentListPage() {
    const router = useRouter();
    const params = useParams();
    const batchCode = params.batchCode;

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (batchCode) {
            const fetchStudents = async () => {
                setLoading(true);
                setError('');
                try {
                    const res = await fetch(`/api/mentor/students/${batchCode}`);
                    const data = await res.json();
                    if (res.ok) {
                        setStudents(data.students);
                    } else {
                        throw new Error(data.error || 'Failed to fetch students.');
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchStudents();
        }
    }, [batchCode]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <Link href="/mentor" className="retry-button">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="student-list-container">
            <header className="student-list-header">
                <div>
                    <Link href="/mentor" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <h1 className="student-list-title">Student List for {batchCode}</h1>
                </div>
            </header>
            <div className="student-list-table-wrapper">
                {students.length === 0 ? (
                    <p className="no-students-message">No students found in this batch.</p>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Joined On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
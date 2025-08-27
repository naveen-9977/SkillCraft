"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../styles/AdminTests.css'; // New CSS file for styling

// Icons for the UI
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;


export default function Tests() {
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    batchCode: '',
    questions: [{
      questionText: '',
      options: [
        { optionText: '' },
        { optionText: '' },
        { optionText: '' },
        { optionText: '' }
      ],
      correctOption: 0
    }]
  });

  useEffect(() => {
    fetchTestsAndBatches();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deadline: '',
      batchCode: '',
      questions: [{
        questionText: '',
        options: [
          { optionText: '' }, { optionText: '' }, { optionText: '' }, { optionText: '' }
        ],
        correctOption: 0
      }]
    });
    setCurrentTest(null);
  }

  const fetchTestsAndBatches = async () => {
    setLoading(true);
    try {
      const [testsRes, batchesRes] = await Promise.all([
        fetch('/api/admin/test'),
        fetch('/api/admin/batches')
      ]);
      
      const testsData = await testsRes.json();
      if (testsRes.ok) {
        setTests(testsData.tests);
      } else {
        setError('Failed to fetch tests');
      }

      const batchesData = await batchesRes.json();
      if (batchesRes.ok) {
        setBatches(batchesData.batches);
      } else {
        setError(prev => prev + ' Failed to fetch batches');
      }
    } catch (error) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, questionIndex = null, optionIndex = null) => {
    if (questionIndex === null) {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    } else if (optionIndex === null) {
      const newQuestions = [...formData.questions];
      newQuestions[questionIndex][e.target.name] = e.target.value;
      setFormData(prev => ({ ...prev, questions: newQuestions }));
    } else {
      const newQuestions = [...formData.questions];
      newQuestions[questionIndex].options[optionIndex].optionText = e.target.value;
      setFormData(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: [
            { optionText: '' }, { optionText: '' }, { optionText: '' }, { optionText: '' }
          ],
          correctOption: 0
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      const url = currentTest ? `/api/admin/test/${currentTest._id}` : '/api/admin/test';
      const method = currentTest ? 'PUT' : 'POST';
      
      const dataToSend = { ...formData };
      if (dataToSend.deadline) {
        dataToSend.deadline = new Date(dataToSend.deadline).toISOString();
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        await fetchTestsAndBatches();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save test');
      }
    } catch (error) {
      setError('Error saving test');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (test) => {
    setCurrentTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      deadline: test.deadline ? test.deadline.substring(0, 10) : '',
      batchCode: test.batchCode || '',
      questions: test.questions
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const res = await fetch(`/api/admin/test/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchTestsAndBatches();
      } else {
        setError('Failed to delete test');
      }
    } catch (error) {
      setError('Error deleting test');
    }
  };

  if (loading && tests.length === 0) {
    return <div className="loading-container"><div className="loader"></div></div>;
  }

  return (
    <div className="admin-tests-container">
      <header className="tests-header">
        <div>
          <h1 className="tests-title">Test Management</h1>
          <p className="tests-subtitle">Create, edit, and manage tests for all batches.</p>
        </div>
        <button onClick={() => { setShowForm(true); resetForm(); }} className="create-test-btn">
          <IconPlus />
          Create New Test
        </button>
      </header>

      {error && !showForm && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
                <h2 className="modal-title">{currentTest ? 'Edit Test' : 'Create New Test'}</h2>
                <button onClick={() => setShowForm(false)} className="close-btn"><IconX /></button>
            </div>
            {error && showForm && <div className="error-message modal-error">{error}</div>}
            <form onSubmit={handleSubmit} className="test-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Test Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Batch</label>
                  <select name="batchCode" value={formData.batchCode} onChange={handleInputChange} required>
                    <option value="">Select a batch</option>
                    {batches.map(batch => (
                      <option key={batch._id} value={batch.batchCode}>{batch.batchName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={2}></textarea>
                </div>
                <div className="form-group">
                  <label>Deadline Date (Optional)</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} />
                </div>
              </div>

              <div className="questions-section">
                <div className="questions-header">
                  <h3>Questions</h3>
                  <button type="button" onClick={addQuestion} className="add-question-btn">+ Add Question</button>
                </div>
                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="question-block">
                    <div className="question-title">
                      <h4>Question {qIndex + 1}</h4>
                      {formData.questions.length > 1 && <button type="button" onClick={() => removeQuestion(qIndex)} className="remove-question-btn">Remove</button>}
                    </div>
                    <textarea name="questionText" value={q.questionText} onChange={(e) => handleInputChange(e, qIndex)} required placeholder="Enter question text" rows={2}></textarea>
                    <div className="options-grid">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="option-input">
                          <input type="radio" name={`correctOption${qIndex}`} checked={q.correctOption === oIndex} onChange={() => {
                            const newQuestions = [...formData.questions];
                            newQuestions[qIndex].correctOption = oIndex;
                            setFormData(prev => ({ ...prev, questions: newQuestions }));
                          }} required />
                          <input type="text" value={opt.optionText} onChange={(e) => handleInputChange(e, qIndex, oIndex)} required placeholder={`Option ${oIndex + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (currentTest ? 'Update Test' : 'Create Test')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="tests-grid">
        {tests.length > 0 ? tests.map(test => (
          <div key={test._id} className="test-card">
            <div className="card-header">
              <h2 className="card-title">{test.title}</h2>
              <div className="card-actions">
                <button onClick={() => handleEdit(test)} className="action-btn" title="Edit"><IconEdit /></button>
                <button onClick={() => handleDelete(test._id)} className="action-btn delete" title="Delete"><IconDelete /></button>
              </div>
            </div>
            <p className="card-description">{test.description}</p>
            <div className="card-footer">
              <span className="info-tag">{test.questions.length} Questions</span>
              <span className="batch-tag">{test.batchName}</span>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <h3>No Tests Found</h3>
            <p>Click "Create New Test" to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}

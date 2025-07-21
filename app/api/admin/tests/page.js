"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    batchCode: '', // NEW: Add batchCode to formData state
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
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      // NEW: Fetch all batches to populate batchCode dropdown or just fetch all tests
      // For now, fetching all tests (admin view is assumed to see all tests, or can filter)
      const res = await fetch('/api/admin/test'); // Can add ?batchCode=X if filtering is needed
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests);
      } else {
        setError('Failed to fetch tests');
      }
    } catch (error) {
      setError('Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, questionIndex = null, optionIndex = null) => {
    if (questionIndex === null) {
      // Handle test title, description, deadline, and batchCode
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    } else if (optionIndex === null) {
      // Handle question text or correct option
      const newQuestions = [...formData.questions];
      newQuestions[questionIndex][e.target.name] = e.target.value;
      setFormData(prev => ({ ...prev, questions: newQuestions }));
    } else {
      // Handle option text
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
            { optionText: '' },
            { optionText: '' },
            { optionText: '' },
            { optionText: '' }
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
    setLoading(true);

    try {
      const url = currentTest 
        ? `/api/admin/test/${currentTest._id}`
        : '/api/admin/test';

      const method = currentTest ? 'PUT' : 'POST';

      // Format deadline to ISO string if it exists
      const dataToSend = { ...formData };
      if (dataToSend.deadline) {
        dataToSend.deadline = new Date(dataToSend.deadline).toISOString();
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend) // Use dataToSend
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          deadline: '',
          batchCode: '', // Reset batchCode
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
        setCurrentTest(null);
        fetchTests();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save test');
      }
    } catch (error) {
      setError('Error saving test');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (test) => {
    setCurrentTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      deadline: test.deadline ? test.deadline.substring(0, 10) : '',
      batchCode: test.batchCode || '', // Populate batchCode for edit
      questions: test.questions
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/test/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchTests();
      } else {
        setError('Failed to delete test');
      }
    } catch (error) {
      setError('Error deleting test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div> */}
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Test Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setCurrentTest(null);
              setFormData({
                title: '',
                description: '',
                deadline: '',
                batchCode: '', // Reset batchCode
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
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Test'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
                rows={3}
              />
            </div>

            {/* Batch Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code
              </label>
              <input
                type="text"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                required
                placeholder="e.g., BATCH-2025-A"
              />
            </div>

            {/* Deadline Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                // No 'required' here, as deadline might be optional depending on your schema (currently not required in admin/test schema)
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-primary hover:underline"
                >
                  + Add Question
                </button>
              </div>

              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-start">
                    <label className="block text-sm font-medium text-gray-700">
                      Question {qIndex + 1}
                    </label>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    name="questionText"
                    value={question.questionText}
                    onChange={(e) => handleInputChange(e, qIndex)}
                    className="w-full p-2 border rounded-md"
                    required
                    placeholder="Enter question text"
                  />

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correctOption${qIndex}`}
                          checked={question.correctOption === oIndex}
                          onChange={() => {
                            const newQuestions = [...formData.questions];
                            newQuestions[qIndex].correctOption = oIndex;
                            setFormData(prev => ({ ...prev, questions: newQuestions }));
                          }}
                          required
                        />
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleInputChange(e, qIndex, oIndex)}
                          className="flex-1 p-2 border rounded-md"
                          required
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : (currentTest ? 'Update Test' : 'Create Test')}
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {tests.map(test => (
            <div 
              key={test._id} 
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                  <p className="text-gray-600">{test.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(test)}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <span>{test.questions.length} questions</span>
                <span className="mx-2">·</span>
                <span>Batch: <span className="font-medium text-gray-700">{test.batchCode}</span></span> {/* NEW: Display batchCode */}
                <span className="mx-2">·</span>
                <span>
                  Created {new Date(test.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {test.deadline && (
                  <>
                    <span className="mx-2">·</span>
                    <span className="font-medium">
                      Deadline: {new Date(test.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}

          {tests.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No tests found. Create your first test!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
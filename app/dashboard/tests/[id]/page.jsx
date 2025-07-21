"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TakeTest({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const resolvedParams = React.use(params);
  const testId = resolvedParams.id; 
  const viewMode = searchParams.get('view'); 

  const [test, setTest] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isDeadlineOver, setIsDeadlineOver] = useState(false); 

  useEffect(() => {
    if (viewMode === 'history' && testId) {
      fetchHistoricalTestResult(testId);
    } else if (testId) {
      fetchTest(testId);
    } else {
      setError("Test ID not provided.");
      setLoading(false);
    }
  }, [testId, viewMode]);

  const fetchTest = async (id) => {
    try {
      const res = await fetch(`/api/tests/${id}`);
      const data = await res.json();
      if (res.ok) {
        setTest(data.test);
        if (data.test.deadline) {
          const now = new Date();
          const testDeadline = new Date(data.test.deadline);
          if (now > testDeadline) {
            setIsDeadlineOver(true);
            setError(`Test is unavailable. The deadline for this test was ${testDeadline.toLocaleDateString()}.`);
            setLoading(false);
            return; 
          }
        }

        const initialAnswers = {};
        (data.test.questions || []).forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
      } else {
        setError('Failed to fetch test details.');
      }
    } catch (error) { 
      setError('Error loading test details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalTestResult = async (id) => {
    try {
      const res = await fetch(`/api/test-results?testId=${id}`);
      const data = await res.json();

      if (res.ok && data.testResults && data.testResults.length > 0) {
        const latestResult = data.testResults[0]; 
        setTestResult(latestResult);
        setTest(latestResult.test); 
        setScore(latestResult.score);
        
        const historicalAnswers = {};
        (latestResult.answers || []).forEach(ans => { 
          historicalAnswers[ans.questionIndex] = ans.selectedOptionIndex;
        });
        setAnswers(historicalAnswers);
        setShowResults(true); 
      } else {
        setError('No historical record found for this test, or failed to fetch.');
        router.push('/dashboard/tests');
      }
    } catch (error) {
      setError('Error loading historical test results.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    if (viewMode === 'history' || isDeadlineOver) return; 

    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    (test?.questions || []).forEach((question, index) => { 
      if (Number(answers[index]) === Number(question.correctOption)) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmit = async () => {
    if (viewMode === 'history' || isDeadlineOver) return; 

    const finalScore = calculateScore();
    setScore(finalScore);

    const answersToStore = (test?.questions || []).map((question, index) => ({ 
      questionIndex: index,
      selectedOptionIndex: answers[index],
      isCorrect: Number(answers[index]) === Number(question.correctOption),
    }));

    try {
      const res = await fetch('/api/test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: test._id,
          answers: answersToStore,
        }),
      });

      if (res.ok) {
        console.log('Test results successfully stored!');
        const savedResult = await res.json();
        setTestResult(savedResult.result); 
      } else {
        const errorData = await res.json();
        console.error('Failed to store test results:', errorData.error);
        setError(errorData.error || 'Failed to save test results.');
      }
    } catch (networkError) {
      console.error('Network error while storing test results:', networkError);
      setError('A network error occurred while submitting your test. Please try again.');
    }

    setShowResults(true);
  };

  const isTestComplete = () => {
    if (viewMode === 'history' || isDeadlineOver) return true; 
    return Object.values(answers).every(answer => answer !== null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-red-600 mb-4 text-center px-4">{error}</div>
        <button
          onClick={() => router.push('/dashboard/tests')}
          className="text-primary hover:underline mt-4"
        >
          Return to Tests
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-gray-600 mb-4">Test not found</div>
        <button
          onClick={() => router.push('/dashboard/tests')}
          className="text-primary hover:underline"
        >
          Return to Tests
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-zinc-50 py-10 px-4 lg:px-10">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">
            {viewMode === 'history' ? 'Test Results History' : 'Your Test Results'}
          </h1>
          {testResult && ( 
            <p className="text-sm text-gray-500 mb-4">
              Submitted on: {new Date(testResult.submittedAt).toLocaleString()}
            </p>
          )}
          <div className="mb-8">
            <div className="text-xl mb-2">
              Your Score: {score} out of {(test?.questions?.length || 0)} 
            </div>
            <div className="text-lg text-gray-600">
              Percentage: {((score / (test?.questions?.length || 1)) * 100).toFixed(2)}% 
            </div>
          </div>

          <div className="space-y-6">
            {(test?.questions || []).map((question, index) => ( 
              <div 
                key={index}
                className={`p-4 rounded-lg ${
                  Number(answers[index]) === Number(question.correctOption)
                    ? 'bg-green-50' 
                    : 'bg-red-50' 
                }`}
              >
                <div className="font-medium mb-2">
                  Question {index + 1}: {question.questionText}
                </div>
                <div className="grid gap-2">
                  {(question.options || []).map((option, optionIndex) => ( 
                    <div 
                      key={optionIndex}
                      className={`p-2 rounded 
                        ${Number(optionIndex) === Number(question.correctOption) 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : Number(answers[index]) === Number(optionIndex) 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : 'bg-gray-50 text-gray-700' 
                        }`
                      }
                    >
                      {option.optionText}
                      {Number(optionIndex) === Number(answers[index]) && ( 
                        <span className="ml-2 font-semibold"> (Your Answer)</span>
                      )}
                      {Number(optionIndex) === Number(question.correctOption) && 
                        (Number(answers[index]) !== Number(optionIndex) ? ( 
                          <span className="ml-2 font-semibold text-green-600"> (Correct Answer)</span>
                        ) : (
                          <span className="ml-2 font-semibold text-green-600"> (Correct)</span> 
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard/tests')}
            className="mt-8 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
            <p className="text-gray-600">{test.description}</p>
            {test.deadline && (
              <p className="text-sm text-gray-500 mt-2">
                Deadline: {new Date(test.deadline).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {(test?.questions?.length || 0)} 
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0 || isDeadlineOver} 
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min((test?.questions?.length || 1) - 1, prev + 1))} 
                  disabled={currentQuestion === ((test?.questions?.length || 1) - 1) || isDeadlineOver} 
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(((currentQuestion + 1) / (test?.questions?.length || 1)) * 100)}%` }} 
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">
              {(test?.questions?.[currentQuestion]?.questionText || 'Loading question...')} 
            </h2>
            <div className="space-y-3">
              {(test?.questions?.[currentQuestion]?.options || []).map((option, index) => ( 
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion, index)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    answers[currentQuestion] === index
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50'
                  } ${isDeadlineOver ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  disabled={isDeadlineOver}
                >
                  {option.optionText}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {Object.values(answers).filter(a => a !== null).length} of {(test?.questions?.length || 0)} questions answered 
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isTestComplete() || isDeadlineOver} 
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
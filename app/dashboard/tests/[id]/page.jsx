"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TakeTest({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { id: testId } = React.use(params); // CORRECTED: Use React.use() to get the testId
  const viewMode = searchParams.get('view'); 

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isDeadlineOver, setIsDeadlineOver] = useState(false); 
  const [historicalResult, setHistoricalResult] = useState(null);

  useEffect(() => {
    if (viewMode === 'history' && testId) {
      fetchHistoricalTestResult(testId);
    } else if (testId) {
      fetchTestForTaking(testId);
    } else {
      setError("Test ID not provided.");
      setLoading(false);
    }
  }, [testId, viewMode]);

  const fetchTestForTaking = async (id) => {
    try {
      const res = await fetch(`/api/tests/${id}`);
      const data = await res.json();
      if (res.ok) {
        setTest(data.test);
        if (data.test.deadline) {
          if (new Date() > new Date(data.test.deadline)) {
            setIsDeadlineOver(true);
            setError(`The deadline for this test has passed.`);
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
        setError(data.error || 'Failed to fetch test details.');
      }
    } catch (error) { 
      setError('Error loading test details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalTestResult = async (id) => {
    try {
      const res = await fetch(`/api/test-results/${id}`);
      const data = await res.json();

      if (res.ok) {
        const result = data.testResult;
        setHistoricalResult(result);
        setTest(result.test); 
        setScore(result.score);
        
        const historicalAnswers = {};
        (result.answers || []).forEach(ans => { 
          historicalAnswers[ans.questionIndex] = ans.selectedOptionIndex;
        });
        setAnswers(historicalAnswers);
        setShowResults(true); 
      } else {
        setError(data.error || 'Failed to fetch your test history.');
      }
    } catch (error) {
      setError('Error loading historical test results.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    if (viewMode === 'history' || isDeadlineOver) return; 
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (viewMode === 'history' || isDeadlineOver) return; 

    try {
        const res = await fetch('/api/test-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              testId: test._id,
              answers: Object.keys(answers).map(qIndex => ({
                  questionIndex: parseInt(qIndex),
                  selectedOptionIndex: answers[qIndex]
              }))
            }),
        });
        if (res.ok) {
            fetchHistoricalTestResult(test._id);
        } else {
            const errorData = await res.json();
            setError(errorData.error || 'Failed to save test results.');
        }
    } catch (err) {
        setError('A network error occurred while submitting your test.');
    }
  };

  const isTestComplete = () => Object.values(answers).every(answer => answer !== null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
        <div className="text-red-600 mb-4 text-center">{error}</div>
        <button onClick={() => router.push('/dashboard/tests')} className="text-primary hover:underline mt-4">
          Return to Tests
        </button>
      </div>
    );
  }
  
  if (!test) return null;

  if (showResults && historicalResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Submitted on: {new Date(historicalResult.submittedAt).toLocaleString()}</p>
            <div className="mt-6 flex justify-center items-center gap-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">SCORE</p>
                    <p className="text-4xl font-bold text-indigo-600">{historicalResult.score} / {historicalResult.totalQuestions}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">PERCENTAGE</p>
                    <p className="text-4xl font-bold text-indigo-600">{((historicalResult.score / historicalResult.totalQuestions) * 100).toFixed(2)}%</p>
                </div>
            </div>
          </header>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Question Review</h2>
            {test.questions.map((question, index) => {
              const userAnswer = historicalResult.answers.find(a => a.questionIndex === index);
              const isCorrect = userAnswer?.isCorrect;
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800">Question {index + 1}: {question.questionText}</p>
                    {isCorrect ? 
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Correct</span> :
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Incorrect</span>
                    }
                  </div>
                  <div className="mt-4 space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelectedAnswer = userAnswer?.selectedOptionIndex === optionIndex;
                      const isCorrectAnswer = question.correctOption === optionIndex;

                      return (
                        <div key={optionIndex} className={`p-3 rounded-lg border ${
                            isCorrectAnswer ? 'bg-green-50 border-green-300 text-green-800' :
                            isSelectedAnswer ? 'bg-red-50 border-red-300 text-red-800' :
                            'bg-gray-50 border-gray-200'
                        }`}>
                          {option.optionText}
                          {isSelectedAnswer && !isCorrectAnswer && <span className="font-semibold ml-2">(Your Answer)</span>}
                          {isCorrectAnswer && <span className="font-semibold ml-2">(Correct Answer)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => router.push('/dashboard/tests')} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
              Back to Tests
            </button>
          </div>
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
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {test.questions.length}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0} className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50">
                  Previous
                </button>
                <button onClick={() => setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1))} disabled={currentQuestion === test.questions.length - 1} className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">
              {test.questions[currentQuestion].questionText}
            </h2>
            <div className="space-y-3">
              {test.questions[currentQuestion].options.map((option, index) => (
                <button key={index} onClick={() => handleAnswer(currentQuestion, index)} className={`w-full text-left p-3 rounded-md border transition-colors ${answers[currentQuestion] === index ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}`}>
                  {option.optionText}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {Object.values(answers).filter(a => a !== null).length} of {test.questions.length} answered
            </div>
            <button onClick={handleSubmit} disabled={!isTestComplete()} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50">
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
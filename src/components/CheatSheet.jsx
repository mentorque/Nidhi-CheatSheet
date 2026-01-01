import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { getIcon } from '@/lib/iconMap';

const CheatSheet = () => {
  const { name } = useParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const containerRef = useRef(null);

  // Load data based on route parameter
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      if (!name) {
        setError('No candidate name provided');
        setLoading(false);
        return;
      }
      
      try {
        // Load JSON file from Cheatsheet-Info folder
        const response = await fetch(`/Cheatsheet-Info/${name}.json`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`404 - Cheat sheet not found for: ${name}`);
          }
          throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If response is not JSON, try to parse as text first
          const text = await response.text();
          try {
            const jsonData = JSON.parse(text);
            setData(jsonData);
          } catch (parseErr) {
            throw new Error('Response is not valid JSON');
          }
        } else {
          const jsonData = await response.json();
          setData(jsonData);
        }
      } catch (err) {
        console.error('Error loading candidate data:', err);
        setError(`Could not load cheat sheet for: ${name}. ${err.message || 'Make sure the JSON file exists and is valid.'}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [name]);

  const handleCardFlip = (sectionIndex, cardIndex) => {
    const key = `${sectionIndex}-${cardIndex}`;
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextSection = () => {
    if (data && currentSection < data.sections.length - 1) {
      setShowQuiz(true);
      setQuizAnswers({});
      setQuizComplete(false);
    }
  };

  const handleQuizSubmit = () => {
    setQuizComplete(true);
  };

  const handleContinueAfterQuiz = () => {
    setShowQuiz(false);
    setQuizComplete(false);
    setQuizAnswers({});
    setCurrentSection(prev => prev + 1);
    setFlippedCards(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading your cheat sheet...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center text-white max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 bg-black rounded-sm"></div>
            </div>
            <span className="text-white font-bold text-3xl">Mentorque</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-4">
            Oops!
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-300 mb-2">
            No cheat sheet found for <span className="text-blue-400">{name}</span>
          </p>
          <p className="text-lg text-gray-400 mb-6">
            Maybe it's a typo? Check the name and try again.
          </p>
          
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-400/30"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const sections = data.sections;
  const currentSectionData = sections[currentSection];
  const allAnswersCorrect = currentSectionData.quiz && currentSectionData.quiz.length > 0 
    ? currentSectionData.quiz.every((q, idx) => quizAnswers[idx] === q.answer)
    : true;

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-black">
      <div className="min-h-screen bg-black">
        {/* Subtle Branding at Top */}
        <div className="pt-8 pb-8 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded-sm"></div>
              </div>
              <span className="text-white font-bold text-2xl">Mentorque</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-2">
                Welcome, <span className="text-blue-400">{data.name}</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base mb-2">
                Your personalized interview preparation cheat sheet
              </p>
              <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto">
                {data.description}
              </p>
            </div>
          </div>
        </div>


        {/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-white mb-4">
                  Quick Check: <span className="text-blue-400">{currentSectionData.title}</span>
                </h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  Hi {data.name.split(' ')[0]}! Answer these 3 questions before moving to the next section
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {currentSectionData.quiz && currentSectionData.quiz.length > 0 ? currentSectionData.quiz.map((quizItem, index) => (
                  <div key={index} className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <p className="text-white text-base sm:text-lg mb-4 font-medium">
                      {index + 1}. {quizItem.question}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleQuizAnswer(index, true)}
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          quizAnswers[index] === true
                            ? 'bg-blue-400 text-white shadow-lg shadow-blue-400/30'
                            : 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/10'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleQuizAnswer(index, false)}
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          quizAnswers[index] === false
                            ? 'bg-blue-400 text-white shadow-lg shadow-blue-400/30'
                            : 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/10'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 py-4">
                    No quiz questions available for this section.
                  </div>
                )}
              </div>

              {!quizComplete && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {currentSectionData.quiz && Object.keys(quizAnswers).length === currentSectionData.quiz.length && (
                    <button
                      onClick={handleQuizSubmit}
                      className="px-8 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-400/30"
                    >
                      Submit Answers
                    </button>
                  )}
                  <button
                    onClick={handleContinueAfterQuiz}
                    className="px-8 py-3 bg-white/[0.05] text-gray-300 rounded-xl font-medium hover:bg-white/[0.1] transition-all duration-300 border border-white/10"
                  >
                    Skip Quiz
                  </button>
                </div>
              )}

              {quizComplete && (
                <div className="text-center space-y-4">
                  <div className={`text-2xl font-bold mb-4 ${allAnswersCorrect ? 'text-green-400' : 'text-yellow-400'}`}>
                    {allAnswersCorrect ? '✓ All Correct!' : 'Review Your Answers'}
                  </div>
                  <div className="space-y-2 mb-6">
                    {currentSectionData.quiz && currentSectionData.quiz.length > 0 ? currentSectionData.quiz.map((quizItem, index) => (
                      <div key={index} className="text-left backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-4">
                        <p className="text-gray-300 text-sm mb-1">{quizItem.question}</p>
                        <p className={`text-sm font-medium ${
                          quizAnswers[index] === quizItem.answer ? 'text-green-400' : 'text-red-400'
                        }`}>
                          Correct Answer: {quizItem.answer ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )) : null}
                  </div>
                  <button
                    onClick={handleContinueAfterQuiz}
                    className="px-8 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-400/30"
                  >
                    Continue to Next Section
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Section */}
        <div className="bg-black py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12" ref={containerRef}>
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-blue-400">
                  {getIcon(currentSectionData.icon)}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl text-white leading-tight">
                  {currentSectionData.title}
                </h2>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-100 leading-relaxed max-w-2xl mx-auto px-4">
                Section {currentSection + 1} of {sections.length}
              </p>
            </div>

            {/* Flip Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {currentSectionData.cards.map((card, cardIndex) => {
                const cardKey = `${currentSection}-${cardIndex}`;
                const isFlipped = flippedCards.has(cardKey);

                return (
                  <div
                    key={cardIndex}
                    className="flip-card-container"
                    onClick={() => handleCardFlip(currentSection, cardIndex)}
                  >
                    <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                      {/* Front of Card */}
                      <div className="flip-card-front">
                        <div className="relative w-full h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center transition-all duration-500 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-blue-400/10 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 flex flex-col items-center justify-center">
                          <div className="relative z-10">
                            <h3 className="text-xl lg:text-2xl text-white mb-4 drop-shadow-sm">
                              {card.front}
                            </h3>
                            <p className="text-gray-400 text-sm">Click to flip</p>
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/[0.03] via-transparent to-purple-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="flip-card-back">
                        <div className="relative w-full h-full backdrop-blur-xl bg-white/[0.06] border-2 border-white/25 rounded-2xl p-6 shadow-2xl shadow-blue-400/20 overflow-y-auto">
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg text-blue-400 font-semibold">
                                {card.front}
                              </h3>
                              <RotateCcw className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">
                              {card.back}
                            </p>
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/[0.08] via-transparent to-purple-600/[0.05]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              {currentSection > 0 && (
                <button
                  onClick={() => {
                    setCurrentSection(prev => prev - 1);
                    setFlippedCards(new Set());
                    setShowQuiz(false);
                    setQuizComplete(false);
                    setQuizAnswers({});
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-white/[0.05] text-white rounded-xl font-medium hover:bg-white/[0.1] transition-all duration-300 border border-white/10"
                >
                  Previous Section
                </button>
              )}
              
              {currentSection < sections.length - 1 && (
                <button
                  onClick={handleNextSection}
                  className="px-6 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-400/30"
                >
                  Next Section →
                </button>
              )}

              {currentSection === sections.length - 1 && (
                <div className="text-center">
                  <p className="text-gray-300 mb-2 text-lg">Congratulations, {data.name.split(' ')[0]}!</p>
                  <p className="text-gray-400 mb-4 text-sm">You've completed all sections. Best of luck with your interviews!</p>
                  <button
                    onClick={() => {
                      setCurrentSection(0);
                      setFlippedCards(new Set());
                      setShowQuiz(false);
                      setQuizComplete(false);
                      setQuizAnswers({});
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-400/30"
                  >
                    Review Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .flip-card-container {
          background-color: transparent;
          width: 100%;
          height: 400px;
          min-height: 400px;
          perspective: 1000px;
          cursor: pointer;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 1rem;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        @media (max-width: 768px) {
          .flip-card-container {
            height: 350px;
            min-height: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default CheatSheet;


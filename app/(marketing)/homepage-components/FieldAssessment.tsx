'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    question: "Your boss says: \"We don't have the budget for a raise right now.\" What do you do?",
    options: [
      'Accept it and wait until next year',
      'Threaten to leave if they don\'t reconsider',
      'Ask: "What specific milestones would make this a yes next quarter?"',
      'Send a passive-aggressive email to HR',
    ],
    correct: [2],
    explanation: 'Reframing the conversation from "can I have a raise" to "what would earn one" shifts the power dynamic. You are no longer asking. You are negotiating.',
  },
  {
    question: "You notice your negotiation partner keeps glancing at the door. What does this signal?",
    options: [
      "They are bored with the conversation",
      'They have another meeting soon',
      'They are losing confidence in their position and looking for an exit',
      'Nothing significant',
    ],
    correct: [2],
    explanation: 'Body language leaks intent. Gaze aversion toward exits signals discomfort with the current frame. This is your opening to apply gentle pressure or offer a face-saving concession.',
  },
  {
    question: "Someone says: \"I'm not ready for anything serious right now.\" What is really happening?",
    options: [
      'They are rejecting you completely',
      'They mean exactly what they said',
      'They are testing your reaction to see if you get needy or stay composed',
      'They want you to convince them otherwise',
    ],
    correct: [2],
    explanation: 'This is a frame test. Getting emotional or pushing harder confirms their hesitation. Staying composed and non-reactive ("That works for me too") flips the dynamic entirely.',
  },
  {
    question: "A client says: \"We're still evaluating other vendors.\" Best response?",
    options: [
      'Drop your price immediately',
      'Ask who else they are considering',
      'Say: "Of course. I\'ll send the ROI analysis from our last three clients in your space. Happy to connect you directly with them."',
      'Wait and follow up next week',
    ],
    correct: [2],
    explanation: 'Social proof neutralizes the leverage play. By offering direct access to references, you shift from defending your position to demonstrating undeniable value.',
  },
  {
    question: "How do you take control of a conversation in the first 30 seconds?",
    options: [
      'Speak first and speak loudly',
      'Give a firm handshake and compliment them',
      'Let them speak first, then pause before responding',
      'Jump straight into your agenda',
    ],
    correct: [2],
    explanation: 'Strategic silence creates authority. Letting them speak first gives you information. The pause before responding signals that you are thoughtful, not reactive. This is frame control in action.',
  },
];

const results = {
  high: {
    title: 'NATURAL STRATEGIST',
    score: '4-5 correct',
    description: 'You already think in frameworks. Shadow Persuasion will sharpen your instincts and give you advanced techniques most people never learn.',
  },
  mid: {
    title: 'HIGH POTENTIAL',
    score: '2-3 correct',
    description: 'Your instincts are solid but inconsistent. Shadow Persuasion will give you the structured system to perform at this level in every conversation, not just some.',
  },
  low: {
    title: 'UNTAPPED POTENTIAL',
    score: '0-1 correct',
    description: 'You are leaving significant leverage on the table in almost every interaction. The good news: these are learnable skills. Shadow Persuasion will build the foundation you are missing.',
  },
};

function getResult(score: number) {
  if (score >= 4) return results.high;
  if (score >= 2) return results.mid;
  return results.low;
}

const FieldAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const score = answers.reduce((acc, answer, index) => questions[index].correct.includes(answer) ? acc + 1 : acc, 0);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);

    setTimeout(() => {
      const newAnswers = [...answers, answerIndex];
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    }, 600);
  };

  const result = getResult(score);
  const q = questions[currentQuestion];

  return (
    <section className="relative px-6 md:px-12 py-16 md:py-20 bg-[#1A1A1A] text-[#E8E8E0]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-3">
            FIELD ASSESSMENT
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-white">
            Test Your Instincts
          </p>
          <p className="text-gray-400 mt-3 text-lg">
            5 real-world scenarios. See where you stand.
          </p>
        </div>

        <div className="border border-[#333] bg-[#222] p-6 sm:p-8 shadow-2xl min-h-[380px] rounded-xl flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center flex flex-col items-center w-full"
              >
                <p className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">Your Result</p>
                <div className="p-6 border border-[#D4A017]/30 rounded-xl bg-black/30 w-full max-w-md">
                  <p className="text-3xl text-[#D4A017] font-bold mb-1">{result.title}</p>
                  <p className="text-sm text-gray-500 font-mono mb-4">{score} out of {questions.length} correct</p>
                  <p className="text-base text-gray-300 leading-relaxed">{result.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <a
                    href="/login"
                    className="bg-[#D4A017] text-[#0A0A0A] font-mono uppercase px-8 py-3 text-sm font-bold tracking-wider hover:bg-[#E8B830] transition-colors rounded-lg"
                  >
                    Start Training Now
                  </a>
                  <button
                    onClick={() => { setAnswers([]); setCurrentQuestion(0); setShowResults(false); setSelectedAnswer(null); }}
                    className="border border-[#333] text-gray-400 font-mono uppercase px-6 py-3 text-sm tracking-wider hover:border-[#D4A017] hover:text-[#D4A017] transition-colors rounded-lg"
                  >
                    Retake
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-gray-500">QUESTION {currentQuestion + 1} OF {questions.length}</span>
                  <div className="flex gap-1.5">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i < currentQuestion ? 'bg-[#D4A017]' : i === currentQuestion ? 'bg-[#D4A017]/50' : 'bg-[#333]'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xl md:text-2xl mb-8 leading-relaxed text-white">{q.question}</p>

                <div className="space-y-3">
                  {q.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = q.correct.includes(index);
                    const showFeedback = selectedAnswer !== null;

                    let borderColor = 'border-[#333] hover:border-[#D4A017]/50 hover:bg-[#D4A017]/5';
                    if (showFeedback && isSelected && isCorrect) borderColor = 'border-green-500 bg-green-500/10';
                    if (showFeedback && isSelected && !isCorrect) borderColor = 'border-red-500/50 bg-red-500/5';
                    if (showFeedback && !isSelected && isCorrect) borderColor = 'border-green-500/30';

                    return (
                      <button
                        key={index}
                        onClick={() => !showFeedback && handleAnswer(index)}
                        disabled={showFeedback}
                        className={`flex items-start gap-4 text-left w-full p-4 border rounded-lg transition-all duration-200 ${borderColor} disabled:cursor-default`}
                      >
                        <span className="font-mono text-base text-[#D4A017] mt-0.5 shrink-0">({String.fromCharCode(65 + index)})</span>
                        <span className="text-base text-gray-300">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default FieldAssessment;

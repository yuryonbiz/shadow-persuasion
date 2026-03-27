
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    question: "Your client rejects your proposal. What's your next move?",
    options: [
      'Accept and move on',
      'Argue your case harder',
      'Deploy Scarcity Frame and create artificial urgency',
      'Use the Void Pull — go silent for 48 hours'
    ],
    correct: [2, 3]
  },
  {
    question: "You notice your negotiation partner keeps glancing at the door. What does this signal?",
    options: [
      "They're bored",
      'They have another meeting',
      "Loss of frame — they're looking for an exit",
      'Nothing significant'
    ],
    correct: [2]
  },
  {
    question: "How do you establish dominance in the first 30 seconds?",
    options: [
      'Firm handshake',
      'Speak first and loudly',
      'Strategic silence — let them fill the void',
      'Compliment them'
    ],
    correct: [2]
  }
];

const results = {
  operator: {
    title: "CLASSIFICATION: NATURAL OPERATOR",
    description: "You already think in frameworks. Shadow Persuasion will weaponize your instincts."
  },
  potential: {
    title: "CLASSIFICATION: HIGH POTENTIAL",
    description: "Your instincts are untrained. Shadow Persuasion will build the architecture you're missing."
  }
}

const FieldAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const score = answers.reduce((acc, answer, index) => questions[index].correct.includes(answer) ? acc + 1 : acc, 0);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  }

  return (
    <section className="relative -mx-6 md:-mx-12 px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0]">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                 <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-white">Operator Evaluation</h2>
                <div className="w-24 h-1 bg-red-600 mt-4 mx-auto"></div>
            </div>

            <div className="border border-amber-900/50 bg-[#222222] p-6 sm:p-8 shadow-2xl min-h-[350px] rounded-lg flex items-center justify-center">
                <AnimatePresence mode="wait">
                {
                  showResults ? (
                    <motion.div 
                      key="results"
                      initial={{opacity: 0, y: 20}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.5}}
                      className="text-center flex flex-col items-center"
                    >
                        <h3 className="font-mono text-lg uppercase tracking-widest text-[#D4A017]">Field Assessment Result</h3>
                        <div className="my-4 w-1/2 border-t border-dashed border-amber-900/50"></div>
                        <div className="p-6 border border-amber-500/30 rounded-lg bg-black/20">
                            <p className="text-2xl text-amber-400 font-bold">{score >= 2 ? results.operator.title : results.potential.title}</p>
                            <p className="text-lg mt-2 text-gray-300 max-w-md mx-auto">{score >= 2 ? results.operator.description : results.potential.description}</p>
                        </div>
                        <button onClick={() => { setAnswers([]); setCurrentQuestion(0); setShowResults(false); }} className='mt-8 bg-[#D4A017] text-black font-mono uppercase px-6 py-2 text-sm font-bold tracking-wider hover:bg-amber-300 transition-colors'>
                          Retake Assessment
                        </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key={currentQuestion}
                      initial={{opacity: 0, x: 20}}
                      animate={{opacity: 1, x: 0}}
                      exit={{opacity: 0, x: -20}}
                      transition={{duration: 0.3}}
                      className="w-full"
                    >
                        <p className="text-xl mb-8 leading-relaxed text-center text-gray-200">{currentQuestion + 1}. {questions[currentQuestion].question}</p>
                        <div className="space-y-3 max-w-2xl mx-auto">
                            {questions[currentQuestion].options.map((option, index) => (
                                <button 
                                  key={index} 
                                  onClick={() => handleAnswer(index)}
                                  className="flex items-start gap-4 text-left w-full p-4 border rounded-md transition-all duration-200 group border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/50"
                                >
                                    <span className="font-mono text-lg text-amber-400 group-hover:text-amber-300">({String.fromCharCode(65 + index)})</span>
                                    <span className='text-lg text-gray-300 group-hover:text-white'>{option}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                  )
                }
                </AnimatePresence>
            </div>
        </div>
    </section>
  )
}

export default FieldAssessment;

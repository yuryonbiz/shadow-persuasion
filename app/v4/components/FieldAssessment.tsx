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
    <section className="relative py-16">
        <div className="text-left mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
                FIELD ASSESSMENT
            </h2>
            <p className="text-3xl mt-2">Operator Evaluation</p>
        </div>

        <div className="border-2 border-gray-400 bg-[#F4ECD8] p-6 sm:p-8 shadow-lg min-h-[300px]">
            <AnimatePresence mode="wait">
            {
              showResults ? (
                <motion.div 
                  key="results"
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.5}}
                  className="text-center"
                >
                    <h3 className="font-mono text-lg uppercase tracking-widest text-black">FIELD ASSESSMENT RESULT</h3>
                    <div className="my-4 border-t border-dashed border-gray-400"></div>
                    <p className="text-2xl mt-4">{score >= 2 ? results.operator.title : results.potential.title}</p>
                    <p className="text-lg mt-2 text-gray-700">{score >= 2 ? results.operator.description : results.potential.description}</p>
                    <button onClick={() => { setAnswers([]); setCurrentQuestion(0); setShowResults(false); }} className='mt-8 bg-black text-white font-mono uppercase px-4 py-2 text-sm'>
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
                >
                    <p className="text-lg mb-6 leading-relaxed">{currentQuestion + 1}. {questions[currentQuestion].question}</p>
                    <div className="space-y-3">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button 
                              key={index} 
                              onClick={() => handleAnswer(index)}
                              className="flex items-start gap-3 text-left w-full p-3 border border-transparent hover:border-gray-400 hover:bg-[#EDE3D0] transition-colors duration-200"
                            >
                                <span className="font-mono text-lg">({String.fromCharCode(65 + index)})</span>
                                <span className='text-lg'>{option}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
              )
            }
            </AnimatePresence>
        </div>

    </section>
  )
}

export default FieldAssessment;

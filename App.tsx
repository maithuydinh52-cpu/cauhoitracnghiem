
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Question, Quiz } from './types';
import { generateMathQuiz } from './services/geminiService';
import { Button } from './components/Button';
import { 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  RefreshCcw, 
  ChevronRight, 
  XCircle,
  Trophy,
  History,
  Timer
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleStartGeneration = async () => {
    if (!topic.trim()) return;
    setState('GENERATING');
    setError(null);
    try {
      const questions = await generateMathQuiz(topic);
      setQuiz({
        topic,
        questions,
        createdAt: Date.now(),
      });
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setStartTime(Date.now());
      setState('QUIZ');
    } catch (err) {
      setError("Rất tiếc, đã có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại chủ đề khác.");
      setState('IDLE');
    }
  };

  const handleSelectAnswer = (questionIdx: number, answerIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [questionIdx]: answerIdx }));
    // Auto-advance to next question if not at the end
    if (questionIdx === currentQuestionIndex && currentQuestionIndex < 9) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
    }
  };

  const handleFinish = () => {
    setEndTime(Date.now());
    setState('RESULT');
  };

  const reset = () => {
    setState('IDLE');
    setTopic('');
    setQuiz(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((score, q, idx) => {
      return userAnswers[idx] === q.correctAnswerIndex ? score + 1 : score;
    }, 0);
  };

  const getDuration = () => {
    const seconds = Math.floor((endTime - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">MathGenius <span className="text-indigo-600">AI</span></h1>
          </div>
          {state === 'QUIZ' && (
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <Timer size={16} />
                <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                Câu {currentQuestionIndex + 1}/10
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {state === 'IDLE' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Tạo 10 câu hỏi trắc nghiệm Toán <br className="hidden md:block" />
                <span className="text-indigo-600">chỉ trong 5 giây</span> với AI
              </h2>
              <p className="text-slate-500 text-lg">
                Nhập chủ đề Toán THPT bất kỳ (Hình học, Giải tích, Đạo hàm...) và nhận ngay đề thi chất lượng.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Chủ đề bài tập</label>
                <input 
                  type="text"
                  placeholder="Ví dụ: Nguyên hàm và Tích phân lớp 12"
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartGeneration()}
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  <XCircle className="shrink-0 mt-0.5" size={18} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button 
                className="w-full py-4 text-lg"
                onClick={handleStartGeneration}
                disabled={!topic.trim()}
              >
                Bắt đầu tạo câu hỏi
              </Button>

              <div className="pt-4 grid grid-cols-2 gap-4 text-xs text-slate-500 font-medium text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                    <History size={14} />
                  </div>
                  <span>Tiết kiệm thời gian</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                    <CheckCircle2 size={14} />
                  </div>
                  <span>Chính xác & Chi tiết</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {["Đạo hàm 11", "Mặt cầu 12", "Lượng giác 10"].map((t) => (
                 <button 
                  key={t}
                  onClick={() => {setTopic(t); handleStartGeneration();}}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm font-medium text-slate-600 text-left flex justify-between items-center group"
                 >
                   {t}
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                 </button>
               ))}
            </div>
          </div>
        )}

        {state === 'GENERATING' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-pulse">
            <div className="relative">
               <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <BrainCircuit className="text-indigo-600" size={32} />
               </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Đang biên soạn câu hỏi...</h3>
              <p className="text-slate-500 max-w-xs mx-auto">AI đang nghiên cứu chủ đề "{topic}" để tạo ra những bài tập chất lượng nhất.</p>
            </div>
          </div>
        )}

        {state === 'QUIZ' && quiz && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
             <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 space-y-8 min-h-[400px]">
                <div className="space-y-4">
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                     Câu hỏi {currentQuestionIndex + 1}
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-800">
                    {quiz.questions[currentQuestionIndex].question}
                  </h3>
                </div>

                <div className="grid gap-3">
                  {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                    const isSelected = userAnswers[currentQuestionIndex] === idx;
                    const labels = ['A', 'B', 'C', 'D'];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(currentQuestionIndex, idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${
                           isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {labels[idx]}
                        </span>
                        <span className="text-lg font-medium">{option}</span>
                      </button>
                    );
                  })}
                </div>
             </div>

             <div className="flex items-center justify-between gap-4 pt-4">
                <Button 
                  variant="secondary"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Câu trước
                </Button>

                <div className="flex gap-2">
                  {quiz.questions.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentQuestionIndex ? 'w-8 bg-indigo-600' : 
                        userAnswers[idx] !== undefined ? 'w-4 bg-indigo-200' : 'w-4 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {currentQuestionIndex === 9 ? (
                  <Button onClick={handleFinish} disabled={Object.keys(userAnswers).length < 10}>
                    Hoàn thành
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                    Câu kế tiếp
                  </Button>
                )}
             </div>
          </div>
        )}

        {state === 'RESULT' && quiz && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
             {/* Score Card */}
             <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-indigo-200/50 border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy size={40} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900">Kết quả: {calculateScore()}/10</h2>
                  <p className="text-slate-500 text-lg">Bạn đã hoàn thành bài tập về <span className="font-bold text-indigo-600">{quiz.topic}</span></p>
                  
                  <div className="flex justify-center gap-8 pt-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thời gian</p>
                      <p className="text-2xl font-bold text-slate-800">{getDuration()}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100 mt-2"></div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Độ chính xác</p>
                      <p className="text-2xl font-bold text-slate-800">{calculateScore() * 10}%</p>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap justify-center gap-4">
                    <Button onClick={reset} variant="secondary">Làm chủ đề khác</Button>
                    <Button onClick={() => {
                       setUserAnswers({});
                       setCurrentQuestionIndex(0);
                       setStartTime(Date.now());
                       setState('QUIZ');
                    }} className="flex gap-2">
                       <RefreshCcw size={18} />
                       Làm lại đề này
                    </Button>
                  </div>
                </div>
             </div>

             {/* Review Section */}
             <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 px-2">
                  <CheckCircle2 size={24} className="text-indigo-600" />
                  Xem lại lời giải chi tiết
                </h3>

                <div className="grid gap-6">
                  {quiz.questions.map((q, idx) => {
                    const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                    const labels = ['A', 'B', 'C', 'D'];
                    return (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-lg font-bold leading-relaxed text-slate-800">
                            Câu {idx + 1}: {q.question}
                          </h4>
                          <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx}
                              className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-3 ${
                                oIdx === q.correctAnswerIndex 
                                  ? 'border-green-200 bg-green-50 text-green-800' 
                                  : oIdx === userAnswers[idx] && !isCorrect
                                    ? 'border-red-200 bg-red-50 text-red-800'
                                    : 'border-slate-50 bg-slate-50 text-slate-500'
                              }`}
                            >
                              <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-md font-bold text-xs ${
                                 oIdx === q.correctAnswerIndex ? 'bg-green-500 text-white' : 
                                 oIdx === userAnswers[idx] ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {labels[oIdx]}
                              </span>
                              {opt}
                              {oIdx === q.correctAnswerIndex && <CheckCircle2 size={16} className="ml-auto text-green-600" />}
                              {oIdx === userAnswers[idx] && !isCorrect && <XCircle size={16} className="ml-auto text-red-600" />}
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                           <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Hướng dẫn giải</p>
                           <p className="text-sm leading-relaxed text-indigo-900 italic">
                             {q.explanation}
                           </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>

             <div className="text-center pt-8">
               <Button onClick={reset} variant="ghost" className="text-slate-400 hover:text-indigo-600">
                 Trở về trang chủ
               </Button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

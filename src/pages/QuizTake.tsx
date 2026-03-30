import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_QUIZ = {
  id: '1',
  title: 'Kiểm tra kiến thức ReactJS',
  questions: [
    { id: 'q1', text: 'React là gì?', options: ['Một framework', 'Một thư viện', 'Một ngôn ngữ', 'Một hệ điều hành'], answer: 1 },
    { id: 'q2', text: 'Hook nào dùng để quản lý state?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], answer: 2 },
    { id: 'q3', text: 'Virtual DOM là gì?', options: ['Bản sao của DOM thật', 'DOM thật', 'Một loại database', 'Một loại server'], answer: 0 },
  ]
};

export function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quizData = location.state?.quiz || MOCK_QUIZ;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [quizData.questions[currentQuestion].id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    quizData.questions.forEach((q: any) => {
      if (answers[q.id] === q.answer) correct++;
    });
    setScore(Math.round((correct / quizData.questions.length) * 100));
    setIsSubmitted(true);
    toast.success('Đã nộp bài thành công!');
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold">{score}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành bài kiểm tra!</h2>
            <p className="text-gray-500 mb-8">Bạn đã trả lời đúng {Math.round((score / 100) * quizData.questions.length)}/{quizData.questions.length} câu hỏi.</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/quiz')}>Quay lại danh sách</Button>
              <Button onClick={() => { setIsSubmitted(false); setAnswers({}); setCurrentQuestion(0); }}>Làm lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quizData.title}</h1>
          <p className="text-gray-500 mt-1">Câu {currentQuestion + 1} / {quizData.questions.length}</p>
        </div>
        <div className="flex items-center text-orange-600 bg-orange-50 px-4 py-2 rounded-lg font-medium">
          <Clock className="w-5 h-5 mr-2" />
          14:59
        </div>
      </div>

      <ProgressBar value={progress} className="mb-8" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion + 1}. {question.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[question.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50 text-blue-900' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    isSelected ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                  <span className="text-base">{option}</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={handlePrev} disabled={currentQuestion === 0}>
          Câu trước
        </Button>
        {currentQuestion === quizData.questions.length - 1 ? (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Nộp bài
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Câu tiếp theo
          </Button>
        )}
      </div>
    </div>
  );
}

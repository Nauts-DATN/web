import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CheckSquare, Clock, Award, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from '@google/genai';

const MOCK_QUIZZES = [
  { id: '1', title: 'Kiểm tra kiến thức ReactJS', subject: 'Lập trình Web', questions: 15, time: 20, score: null },
  { id: '2', title: 'Ôn tập Cấu trúc dữ liệu', subject: 'Cấu trúc dữ liệu', questions: 20, time: 30, score: 85 },
  { id: '3', title: 'Khái niệm cơ bản về AI', subject: 'Trí tuệ nhân tạo', questions: 10, time: 15, score: null },
];

export function QuizList() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAIQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Vui lòng nhập chủ đề!');
      return;
    }

    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Missing Gemini API Key');
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tạo một bài trắc nghiệm gồm 5 câu hỏi về chủ đề: "${topic}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "ID duy nhất cho câu hỏi, ví dụ: q1, q2" },
                text: { type: Type.STRING, description: "Nội dung câu hỏi" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Danh sách 4 lựa chọn đáp án"
                },
                answer: { type: Type.INTEGER, description: "Vị trí của đáp án đúng trong mảng options (từ 0 đến 3)" }
              },
              required: ["id", "text", "options", "answer"]
            }
          }
        }
      });
      
      const questions = JSON.parse(response.text || '[]');
      if (!questions || questions.length === 0) throw new Error('No questions generated');

      toast.success('Tạo quiz thành công!');
      setIsModalOpen(false);
      setTopic('');
      navigate('/quiz/custom', {
        state: {
          quiz: {
            id: 'custom',
            title: `Quiz: ${topic}`,
            questions: questions
          }
        }
      });
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tạo quiz bằng AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bài luyện tập (Quiz)</h1>
          <p className="text-gray-500 mt-1">Kiểm tra kiến thức của bạn qua các bài trắc nghiệm.</p>
        </div>
        <Button 
          className="flex items-center bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
          onClick={() => setIsModalOpen(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Tạo Quiz bằng AI
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Tạo Quiz bằng AI
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Nhập chủ đề bạn muốn kiểm tra kiến thức, AI sẽ tự động tạo một bài trắc nghiệm gồm 5 câu hỏi cho bạn.
              </p>
              <Input
                label="Chủ đề"
                placeholder="VD: Lịch sử Việt Nam, JavaScript cơ bản..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                autoFocus
              />
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                onClick={handleGenerateAIQuiz}
                isLoading={isGenerating}
              >
                Tạo bài kiểm tra
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_QUIZZES.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-indigo-600" />
                </div>
                {quiz.score !== null && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đã làm: {quiz.score}/100
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{quiz.subject}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-1 text-gray-400" />
                  {quiz.questions} câu
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {quiz.time} phút
                </div>
              </div>

              <Link to={`/quiz/${quiz.id}`}>
                <Button variant={quiz.score !== null ? 'outline' : 'primary'} className="w-full">
                  {quiz.score !== null ? 'Làm lại' : 'Bắt đầu làm bài'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

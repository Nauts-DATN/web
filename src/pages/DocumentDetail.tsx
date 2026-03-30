import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from '@google/genai';

const MOCK_CONTENT = `
Trí tuệ nhân tạo (AI) là một lĩnh vực của khoa học máy tính tập trung vào việc tạo ra các hệ thống thông minh có khả năng thực hiện các nhiệm vụ thường đòi hỏi trí thông minh của con người. Các nhiệm vụ này bao gồm học tập, suy luận, giải quyết vấn đề, hiểu ngôn ngữ tự nhiên và nhận thức.

AI được chia thành hai loại chính: AI hẹp (Narrow AI) và AI chung (General AI). AI hẹp được thiết kế để thực hiện một nhiệm vụ cụ thể, chẳng hạn như nhận dạng khuôn mặt, dịch ngôn ngữ hoặc chơi cờ. Hầu hết các hệ thống AI hiện nay đều là AI hẹp. Ngược lại, AI chung là một hệ thống có khả năng hiểu, học và áp dụng kiến thức trong nhiều lĩnh vực khác nhau, tương tự như con người. Tuy nhiên, AI chung vẫn chỉ là một khái niệm lý thuyết và chưa được hiện thực hóa.

Một trong những công nghệ cốt lõi của AI là học máy (Machine Learning), cho phép máy tính học từ dữ liệu mà không cần được lập trình rõ ràng. Học sâu (Deep Learning), một tập hợp con của học máy, sử dụng các mạng nơ-ron nhân tạo với nhiều lớp để giải quyết các vấn đề phức tạp như nhận dạng hình ảnh và giọng nói.
`;

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Missing Gemini API Key');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tóm tắt nội dung sau bằng tiếng Việt một cách ngắn gọn, dễ hiểu, gạch đầu dòng những ý chính:\n\n${MOCK_CONTENT}`
      });
      
      setSummary(response.text || 'Không thể tạo tóm tắt.');
      toast.success('Đã tạo tóm tắt thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi gọi AI tóm tắt.');
      // Fallback for demo if API fails
      setSummary('- AI là lĩnh vực khoa học máy tính tạo ra hệ thống thông minh.\n- Có 2 loại: AI hẹp (thực hiện 1 nhiệm vụ cụ thể) và AI chung (lý thuyết, giống con người).\n- Công nghệ cốt lõi: Học máy (Machine Learning) và Học sâu (Deep Learning).');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Missing Gemini API Key');
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tạo một bài trắc nghiệm gồm 5 câu hỏi dựa trên nội dung sau:\n\n${MOCK_CONTENT}`,
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
      navigate('/quiz/custom', {
        state: {
          quiz: {
            id: 'custom',
            title: 'Quiz: Chương 1: Tổng quan về AI',
            questions: questions
          }
        }
      });
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tạo quiz bằng AI.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/documents" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Chương 1: Tổng quan về AI.pdf</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer */}
        <Card className="lg:col-span-2 h-[800px] flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Nội dung tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {MOCK_CONTENT}
            </div>
          </CardContent>
        </Card>

        {/* AI Summary Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                AI Trợ giảng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Sử dụng AI để tóm tắt nhanh nội dung tài liệu này, giúp bạn nắm bắt ý chính dễ dàng hơn.
              </p>
              <Button 
                onClick={handleSummarize} 
                className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                isLoading={isSummarizing}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Tóm tắt bằng AI
              </Button>

              {summary && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2">Kết quả tóm tắt:</h4>
                  <div className="text-sm text-purple-800 whitespace-pre-wrap">
                    {summary}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tạo bài tập</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Tạo nhanh một bài trắc nghiệm dựa trên nội dung tài liệu này để kiểm tra kiến thức.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerateQuiz}
                isLoading={isGeneratingQuiz}
              >
                <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                Tạo Quiz tự động
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

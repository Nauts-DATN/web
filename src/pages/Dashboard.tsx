import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, CheckSquare, TrendingUp, Clock } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export function Dashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Tổng tài liệu",
      value: "12",
      icon: FileText,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      title: "Quiz đã làm",
      value: "24",
      icon: CheckSquare,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Điểm trung bình",
      value: "8.5",
      icon: TrendingUp,
      iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      title: "Giờ học tuần này",
      value: "14h",
      icon: Clock,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Chào mừng trở lại, {user?.name}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Dưới đây là tổng quan về tiến độ học tập của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
              >
                <stat.icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ khóa học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-foreground">
                  Nhập môn Trí tuệ nhân tạo
                </span>
                <span className="tabular-nums text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-foreground">
                  Cấu trúc dữ liệu & Giải thuật
                </span>
                <span className="tabular-nums text-muted-foreground">40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-foreground">
                  Lập trình Web Frontend
                </span>
                <span className="tabular-nums text-muted-foreground">90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gợi ý học tập từ AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-primary/20 bg-primary/5">
              <AlertTitle>Ôn tập Cấu trúc dữ liệu</AlertTitle>
              <AlertDescription>
                Bạn có điểm số khá thấp ở phần Cây nhị phân. Hãy xem lại tài
                liệu và làm thêm 2 bài quiz nhé.
              </AlertDescription>
            </Alert>
            <Alert className="border-emerald-500/20 bg-emerald-500/5">
              <AlertTitle>Tiếp tục phát huy!</AlertTitle>
              <AlertDescription>
                Bạn đã duy trì chuỗi học tập 5 ngày liên tiếp. Hôm nay hãy đọc
                thêm 1 chương tài liệu mới.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Award, Target, Zap, BookOpen } from "lucide-react"

const MOCK_ACTIVITY_DATA = [
  { name: "T2", hours: 2 },
  { name: "T3", hours: 3.5 },
  { name: "T4", hours: 1 },
  { name: "T5", hours: 4 },
  { name: "T6", hours: 2.5 },
  { name: "T7", hours: 5 },
  { name: "CN", hours: 3 },
]

const MOCK_SCORE_DATA = [
  { name: "Tuần 1", score: 65 },
  { name: "Tuần 2", score: 70 },
  { name: "Tuần 3", score: 85 },
  { name: "Tuần 4", score: 82 },
  { name: "Tuần 5", score: 90 },
]

const statCards = [
  {
    title: "Mục tiêu tuần",
    value: "85%",
    icon: Target,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    title: "Ngày học liên tiếp",
    value: "5",
    icon: Zap,
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Huy hiệu đạt được",
    value: "12",
    icon: Award,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Giờ học tổng cộng",
    value: "45",
    icon: BookOpen,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
]

export function Progress() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Theo dõi tiến độ
        </h1>
        <p className="mt-1 text-muted-foreground">
          Thống kê chi tiết về quá trình học tập của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className={`mb-4 flex size-12 items-center justify-center rounded-full ${s.iconClass}`}
              >
                <s.icon className="size-6" />
              </div>
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thời gian học tập (tuần này)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_ACTIVITY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Điểm trung bình Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_SCORE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: "var(--chart-2)",
                      strokeWidth: 2,
                      stroke: "var(--background)",
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

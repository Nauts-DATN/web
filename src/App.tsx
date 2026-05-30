/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { AuthLayout } from "@/layouts/AuthLayout"
import { MainLayout } from "@/layouts/MainLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
import { VerifyEmail } from "@/pages/VerifyEmail"
import { Dashboard } from "@/pages/Dashboard"
import { Documents } from "@/pages/Documents"
import { DocumentDetail } from "@/pages/DocumentDetail"
import { Notes } from "@/pages/Notes"
import { QuizList } from "@/pages/QuizList"
import { QuizTake } from "@/pages/QuizTake"
import { Progress } from "@/pages/Progress"
import { Profile } from "@/pages/Profile"
import { Roadmaps } from "@/pages/Roadmaps"
import { RoadmapDetail } from "@/pages/RoadmapDetail"
import { AdminDashboard } from "@/pages/AdminDashboard"
import { AdminUsers } from "@/pages/AdminUsers"
import { AdminCategories } from "@/pages/AdminCategories"
import { Toaster } from "@/components/ui/sonner"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Library } from "./pages/Library"

export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/library" element={<Library />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/quiz" element={<QuizList />} />
              <Route path="/quiz/:id" element={<QuizTake />} />
              <Route path="/roadmaps" element={<Roadmaps />} />
              <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
              {/* <Route path="/progress" element={<Progress />} /> */}
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
      <TanStackDevtools />
    </>
  )
}

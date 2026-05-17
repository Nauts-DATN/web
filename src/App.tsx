/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { AuthLayout } from "@/layouts/AuthLayout"
import { MainLayout } from "@/layouts/MainLayout"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
import { Dashboard } from "@/pages/Dashboard"
import { Documents } from "@/pages/Documents"
import { DocumentDetail } from "@/pages/DocumentDetail"
import { Notes } from "@/pages/Notes"
import {CommunityDocDetail} from "@/pages/CommunityDocDetail"
import { QuizList } from "@/pages/QuizList"
import { QuizTake } from "@/pages/QuizTake"
import { Progress } from "@/pages/Progress"
import { Profile } from "@/pages/Profile"
import { CommunityDocuments } from "@/pages/CommunityDocuments"
import { Toaster } from "@/components/ui/sonner"
import { TanStackDevtools } from "@tanstack/react-devtools"

export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/community-documents" element={<CommunityDocuments />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/community-documents/:id" element={<CommunityDocDetail/>} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/quiz" element={<QuizList />} />
              <Route path="/quiz/:id" element={<QuizTake />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
      <TanStackDevtools />
    </>
  )
}

import { Navigate, Route, Routes,useParams } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import RequireAuth from './components/auth/RequireAuth'

import Home from './pages/Home'
import CoursesList from './pages/public/CoursesList'
import CoursePublic from './pages/public/CoursePublic'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Enrollments from './pages/auth/me/Enrollments'
import Player from './pages/auth/me/Player'
import Membership from './pages/auth/me/Membership'

import NewCourse from './pages/instructor/NewCourse'
import EditCourse from './pages/instructor/EditCourse'
import MyCoursesPage from '@/pages/instructor/MyCoursesPage';
import CourseUpsertPage from '@/pages/instructor/CourseUpsertPage';
import CourseEditorSingleForm from './pages/instructor/CourseEditorSingleForm'

import Teach from './pages/teach/Teach'
import ApplicationStatus from './pages/teach/ApplicationStatus'
import InstructorApplicationsList from './pages/admin/InstructorApplicationsList';
import InstructorApplicationDetail from './pages/admin/InstructorApplicationDetail';

import PlansPage from '@/pages/billing/PlansPage';
import CheckoutSuccessPage from '@/pages/billing/CheckoutSuccessPage';
import CheckoutCancelPage from '@/pages/billing/CheckoutCancelPage';


import CoursePublicPage from '@/pages/CoursePublicPage';
import NewQuizCourseWithQuiz from './pages/instructor/NewQuizCourseWithQuiz'
import QuestionStudio from './pages/instructor/quizzes/QuestionStudio'
import MyQuizzesPage from './pages/instructor/quizzes/MyQuizzesPage'
import NewQuiz from '@/pages/instructor/quizzes/NewQuiz'

import PublicQuizListPage from '@/pages/quizzes/PublicQuizListPage'
import PublicQuizViewPage from '@/pages/quizzes/PublicQuizViewPage'
import QuizPlayPage from '@/pages/quizzes/QuizPlayPage'
import QuizResultPage from '@/pages/quizzes/QuizResultPage'

// App.tsx (imports)
import PublicLiveSessionsList from '@/pages/live/PublicLiveSessionsList'
import PublicLiveSessionView from '@/pages/live/PublicLiveSessionView'
import NewLiveSession from '@/pages/instructor/live/NewLiveSession'
import MyLiveSessionsPage from '@/pages/instructor/live/MyLiveSessionsPage'

import LiveCheckoutSuccessPage from '@/pages/billing/LiveCheckoutSuccessPage'
import LiveCheckoutCancelPage from '@/pages/billing/LiveCheckoutCancelPage'

import DiscussionsListPage from "@/pages/discussions/DiscussionsListPage";
import AskQuestionPage from "@/pages/discussions/AskQuestionPage";
import QuestionDetailPage from "@/pages/discussions/QuestionDetailPage";

import MyResourcesPage from './pages/instructor/MyResourcesPage'
import ResourceUpsertPage from './pages/instructor/ResourceUpsertPage'
import ResourcesList from './pages/public/ResourcesList'
import ResourcePublic from './pages/public/ResourcePublic'

import SuccessPage from './pages/billing/SuccessPage'

import ComingSoon from "./pages/ComingSoon";

import { useEffect } from 'react';
import { refreshAccessToken, getAccessToken } from '../src/lib/api';
import StripeSuccessWatcher from '@/components/StripeSuccessWatcher';

export default function App() {
  useEffect(() => {
    (async () => {
      // If we don't have a token (or want to be safe), try refreshing
      if (!getAccessToken()) {
        await refreshAccessToken(); // silently sets the token if cookie is valid
      }
    })();
  }, []);

  function QuizRootRedirect() {
    const { id } = useParams()
    return <Navigate to={`/instructor/quizzes/${id}/questions`} replace />
  }

  return (
    <>
    <StripeSuccessWatcher />
    
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-app py-6">
          <Routes>
            <Route path="/_ping" element={<div style={{padding:20,fontSize:24}}>ROUTER OK</div>} />
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesList />} />

            {/* <Route path="/courses/:slug" element={<CoursePublic />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/courses/:slug" element={<CoursePublicPage />} />
            <Route path="/billing/plans" element={<PlansPage />} />

            <Route path="/live" element={<PublicLiveSessionsList />} />
            <Route path="/live/:id" element={<PublicLiveSessionView />} />
            <Route path="/billing/live/success" element={<LiveCheckoutSuccessPage />} />
            <Route path="/billing/live/cancel" element={<LiveCheckoutCancelPage />} />

            <Route element={<RequireAuth />}>
              <Route path="/me/enrollments" element={<Enrollments />} />
              <Route path="/learn/:slug" element={<Player />} />
              <Route path="/instructor/new" element={<CourseUpsertPage />} />
              <Route path="/instructor/courses/:id" element={<CourseUpsertPage />} />
              <Route path="/teach" element={<Teach />} />
              <Route path="/me/instructor/application" element={<ApplicationStatus />} />
              <Route path="/instructor/courses" element={<MyCoursesPage />}/>
              <Route path="/admin/instructors/applications" element={<InstructorApplicationsList />}/>
              <Route path="/admin/instructors/applications/:id" element={<InstructorApplicationDetail />}/>
              <Route path="/instructor/courses/:id" element={<CourseEditorSingleForm />} />
              <Route path="/instructor/courses/:id/edit" element={<CourseEditorSingleForm />} />
              <Route path="/instructor/quizzes" element={<MyQuizzesPage />} />
              <Route path="/instructor/quizzes/new" element={<NewQuiz />} />
              <Route path="/instructor/quizzes/:id" element={<QuizRootRedirect />} />
              <Route path="/instructor/quizzes/:id/questions" element={<QuestionStudio />} />

              <Route path="/quizzes" element={<PublicQuizListPage />} />
              <Route path="/quizzes/:slug" element={<PublicQuizViewPage />} />
              <Route path="/quizzes/:slug/play" element={<QuizPlayPage />} />
              <Route path="/quizzes/attempts/:attemptId" element={<QuizResultPage />} />

              <Route path="/instructor/live" element={<MyLiveSessionsPage />} />
              <Route path="/instructor/live/new" element={<NewLiveSession />} />


              <Route path="/billing/success" element={<SuccessPage />} />
              <Route path="/billing/cancel" element={<CheckoutCancelPage />} />

              <Route path="/mocks" element={<ComingSoon title="Mocks" />} />
              <Route path="/live-sessions" element={<ComingSoon title="Live Sessions" />} />

              <Route path="/discussions" element={<DiscussionsListPage />} />
              <Route path="/discussions/ask" element={<AskQuestionPage />} />
              <Route path="/discussions/:id" element={<QuestionDetailPage />} />

              <Route path="/instructor/resources" element={<MyResourcesPage />} />
              <Route path="/instructor/resources/new" element={<ResourceUpsertPage />} />
              <Route path="/instructor/resources/:id" element={<ResourceUpsertPage />} />

              <Route path="/resources" element={<ResourcesList />} />
              <Route path="/resources/:slug" element={<ResourcePublic />} />


            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Footer />  
    </div>
    </>
  )
}
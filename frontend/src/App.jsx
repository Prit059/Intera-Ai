import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {AdAptitude,AdAptitudeDashboard,AdAptitudeDetails,AdDashboard,AdMainPage,AdQA,AdQCard,AdQuiz,AdQuizDashboard,AdQuizDetails,AptitudeAttemptPage,AptitudeResultsPage,CreateSessionForm,DarkModeProvider,Dashboard,DemoPage,InterviewPrep,Landingpage,Login,MainDashboard,MainQuizPage,NextGenDashboard,OAuthSuccess,PrivateRoute,QuizAttemptPage,QuizDetailsPage,QuizHistory,QuizPlayer,QuizResult,QuizResultsPage,QuizStarter,QuizTimeGuard,RequestResetPassword,ResetPassword,RoadmapDashboard,RoadmapGenerator,RoadmapView,SessionDetailPage,SignUp,UserAptitudeDashboard,UserAptitudeDetails,UserInterviewDashboard,UserProfile,UserProvider,UserQuizDashboard,AdminAptitudeDashboard,AptitudeTopicForm,AptitudePreparationHome,AptitudePreparation,TopicDetail,MockinterviewHome,InteraLoader,TeacherRegistrationSuccess,TeacherChangePassword,RequirePasswordChange,PendingTeachers,CreateTeacherAptitude,TeacherDashboard,TestDetails,TestStatistics,TeacherAptitudeAttemptPage,TeacherAptitudeResultsPage,TeacherAptitudeDetails,EditTeacherAptitude,CategoryAptitudeList,FormulaSheetsAdmin } from './utils/Import'
import {AptitudeProvider} from "./context/AptitudeContext"
import SmoothScroll from './components/SmoothScroll';
import FormulaSheetView from './pages/UserSide/FormulaSheetView';
import FormulaSheetsList from './pages/UserSide/FormulaSheetsList';
import CreateFormulaSheet from './Admin/CreateFormulaSheet';
import VerifyEmail from './pages/Auth/VerifyEmail';
import VerifyEmailPending from './pages/Auth/VerifyEmailPending';
import FridayContestDashboard from './Admin/FridayContestDashboard';
import EditableRoadmapView from './pages/Roadmap/EditableRoadmapView';

// Import AI Interview Proctor Components (renamed to avoid conflict)
import LandingPageInterview from './components/LandingPageInterview';  // Renamed component
import InterviewSession from './components/InterviewSession';
import ResultsDashboard from './components/ResultsDashboard';
import Navbar from './components/layouts/Navbar';

function App() {
  const [loading, setLoading] = useState(true);
  
  // AI Interview Proctor State Management
  const [interviewStage, setInterviewStage] = useState(null); // 'interview', 'results'
  const [sessionId, setSessionId] = useState(null);
  const [resumeText, setResumeText] = useState(null);
  const [interviewResults, setInterviewResults] = useState(null);

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  // AI Interview Proctor Handlers
  const startInterview = (id, text = null) => {
    setSessionId(id);
    setResumeText(text);
    setInterviewStage('interview');
  };

  const endInterview = (data) => {
    setInterviewResults(data);
    setInterviewStage('results');
  };

  const resetInterview = () => {
    setInterviewStage(null);
    setSessionId(null);
    setResumeText(null);
    setInterviewResults(null);
  };

  // Render AI Interview Session (fullscreen without header/footer)
  if (interviewStage === 'interview') {
    return (
      <InterviewSession 
        sessionId={sessionId} 
        resumeText={resumeText} 
        onEnd={endInterview} 
      />
    );
  }

  // Render AI Results Dashboard (fullscreen)
  if (interviewStage === 'results') {
    return (
      <ResultsDashboard 
        results={interviewResults} 
        onReset={resetInterview} 
      />
    );
  }

  return (
    <>
      <SmoothScroll>
        <DarkModeProvider>
          <AptitudeProvider>
            <UserProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path='/requestresetpassword' element={<RequestResetPassword />} />
                  <Route path='/reset-password/:token' element={<ResetPassword />} />
                  <Route path="/demo-page" element={<DemoPage />} />
                  <Route path="/" element={<Landingpage />} />
                  <Route path="/oauth-success" element={<OAuthSuccess />} />
                  <Route path='/verify-email/:token' element={<VerifyEmail />}/>
                  <Route path="/teacher/registration-success" element={<TeacherRegistrationSuccess />} />
                  <Route path="/teacher/change-password" element={<TeacherChangePassword />} />

                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/aptitude/create" element={<CreateTeacherAptitude />} />
                  <Route path="/teacher/aptitude/:id" element={<TestDetails />} />
                  <Route path="/teacher/aptitude/:id/stats" element={<TestStatistics />} />
                  <Route path="/teacher/aptitude/edit/:id" element={<EditTeacherAptitude />} />

                  {/* AI Interview Proctor Route - Interview Homepage */}
                  <Route 
                    path="/interviewhomepage" 
                    element={
                      <PrivateRoute requiredRole="user">
                        <div className="min-h-screen flex flex-col">
                          <Navbar />
                          {/* <header className="bg-slate-900 border-b border-slate-700 p-4">
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                              AI Interview Proctor
                            </h1>
                          </header> */}
                          <main className="flex-grow">
                            <LandingPageInterview onStart={startInterview} />
                          </main>
                          <footer className="bg-slate-900 border-t border-slate-700 p-4 text-center text-slate-500 text-sm">
                            &copy; 2026 AI Interview Proctoring System - Built with MediaPipe & React
                          </footer>
                        </div>
                      </PrivateRoute>
                    } 
                  />

                  {/* User routes - only accessible to users with role "user" */}
                  <Route path="/interview-prep/:sessionId" element={<PrivateRoute requiredRole="user"><InterviewPrep /></PrivateRoute>} />
                  <Route path="/main-dashboard" element={<PrivateRoute requiredRole="user"><MainDashboard /></PrivateRoute>} />
                  <Route path="/dashboard" element={<PrivateRoute requiredRole="user"><Dashboard /></PrivateRoute>} />
                  <Route path="/quiz" element={<PrivateRoute requiredRole="user"><QuizStarter /></PrivateRoute>} />
                  <Route path="/quizplayer" element={<PrivateRoute requiredRole="user"><QuizPlayer /></PrivateRoute>} />
                  <Route path="/quiz-history" element={<PrivateRoute requiredRole="user"><QuizHistory /></PrivateRoute>} />
                  <Route path="/main-quiz" element={<PrivateRoute requiredRole="user"><MainQuizPage /></PrivateRoute>} />
                  <Route path="/quiz-result" element={<PrivateRoute requiredRole="user"><QuizResult /></PrivateRoute>} />
                  <Route path="/quiz-result/:quizId" element={<PrivateRoute requiredRole="user"><QuizResult /></PrivateRoute>} />
                  <Route path="/create-session" element={<PrivateRoute requiredRole="user"><CreateSessionForm /></PrivateRoute>} />
                  <Route path="/roadmapgen" element={<PrivateRoute requiredRole="user"><RoadmapGenerator /></PrivateRoute>} />
                  <Route path="/roadmap-view/:id" element={<PrivateRoute requiredRole="user"><RoadmapView /></PrivateRoute>} />
                  <Route path="/roadmap-edit/:id" element={<PrivateRoute requiredRole="user"><EditableRoadmapView /></PrivateRoute>} />
                  <Route path='/roadmapdashboard' element={<PrivateRoute requiredRole="user"><RoadmapDashboard /></PrivateRoute>}/>
                  <Route path="/userprofile" element={<PrivateRoute requiredRole="user"><UserProfile /></PrivateRoute>} />
                  <Route path="/userInterviewDashboard" element={<PrivateRoute requiredRole="user"><UserInterviewDashboard /></PrivateRoute>} />
                  <Route path='/aptitude/:id/attempt' element={<PrivateRoute requiredRole="user"><AptitudeAttemptPage /></PrivateRoute>}/>
                  <Route path="/aptitude/:id/results" element={<PrivateRoute requiredRole="user"><AptitudeResultsPage /></PrivateRoute>} />
                  <Route path="/aptitude/category/:categoryName" element={<PrivateRoute requiredRole="user"><CategoryAptitudeList /></PrivateRoute>}/>

                  <Route path="/teacher/aptitude/:id/attempt" element={<PrivateRoute requiredRole="user"> <TeacherAptitudeAttemptPage /> </PrivateRoute> } />
                  <Route path="/teacher/aptitude/:id/results" element={<PrivateRoute requiredRole="user"><TeacherAptitudeResultsPage /></PrivateRoute>} />
                  <Route path="/teacher/aptitude/:id" element={<TeacherAptitudeDetails />} />

                  <Route path="/userAptitudeDashboard" element={<PrivateRoute requiredRole="user"><UserAptitudeDashboard /></PrivateRoute>} />
                  <Route path="/aptitudesdetails/:id" element={<PrivateRoute requiredRole="user"><UserAptitudeDetails /></PrivateRoute>} />
                  <Route path="/usersession/:sessionId" element={<PrivateRoute requiredRole="user"><SessionDetailPage /></PrivateRoute>}/>
                  <Route path="/userQuizDashboard" element={<PrivateRoute requiredRole="user"><UserQuizDashboard /></PrivateRoute>} />
                  <Route path='quiz/:id' element={<PrivateRoute requiredRole="user"><QuizDetailsPage /></PrivateRoute>}/>
                  <Route path='quiz/:id/attempt' element={<PrivateRoute requiredRole="user"><QuizTimeGuard><QuizAttemptPage /></QuizTimeGuard></PrivateRoute>}/>
                  <Route path='quiz/:id/results' element={<PrivateRoute requiredRole="user"><QuizResultsPage /></PrivateRoute>}/>
                  <Route path="/nextgen" element={<PrivateRoute requiredRole="user"><NextGenDashboard /></PrivateRoute>} />
                  <Route path='/aptitudeform' element={<PrivateRoute requiredRole="user"><AptitudeTopicForm /></PrivateRoute>}/>
                  <Route path='/aptitudeprephome' element={<PrivateRoute requiredRole="user"><AptitudePreparationHome /></PrivateRoute>}/>
                  <Route path='/aptitudeprep/:slug' element={<PrivateRoute requiredRole="user"><AptitudePreparation /></PrivateRoute>}/>
                  <Route path='/aptitude/topics/:slug' element={<PrivateRoute requiredRole="user"><TopicDetail /></PrivateRoute>}/>
                  <Route path='/mockinterhome' element={<PrivateRoute requiredRole="user"><MockinterviewHome /></PrivateRoute>}/>
                  <Route path="/formulas" element={<PrivateRoute><FormulaSheetsList /></PrivateRoute>} />
                  <Route path="/formulas/:slug" element={<PrivateRoute><FormulaSheetView /></PrivateRoute>} />
                  <Route path="/verify-email-pending" element={<VerifyEmailPending />} />

                  {/* Admin routes - only accessible to users with role "admin" */}
                  <Route path="/AdDash" element={<PrivateRoute requiredRole="admin"><AdDashboard /></PrivateRoute>} />
                  <Route path="/admin/formula-sheets" element={<PrivateRoute requiredRole="admin"><FormulaSheetsAdmin /></PrivateRoute>} />
                  <Route path="/admin/formula-sheets/create" element={
                    <PrivateRoute requiredRole="admin">
                      <CreateFormulaSheet />
                    </PrivateRoute>
                  } />

                  <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdMainPage /></PrivateRoute>} >
                    <Route index element={<AdQA />} />
                    <Route path="AdQuiz" element={<AdQuiz />} />
                    <Route path="AdAptitude" element={<AdAptitude />} />
                  </Route>
                  
                  <Route path="/AdQuizDashboard" element={<PrivateRoute requiredRole="admin"><AdQuizDashboard /></PrivateRoute>} />
                  <Route path="/quizzes/:id" element={<PrivateRoute requiredRole="admin"><AdQuizDetails /></PrivateRoute>} />
                  <Route path="/session/:sessionId" element={<PrivateRoute requiredRole="admin"><AdQCard /></PrivateRoute>} />
                  <Route path="/AdAptitudeDashboard" element={<PrivateRoute requiredRole="admin"><AdAptitudeDashboard /></PrivateRoute>} />
                  <Route path="/aptitudes/:id" element={<PrivateRoute requiredRole="admin"><AdAptitudeDetails /></PrivateRoute>} />
                  <Route path='/aptitudepredash' element={<PrivateRoute requiredRole="admin"><AdminAptitudeDashboard /></PrivateRoute>}/>
                  <Route path='/admin/friday-contests' element={<PrivateRoute requiredRole="admin"><FridayContestDashboard /></PrivateRoute>}/>
                  <Route path='/admin-approve' element={<PrivateRoute requiredRole="admin"><PendingTeachers /></PrivateRoute>} />

                  {/* Catch all route */}
                  <Route path="*" element={
                    <div className="min-h-screen bg-black flex items-center justify-center">
                      <div className="text-white text-2xl">404 - Page Not Found</div>
                    </div>
                  } />
                </Routes>
              </Router>
              <Toaster 
                toastOptions={{
                  className: "",
                  style: {
                    fontSize: "13px",
                  },
                }}
              />
            </UserProvider>
          </AptitudeProvider>
        </DarkModeProvider>
      </SmoothScroll>
    </>
  );
}

export default App;
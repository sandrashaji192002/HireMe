import Register from './pages/Register/register';
import Login from './pages/Login/login';
import Dashboard from './pages/Dashboard/dashboard';
import NotFound from './pages/NotFound/not-found';
import Layout from './components/Layout/layout';
import ProtectedRoute from './components/ProtectedRoute/protected-route';
import Jobs from './pages/Jobs/jobs';
import JobDetails from './pages/JobDetails/job-details';
import Profile from './pages/Profile/profile';
import PostJob from './pages/PostJob/post-job';
import Applicants from './pages/Applicants/applicants';
import { Route, Navigate, Routes } from 'react-router-dom';
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/edit-job/:id" element={<PostJob />} />
              <Route path="/applicants/:jobId" element={<Applicants />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};
export default App;

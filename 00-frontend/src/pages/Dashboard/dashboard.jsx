import { useAuth } from '../../context/auth-context';
import StudentDashboard from '../StudentDashboard/student-dashboard';
import RecruiterDashboard from '../RecruiterDashboard/recruiter-dashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === 'student') {
    return <StudentDashboard />;
  }
  return <RecruiterDashboard />;
};
export default Dashboard;

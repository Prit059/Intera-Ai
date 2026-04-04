import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RequirePasswordChange = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // If user is teacher and needs to change password, redirect
    if (user?.role === 'teacher' && user?.mustChangePassword) {
      navigate('/teacher/change-password');
    }
  }, [user, navigate]);

  return children;
};

export default RequirePasswordChange;
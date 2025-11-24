import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard router which will route to role-appropriate dashboard
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Profile;

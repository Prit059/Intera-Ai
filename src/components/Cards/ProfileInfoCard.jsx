import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate, Link } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ProfileInfoCard = () => {
  const { user, clearUser, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { darkmode } = useDarkMode();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if we have user data in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser && !userData) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
    }
    
    // Fetch fresh user data from API
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      console.log("Profile data:", response.data);
      
      const fetchedUser = response.data.data;
      setUserData(fetchedUser);
      
      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify({
        id: fetchedUser.id,
        email: fetchedUser.email,
        firstname: fetchedUser.firstname,
        lastname: fetchedUser.lastname,
        role: fetchedUser.role,
        emailverified: fetchedUser.emailverified,
        profileImageUrl: fetchedUser.profileImageUrl
      }));
      
      // Update context if needed
      if (updateUser) {
        updateUser(fetchedUser);
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
      // Use stored user data as fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axiosInstance.post(API_PATHS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      clearUser();
      navigate("/login", { replace: true });
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getDisplayName = () => {
    if (userData.firstname && userData.lastname) {
      return `${userData.firstname}`;
    }
    if (userData.firstname) return userData.firstname;
    if (userData.name) return userData.name;
    return userData.email?.split('@')[0] || "User";
  };

  const getProfileImage = () => {
    return userData?.profileImageUrl || "/default-user.jpg";
  };

  return (
    <Link
      to="/userprofile"
      className={`flex items-center cursor-pointer hover:opacity-80 transition-opacity ${darkmode ? 'text-black' : 'text-white'}`}
    >
      <img
        src={getProfileImage()}
        alt="User"
        className="w-11 h-11 bg-gray-300 rounded-full mr-3 object-cover border-2 border-gray-400"
        onError={(e) => {
          e.target.src = "/default-user.jpg";
        }}
      />
      <div>
        <div className="text-[17px] font-bold leading-3 max-w-[120px] text-start truncate">
          {getDisplayName()}
        </div>
        <button
          className="text-orange-800 text-[14px] font-semibold cursor-pointer underline hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
          }}
        >
          LogOut
        </button>
      </div>
    </Link>
  );
};

export default ProfileInfoCard;
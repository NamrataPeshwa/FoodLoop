import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, logoutUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Try to load user data from sessionStorage if available
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Here you might want to fetch user data from the API using the token
        // fetchUserProfile(storedToken).then(data => setUser(data));
      }
    }
  }, []);

  // Initial signup - stores basic info temporarily and moves to onboarding
  const initiateSignup = async (name, email, password) => {
    try {
      // Save basic info to temporary state for onboarding
      const basicInfo = { name, email, password };
      setTempUserData(basicInfo);
      
      // Store in sessionStorage to persist across page navigation
      sessionStorage.setItem("tempUserData", JSON.stringify(basicInfo));
      
      return true;
    } catch (error) {
      console.error("Error initiating signup:", error);
      return false;
    }
  };

  // Complete signup after onboarding - sends all data to server
  const completeSignup = async (profileData, navigate) => {
    try {
      // Get the temp data from session storage
      const tempData = JSON.parse(sessionStorage.getItem("tempUserData"));
      
      if (!tempData) {
        console.error("No temporary user data found");
        return false;
      }
      
      // Combine the basic info with profile data
      const fullUserData = {
        ...tempData,
        ...profileData
      };
      
      // Send to server via API
      const response = await signupUser(
        tempData.name,
        tempData.email,
        tempData.password,
        profileData.role,
        profileData
      );
      
      if (response.success) {
        // Clear temporary data
        sessionStorage.removeItem("tempUserData");
        
        // Store role in sessionStorage
        sessionStorage.setItem("userRole", profileData.role);
        
        // Navigate to login or dashboard
        navigate("/login");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error completing signup:", error);
      return false;
    }
  };

  // Get user data during the onboarding process
  const getUserData = () => {
    try {
      return JSON.parse(sessionStorage.getItem("tempUserData"));
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    if (response.token) {
      setToken(response.token);
      localStorage.setItem("token", response.token);
      
      // Set user in state and sessionStorage
      setUser(response.user);
      localStorage.setItem("userData", JSON.stringify(response.user));
      
      // Store role in sessionStorage if available
      if (response.user && response.user.role) {
        sessionStorage.setItem("userRole", response.user.role);
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("userRole");
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    const userRole = sessionStorage.getItem("userRole");
    return userRole === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      initiateSignup,
      completeSignup,
      getUserData,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
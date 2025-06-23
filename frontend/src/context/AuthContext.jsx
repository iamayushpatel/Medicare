import { createContext, useContext, useEffect, useReducer } from "react";

// Helper to safely parse JSON from localStorage
const safeJSONParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (value && value !== "undefined") {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
  }
  return null;
};

// Initial state
const initialState = {
  user: safeJSONParse("user"),
  role: localStorage.getItem("role") || null,
  token: localStorage.getItem("token") || null,
};

// Create context
export const authContext = createContext(initialState);

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        role: null,
        token: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "LOGOUT":
      return {
        user: null,
        role: null,
        token: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.user !== undefined) {
      localStorage.setItem("user", JSON.stringify(state.user));
    }
    localStorage.setItem("token", state.token || "");
    localStorage.setItem("role", state.role || "");
  }, [state]);

  return (
    <authContext.Provider value={{ ...state, dispatch }}>
      {children}
    </authContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => useContext(authContext);

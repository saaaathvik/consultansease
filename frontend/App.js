import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EditProjectForm from "./EditProjectForm";
import AddProjectForm from "./Forms";
import ConsultancyData from "./ConsultancyData";
import Login from "./components/Login/Login.jsx";
import Signup from "./components/SignUp/SignUp.jsx";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword.jsx";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditProjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-project"
          element={
            <PrivateRoute>
              <AddProjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <ConsultancyData />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;

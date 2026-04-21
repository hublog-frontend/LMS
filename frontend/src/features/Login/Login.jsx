import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row } from "antd";
import Logo from "../../assets/logo.png";
import { FaCode } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { AiOutlineLock } from "react-icons/ai";
import { FiEyeOff, FiEye } from "react-icons/fi";
import "./styles.css";
import { MdOutlineEmail } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import { emailValidator, passwordValidator } from "../Common/Validation";
import { LoginApi, updateFirebaseToken } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { Input } from "antd";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const logoutMsg = localStorage.getItem("logoutMessage");
    if (logoutMsg) {
      CommonMessage("warning", logoutMsg);
      localStorage.removeItem("logoutMessage");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationTrigger(true);

    const emailValidate = emailValidator(email);
    const passwordValidate = passwordValidator(password);

    setEmailError(emailValidate);
    setPasswordError(passwordValidate);

    if (emailValidate || passwordValidate) return;

    setLoading(true);

    const payload = {
      email: email,
      password: password,
    };
    try {
      // 1. Primary Authentication via MySQL (Absolute source of truth)
      const response = await LoginApi(payload);
      const loginUserDetails = response?.data?.data;
      const mysqlToken = response?.data?.token;

      // Ensure deviceId exists (REQUIRED for socket connection)
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
      }

      let firebaseToken;

      try {
        // 2. Attempt Firebase Login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const firebaseUser = userCredential.user;
        firebaseToken = await firebaseUser.getIdToken();
      } catch (fbError) {
        console.warn(
          "Firebase sign-in failed, attempting provision:",
          fbError.code,
        );
        // 3. Auto-Provision if user is valid in MySQL but missing or unsynced in Firebase
        if (
          fbError.code === "auth/user-not-found" ||
          fbError.code === "auth/invalid-credential" ||
          fbError.code === "auth/invalid-login-credentials"
        ) {
          try {
            const newUser = await createUserWithEmailAndPassword(
              auth,
              email,
              password,
            );
            firebaseToken = await newUser.user.getIdToken();
            console.log("Firebase account provisioned successfully.");
          } catch (createError) {
            // If creation also fails (e.g. wrong password if user exists with different pass),
            // we throw the original error or a specialized one.
            throw fbError;
          }
        } else {
          throw fbError;
        }
      }

      // 4. Update MySQL with the latest Firebase Token for socket forceLogout
      await updateFirebaseToken({ email: email, token: firebaseToken });

      // Store tokens and metadata
      localStorage.setItem("AccessToken", mysqlToken);
      localStorage.setItem("FirebaseToken", firebaseToken);
      localStorage.setItem(
        "loginUserDetails",
        JSON.stringify(loginUserDetails),
      );

      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("login error", error);
      setLoading(false);

      let errorMsg = "Something went wrong. Try again later";
      if (error?.response?.data?.details) {
        errorMsg = error.response.data.details;
      } else if (error.message) {
        errorMsg = error.message;
      }

      CommonMessage("error", errorMsg);
    }
  };

  return (
    <div className="loginpage_main_wrapper">
      <Row className="loginpage_row">
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          className="loginpage_left_maincontainer"
        >
          <div className="loginpage_left_content">
            <div className="loginpage_logo_container">
              <img src={Logo} className="loginpage_logo" />
              <div className="ai-glass-badge">
                <BsStars />
                <span>AI Powered</span>
              </div>
            </div>
            <h1 className="loginpage_title">
              <span style={{ color: "#ffde59" }}>Gamify</span> Learning,
            </h1>
            <h1 className="loginpage_title" style={{ marginTop: "12px" }}>
              <span style={{ color: "#ffde59" }}>Simplify </span> Employment
            </h1>

            <div className="loginpage_cards_container">
              <div className="loginpage_cards">
                <div className="loginpage_cards_icon_container">
                  <FaCode size={24} />
                </div>
                <h1 className="loginpage_cards_heading">Learn Through Play</h1>
                <p className="loginpage_cards_description">
                  Master coding with interactive challenges and rewards
                </p>
              </div>

              <div className="loginpage_cards">
                <div className="loginpage_cards_icon_container">
                  <GrNotes size={24} />
                </div>
                <h1 className="loginpage_cards_heading">Direct Placement</h1>
                <p className="loginpage_cards_description">
                  Get placed in top tech companies
                </p>
              </div>
            </div>
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          className="loginpage_right_maincontainer"
        >
          <div className="loginpage_right_content">
            <p className="loginpage_login_heading">Login</p>
            <p className="loginpage_description">
              Enter your email and password to continue your journey with Acte
              Technologies
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginTop: "30px", position: "relative" }}>
                <Input
                  label="Email"
                  className="loginpage_input_field"
                  placeholder="Enter your email address"
                  prefix={<MdOutlineEmail size={23} color="#9da4b0" />}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationTrigger) {
                      setEmailError(emailValidator(e.target.value));
                    }
                  }}
                  value={email}
                />

                {emailError && (
                  <div className="loginpage_inputfield_error_container">
                    <p>Email {emailError}</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "30px", position: "relative" }}>
                <Input.Password
                  label="Password"
                  placeholder="Enter your password"
                  className="loginpage_input_field"
                  iconRender={() => null}
                  prefix={<AiOutlineLock size={23} color="#9da4b0" />}
                  visibilityToggle={{
                    visible: showPassword,
                    onVisibleChange: setShowPassword,
                  }}
                  suffix={
                    <>
                      {showPassword ? (
                        <FiEye
                          size={18}
                          color="gray"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      ) : (
                        <FiEyeOff
                          size={18}
                          color="gray"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      )}
                    </>
                  }
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationTrigger) {
                      setPasswordError(passwordValidator(e.target.value));
                    }
                  }}
                  value={password}
                />

                {passwordError && (
                  <div className="loginpage_inputfield_error_container">
                    <p>Password {passwordError}</p>
                  </div>
                )}
              </div>

              <div className="loginpage_forgotpassword_container">
                <p
                  className="loginpage_forgotpassword"
                  onClick={() => navigate("/forgot-password")}
                  style={{ cursor: "pointer" }}
                >
                  Forgot Password?
                </p>
              </div>

              {loading ? (
                <button
                  className="loginpage_loading_submitbutton"
                  type="button"
                >
                  <CommonSpinner />
                </button>
              ) : (
                <button className="loginpage_submitbutton" type="submit">
                  Continue
                </button>
              )}
            </form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

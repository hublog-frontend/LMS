import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row, Input, Space } from "antd";
import Logo from "../../assets/logo.png";
import { FaCode } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { AiOutlineLock, AiOutlineArrowLeft } from "react-icons/ai";
import { FiEyeOff, FiEye, FiMail, FiCheckCircle } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import "./styles.css";
import {
  emailValidator,
  passwordValidator,
  otpValidator,
} from "../Common/Validation";
import { forgotPassword, verifyOTP, resetPassword } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setValidationTrigger(true);

    const emailValidate = emailValidator(email);
    setEmailError(emailValidate);

    if (emailValidate) return;

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      CommonMessage("success", response?.data?.message || "OTP sent to your email");
      setStep(2);
      setValidationTrigger(false);
      setResendTimer(60);
    } catch (error) {
      CommonMessage("error", error?.response?.data?.details || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setValidationTrigger(true);

    const otpValidate = otpValidator(otp);
    setOtpError(otpValidate);

    if (otpValidate) return;

    setLoading(true);
    try {
      const response = await verifyOTP({ email, otp });
      CommonMessage("success", response?.data?.message || "OTP Verified Successfully");
      setStep(3);
      setValidationTrigger(false);
    } catch (error) {
      CommonMessage("error", error?.response?.data?.details || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setValidationTrigger(true);

    const passwordValidate = passwordValidator(newPassword);
    setNewPasswordError(passwordValidate);

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    } else {
      setConfirmPasswordError("");
    }

    if (passwordValidate) return;

    setLoading(true);
    try {
      const response = await resetPassword({ email, otp, password: newPassword });
      CommonMessage("success", response?.data?.message || "Password updated successfully");
      setStep(4);
    } catch (error) {
      CommonMessage("error", error?.response?.data?.details || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="loginpage_right_content">
            <button className="forgot-shared-btn" onClick={() => navigate("/login")}>
              <AiOutlineArrowLeft /> Back to Login
            </button>
            <p className="loginpage_login_heading">Forgot Password</p>
            <p className="loginpage_description">
              No worries! Enter your email and we'll send you an OTP to reset your password.
            </p>

            <form onSubmit={handleSendEmail} style={{ marginTop: "30px" }}>
              <div style={{ position: "relative" }}>
                <Input
                  className="loginpage_input_field"
                  placeholder="Enter your email address"
                  prefix={<MdOutlineEmail size={23} color="#9da4b0" />}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationTrigger) setEmailError(emailValidator(e.target.value));
                  }}
                  value={email}
                />
                {emailError && (
                  <div className="loginpage_inputfield_error_container">
                    <p>Email {emailError}</p>
                  </div>
                )}
              </div>

              {loading ? (
                <button type="button" className="loginpage_loading_submitbutton" style={{ marginTop: "30px" }}>
                  <CommonSpinner />
                </button>
              ) : (
                <button type="submit" className="loginpage_submitbutton" style={{ marginTop: "30px" }}>
                  Send OTP
                </button>
              )}
            </form>
          </div>
        );
      case 2:
        return (
          <div className="loginpage_right_content">
             <button className="forgot-shared-btn" onClick={() => setStep(1)}>
              <AiOutlineArrowLeft /> Use a different email
            </button>
            <p className="loginpage_login_heading">Verify OTP</p>
            <p className="loginpage_description">
              We've sent a 6-digit verification code to <span style={{ fontWeight: 600 }}>{email}</span>.
            </p>

            <form onSubmit={handleVerifyOTP} style={{ marginTop: "30px" }}>
              <div style={{ position: "relative" }}>
                <Input
                  className="loginpage_input_field"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (validationTrigger) setOtpError(otpValidator(e.target.value));
                  }}
                  value={otp}
                />
                {otpError && (
                  <div className="loginpage_inputfield_error_container">
                    <p>OTP {otpError}</p>
                  </div>
                )}
              </div>

              {loading ? (
                <button type="button" className="loginpage_loading_submitbutton" style={{ marginTop: "30px" }}>
                  <CommonSpinner />
                </button>
              ) : (
                <button type="submit" className="loginpage_submitbutton" style={{ marginTop: "30px" }}>
                  Verify OTP
                </button>
              )}
              
              <p className="resend-text">
                Didn't receive code?{" "}
                {resendTimer > 0 ? (
                  <span style={{ color: "#9da4b0", fontWeight: 500 }}>
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <span className="resend-link" onClick={handleSendEmail}>
                    Resend
                  </span>
                )}
              </p>
            </form>
          </div>
        );
      case 3:
        return (
          <div className="loginpage_right_content">
            <p className="loginpage_login_heading">Reset Password</p>
            <p className="loginpage_description">
              Create a strong new password to secure your account.
            </p>

            <form onSubmit={handleResetPassword} style={{ marginTop: "30px" }}>
              <div style={{ position: "relative" }}>
                <Input.Password
                  placeholder="Enter new password"
                  className="loginpage_input_field"
                  iconRender={() => null}
                  prefix={<AiOutlineLock size={23} color="#9da4b0" />}
                  visibilityToggle={{
                    visible: showPassword,
                    onVisibleChange: setShowPassword,
                  }}
                  suffix={
                    showPassword ? (
                      <FiEye
                        size={18}
                        color="gray"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <FiEyeOff
                        size={18}
                        color="gray"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (validationTrigger) setNewPasswordError(passwordValidator(e.target.value));
                  }}
                  value={newPassword}
                />
                {newPasswordError && (
                  <div className="loginpage_inputfield_error_container">
                    <p>Password {newPasswordError}</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "30px", position: "relative" }}>
                <Input.Password
                  placeholder="Confirm new password"
                  className="loginpage_input_field"
                  iconRender={() => null}
                  prefix={<AiOutlineLock size={23} color="#9da4b0" />}
                  visibilityToggle={false}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationTrigger && e.target.value !== newPassword) setConfirmPasswordError("Passwords do not match");
                    else setConfirmPasswordError("");
                  }}
                  value={confirmPassword}
                />
                {confirmPasswordError && (
                  <div className="loginpage_inputfield_error_container">
                    <p>{confirmPasswordError}</p>
                  </div>
                )}
              </div>

              {loading ? (
                <button type="button" className="loginpage_loading_submitbutton" style={{ marginTop: "30px" }}>
                  <CommonSpinner />
                </button>
              ) : (
                <button type="submit" className="loginpage_submitbutton" style={{ marginTop: "30px" }}>
                  Update Password
                </button>
              )}
            </form>
          </div>
        );
      case 4:
        return (
          <div className="loginpage_right_content" style={{ textAlign: "center" }}>
            <div className="success-icon-container">
              <FiCheckCircle size={80} />
            </div>
            <h2 className="success-heading">Password Reset!</h2>
            <p className="success-description">
              Your password has been successfully updated. You can now login with your new credentials.
            </p>
            <button 
              className="loginpage_submitbutton" 
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="loginpage_main_wrapper">
      <Row className="loginpage_row">
        <Col xs={24} sm={24} md={24} lg={12} className="loginpage_left_maincontainer">
          <div className="loginpage_left_content">
            <div className="loginpage_logo_container">
              <img src={Logo} className="loginpage_logo" alt="Acte Logo" />
              <div className="ai-glass-badge">
                <BsStars />
                <span>AI Powered</span>
              </div>
            </div>
            <h1 className="loginpage_title">
              <span style={{ color: "#ffde59" }}>Secure</span> Access
            </h1>
            <h1 className="loginpage_title" style={{ marginTop: "12px" }}>
              <span style={{ color: "#ffde59" }}>Protect </span> Your Future
            </h1>

            <div className="loginpage_cards_container">
              <div className="loginpage_cards">
                <div className="loginpage_cards_icon_container">
                  <FiCheckCircle size={24} color="#ffde59" />
                </div>
                <h1 className="loginpage_cards_heading">Safe & Secure</h1>
                <p className="loginpage_cards_description">
                  Advanced encryption to keep your data protected
                </p>
              </div>

              <div className="loginpage_cards">
                <div className="loginpage_cards_icon_container">
                  <AiOutlineLock size={24} color="#ffde59" />
                </div>
                <h1 className="loginpage_cards_heading">Quick Reset</h1>
                <p className="loginpage_cards_description">
                  Get back to learning in just a few minutes
                </p>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} className="loginpage_right_maincontainer">
          {renderStep()}
        </Col>
      </Row>
    </div>
  );
}

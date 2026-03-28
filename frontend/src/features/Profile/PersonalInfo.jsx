import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Upload,
  Button,
  Modal,
  Pagination,
  ConfigProvider,
} from "antd";
import { LuCloudUpload } from "react-icons/lu";
import { FaUserLarge } from "react-icons/fa6";
import {
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import { AiOutlineEnter } from "react-icons/ai";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonAntdMultiSelect from "../Common/CommonAntMultiSelect";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlinePhone } from "react-icons/ai";
import { FiGithub } from "react-icons/fi";
import { SlSocialLinkedin } from "react-icons/sl";
import { FaInstagram } from "react-icons/fa";
import {
  addressValidator,
  emailValidator,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import { pdfjs, Document, Page } from "react-pdf";
import mammoth from "mammoth";
import { updateProfile } from "../ApiService/action";
import { skillsOptions, stateList } from "../Common/CommonArrays";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSpinner from "../Common/CommonSpinner";

// Use CDN worker for maximum compatibility across environments
const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

const { Dragger } = Upload;

export default function PersonalInfo({ userFulldetails }) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
  ];
  const [gender, setGender] = useState("");
  const [genderError, setGenderError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [parentMobileError, setParentMobileError] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [linkedinLinkError, setLinkedinLinkError] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [instagramLinkError, setInstagramLinkError] = useState("");
  const [currentStateId, setCurrentStateId] = useState("");
  const [currentStateIdError, setCurrentStateIdError] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentCityError, setCurrentCityError] = useState("");
  const [nativeStateId, setNativeStateId] = useState("");
  const [nativeStateIdError, setNativeStateIdError] = useState("");
  const [nativeCity, setNativeCity] = useState("");
  const [nativeCityError, setNativeCityError] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [gapsInAcademicsId, setGapsInAcademicsId] = useState(null);
  const [enrolledIn, setEnrolledIn] = useState("");
  const [relocation, setRelocation] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [service, setService] = useState("");
  const [placed, setPlaced] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const stateOptions = [{ id: 1, name: "Tamil Nadu" }];
  const yesOrNoOptions = [
    { id: "Yes", name: "Yes" },
    { id: "No", name: "No" },
  ];

  const [skills, setSkills] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [resume, setResume] = useState("");
  const [resumeArray, setResumeArray] = useState([]);
  const [resumeError, setResumeError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);
  // resume preview
  const [uploadedResume, setUploadedResume] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [resumeWarningModal, setResumeWarningModal] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [docxHtml, setDocxHtml] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (uploadedResume instanceof File) {
      const url = URL.createObjectURL(uploadedResume);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof uploadedResume === "string") {
      setPreviewUrl(uploadedResume);
    } else {
      setPreviewUrl(null);
    }
  }, [uploadedResume]);

  useEffect(() => {
    setPageNumber(1);
    setNumPages(null);
    //userFulldetails?.guardian_phone||""
    setProfileImage(userFulldetails?.profile_image || "");
    setName(userFulldetails?.user_name || "");
    setGender(userFulldetails?.gender || "");
    setEmail(userFulldetails?.email || "");
    setMobile(userFulldetails?.phone || "");
    setWhatsapp(userFulldetails?.whatsapp_number || "");
    setDateOfBirth(userFulldetails?.dob || null);
    setParentMobile(userFulldetails?.guardian_phone || "");
    setLinkedinLink(userFulldetails?.linked_in || "");
    setInstagramLink(userFulldetails?.instagram || "");
    setCurrentStateId(userFulldetails?.current_state || "");
    setCurrentCity(userFulldetails?.current_city || "");
    setNativeStateId(userFulldetails?.native_state || "");
    setNativeCity(userFulldetails?.native_city || "");
    setAddress(userFulldetails?.permanent_address || "");
    setPincode(userFulldetails?.pincode || "");
    setGapsInAcademicsId(
      userFulldetails?.academic_gap == 1 ? "Yes" : "No" || "",
    );
    setEnrolledIn(userFulldetails?.academic_gap == 1 ? "Yes" : "No" || "");
    setRelocation(
      userFulldetails?.ready_for_relocate == 1 ? "Yes" : "No" || "",
    );
    setGithubLink(userFulldetails?.github_link || "");
    setPortfolioLink(userFulldetails?.portfolio_link || "");
    setPortfolioTitle(userFulldetails?.portfolio_title || "");
    setSummary(userFulldetails?.summary || "");
    setSkills(userFulldetails?.skills || []);
    setHobbies(userFulldetails?.hobbies || []);
    setLanguages(userFulldetails?.languages || []);
    setService(userFulldetails?.service_agreement == 1 ? "Yes" : "No" || "");
    setPlaced(userFulldetails?.placed == 1 ? "Yes" : "No" || "");

    if (userFulldetails?.resume) {
      setResumeError("");
      const base64String = userFulldetails.resume;
      setResume(base64String);

      // Detect file type from base64 signature
      let mimeType = "application/octet-stream";
      let extension = "bin";

      if (base64String.startsWith("JVBERi")) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (base64String.startsWith("UEsDB")) {
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
      }

      // Convert Base64 to Blob/File for preview
      try {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const file = new File([blob], `Resume.${extension}`, {
          type: mimeType,
        });

        setResumeArray([file]);
        setUploadedResume(file);

        if (extension === "docx") {
          extractHtmlFromDocx(file).then((html) => setDocxHtml(html));
        } else {
          setDocxHtml(null);
        }
      } catch (e) {
        console.error("Error converting base64 resume:", e);
        setResumeArray([]);
        setUploadedResume(null);
      }
    } else {
      setResumeArray([]);
      setResume("");
      setUploadedResume(null);
    }
  }, [userFulldetails]);

  //resume function
  const reportError = (err) => {
    onErrorChange?.(err);
  };

  const handleResumeAttachment = async ({ file }) => {
    console.log("fileee", file);
    const realFile = file.originFileObj || file;
    const isPDF = file.type === "application/pdf";
    const isDOCX = file.name.endsWith(".docx");
    const isValidSize = file.size <= 1 * 1024 * 1024; // 1MB in bytes

    if (file.status === "uploading" || file.status === "removed") {
      setResume("");
      setResumeArray([]);
      setNumPages(null);
      setPageNumber(1);
      return;
    }
    if (isPDF) {
      setNumPages(null);
      setPageNumber(1);
      if (isValidSize) {
        console.log("fileeeee", file);
        setResumeArray([file]);
        let text = "";

        try {
          if (isPDF) {
            text = await extractTextFromPDF(realFile);
          }
        } catch (error) {
          console.error("Error extracting text:", error);
          CommonMessage("error", "Failed to read file content");
          setResume("");
          setResumeArray([]);
          setUploadedResume(null);
          return;
        }

        const keywordResult = checkKeyword(text);
        console.log("keywordResult", keywordResult);
        if (keywordResult === false) {
          setResumeWarningModal(true);
          setResume("");
          setResumeArray([]);
          return;
        }
        setUploadedResume(realFile);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setResume(reader.result); // Store in state
          setResumeError(selectValidator(reader.result));
        };
        setDocxHtml(null);
        CommonMessage("success", "Resume uploaded");
      } else {
        CommonMessage("error", "File size must be 1MB or less");
        setResume("");
        setResumeArray([]);
        setUploadedResume(null);
        setResumeError(" is required");
      }
    } else if (isDOCX) {
      setNumPages(null);
      setPageNumber(1);
      if (isValidSize) {
        console.log("fileeeee", file);
        setResumeArray([file]);
        let text = "";

        try {
          text = await extractTextFromDocx(realFile);
        } catch (error) {
          console.error("Error extracting text:", error);
          CommonMessage("error", "Failed to read file content");
          setResume("");
          setResumeArray([]);
          setUploadedResume(null);
          return;
        }

        const keywordResult = checkKeyword(text);
        console.log("keywordResult", keywordResult);
        if (keywordResult === false) {
          setResumeWarningModal(true);
          setResume("");
          setResumeArray([]);
          return;
        }
        setUploadedResume(realFile);

        try {
          const html = await extractHtmlFromDocx(realFile);
          setDocxHtml(html);
        } catch (error) {
          console.error("Error generating DOCX preview:", error);
          setDocxHtml(null);
        }

        CommonMessage("success", "Resume uploaded");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setResume(reader.result); // Store in state
          setResumeError(selectValidator(reader.result));
        };
      } else {
        CommonMessage("error", "File size must be 1MB or less");
        setResume("");
        setResumeArray([]);
        setUploadedResume(null);
        setResumeError(" is required");
      }
    } else {
      CommonMessage("error", "Only .pdf and .docx files are accepted");
      setResume("");
      setResumeError(" is required");
      setResumeArray([]);
      setUploadedResume(null);
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjs.getDocument({
      data: arrayBuffer,
      workerSrc: PDF_WORKER_URL,
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((s) => s.str).join(" ");
    }

    return text;
  };

  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractHtmlFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  };

  const checkKeyword = (text) => {
    const keyword = "acte technologies";
    const normalizedText = text
      .toLowerCase()
      .replace(/\u2013|\u2014|\u2012|\u2011|\u00A0/g, " ") // Replace en dash, em dash, figure dash, non-breaking space with space
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();

    return normalizedText.includes(keyword);
  };
  const handleProfileImageUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      CommonMessage("error", "You can only upload JPG/PNG file!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      CommonMessage("error", "Image must smaller than 5MB!");
      return false;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setProfileImage(reader.result);
    };
    return false;
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);
    const nameValidate = nameValidator(name);
    const genderValidate = selectValidator(gender);
    const emailValidate = emailValidator(email);
    const mobileValidate = mobileValidator(mobile);
    const whatsappValidate = mobileValidator(whatsapp);
    const dateOfBirthValidate = selectValidator(dateOfBirth);
    const parentMobileValidate = mobileValidator(parentMobile);
    const linkedinLinkValidate = addressValidator(linkedinLink);
    const instagramLinkValidate = addressValidator(instagramLink);
    const currentStateIdValidate = selectValidator(currentStateId);
    const currentCityValidate = addressValidator(currentCity);
    const nativeStateIdValidate = selectValidator(nativeStateId);
    const nativeCityValidate = addressValidator(nativeCity);
    const addressValidate = addressValidator(address);
    const pincodeValidate = addressValidator(pincode);
    const skillsValidate = selectValidator(skills);
    const resumeValidate = selectValidator(resume);

    setNameError(nameValidate);
    setGenderError(genderValidate);
    setEmailError(emailValidate);
    setMobileError(mobileValidate);
    setWhatsappError(whatsappValidate);
    setDateOfBirthError(dateOfBirthValidate);
    setParentMobileError(parentMobileValidate);
    setLinkedinLinkError(linkedinLinkValidate);
    setInstagramLinkError(instagramLinkValidate);
    setCurrentStateIdError(currentStateIdValidate);
    setCurrentCityError(currentCityValidate);
    setNativeStateIdError(nativeStateIdValidate);
    setNativeCityError(nativeCityValidate);
    setAddressError(addressValidate);
    setPincodeError(pincodeValidate);
    setSkillsError(skillsValidate);
    setResumeError(resumeValidate);

    const topSectionErrors = [
      nameValidate,
      genderValidate,
      emailValidate,
      mobileValidate,
      whatsappValidate,
      dateOfBirthValidate,
      parentMobileValidate,
      linkedinLinkValidate,
      instagramLinkValidate,
      currentStateIdValidate,
    ];

    const addressSectionErrors = [
      currentCityValidate,
      nativeStateIdValidate,
      nativeCityValidate,
      addressValidate,
      pincodeValidate,
    ];

    const hasTopErrors = topSectionErrors.some(Boolean);
    const hasAddressErrors = addressSectionErrors.some(Boolean);
    const hasAnyErrors = [
      ...topSectionErrors,
      ...addressSectionErrors,
      skillsValidate,
      resumeValidate,
    ].some(Boolean);

    if (hasTopErrors) {
      document
        .getElementById("profilepage_personalinfo_profileupload_container")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (hasAddressErrors) {
      document
        .getElementById("profilepage_currentcity_col_div")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (hasAnyErrors) return;

    setButtonLoading(true);

    const payload = {
      user_id: converAsJson?.id,
      user_name: name,
      email: email,
      password: converAsJson?.password,
      phone_code: "+91",
      phone: mobile,
      whatsapp_code: "+91",
      whatsapp_number: whatsapp,
      guardian_phone_code: "+91",
      guardian_phone: parentMobile,
      gender: gender,
      dob: dateOfBirth,
      linked_in: linkedinLink,
      instagram: instagramLink,
      current_state: currentStateId,
      current_city: currentCity,
      native_state: nativeStateId,
      native_city: nativeCity,
      permanent_address: address,
      pincode: pincode,
      academic_gap: gapsInAcademicsId == "Yes" ? 1 : 0,
      enrolled_mode: enrolledIn == "Yes" ? 1 : 0,
      ready_for_relocate: relocation == "Yes" ? 1 : 0,
      github_link: githubLink,
      portfolio_link: portfolioLink,
      portfolio_title: portfolioTitle,
      summary: summary,
      skills: skills,
      hobbies: hobbies,
      languages: languages,
      service_agreement: service == "Yes" ? 1 : 0,
      placed: placed == "Yes" ? 1 : 0,
      profile_image: profileImage,
      resume: resume,
    };

    try {
      const response = await updateProfile(payload);
      setTimeout(() => {
        CommonMessage("success", "Profile Updated");
        setButtonLoading(false);
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  return (
    <div className="profilepage_personalinfo_main_container">
      <div
        className="profilepage_personalinfo_profileupload_container"
        id="profilepage_personalinfo_profileupload_container"
      >
        <div
          className="profilepage_personalinfo_profileimage_container"
          style={profileImage ? { padding: 0, overflow: "hidden" } : {}}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <FaUserLarge size={23} />
          )}
        </div>

        <div style={{ width: "100%" }}>
          <Dragger
            className="profilepage_personalinfo_dragger"
            accept=".jpg,.jpeg,.png"
            showUploadList={false}
            beforeUpload={handleProfileImageUpload}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <div className="profilepage_personalinfo_dragger_icon_container">
                <LuCloudUpload size={21} />
              </div>
            </div>
            <p className="ant-upload-text">Upload your profile image</p>
            <p className="ant-upload-hint">PNG or JPG (max. 5MB)</p>
          </Dragger>
        </div>
      </div>

      <Row gutter={16} style={{ marginTop: "30px" }}>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Name"
            onChange={(e) => {
              setName(e.target.value);
              if (validationTrigger) {
                setNameError(nameValidator(e.target.value));
              }
            }}
            value={name}
            error={nameError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={true}
            options={genderOptions}
            label="Gender"
            onChange={(e) => {
              setGender(e.target.value);
              if (validationTrigger) {
                setGenderError(selectValidator(e.target.value));
              }
            }}
            value={gender}
            error={genderError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Email"
            prefix={<MdOutlineEmail size={18} color="gray" />}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationTrigger) {
                setEmailError(emailValidator(e.target.value));
              }
            }}
            value={email}
            error={emailError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Mobile"
            prefix={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "gray",
                }}
              >
                <AiOutlinePhone size={18} color="gray" /> +91
              </span>
            }
            onChange={(e) => {
              setMobile(e.target.value);
              if (validationTrigger) {
                setMobileError(mobileValidator(e.target.value));
              }
            }}
            value={mobile}
            error={mobileError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Whatsapp"
            prefix={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "gray",
                }}
              >
                <AiOutlinePhone size={18} color="gray" /> +91
              </span>
            }
            onChange={(e) => {
              setWhatsapp(e.target.value);
              if (validationTrigger) {
                setWhatsappError(mobileValidator(e.target.value));
              }
            }}
            value={whatsapp}
            error={whatsappError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonDatePicker
            required={true}
            label="DOB"
            onChange={(value) => {
              setDateOfBirth(value);
              if (validationTrigger) {
                setDateOfBirthError(selectValidator(value));
              }
            }}
            value={dateOfBirth}
            error={dateOfBirthError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Parent/Guardian mobile"
            prefix={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "gray",
                }}
              >
                <AiOutlinePhone size={18} color="gray" /> +91
              </span>
            }
            onChange={(e) => {
              setParentMobile(e.target.value);
              if (validationTrigger) {
                setParentMobileError(mobileValidator(e.target.value));
              }
            }}
            value={parentMobile}
            error={parentMobileError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Linkedin Link"
            prefix={<SlSocialLinkedin size={18} color="gray" />}
            onChange={(e) => {
              setLinkedinLink(e.target.value);
              if (validationTrigger) {
                setLinkedinLinkError(addressValidator(e.target.value));
              }
            }}
            value={linkedinLink}
            error={linkedinLinkError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Instagram Link"
            prefix={<FaInstagram size={18} color="gray" />}
            onChange={(e) => {
              setInstagramLink(e.target.value);
              if (validationTrigger) {
                setInstagramLinkError(addressValidator(e.target.value));
              }
            }}
            value={instagramLink}
            error={instagramLinkError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={true}
            label="Current State"
            options={stateList}
            onChange={(e) => {
              setCurrentStateId(e.target.value);
              if (validationTrigger) {
                setCurrentStateIdError(selectValidator(e.target.value));
              }
            }}
            value={currentStateId}
            error={currentStateIdError}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{ marginBottom: "24px" }}
          id="profilepage_currentcity_col_div"
        >
          <CommonInputField
            required={true}
            label="Current City"
            onChange={(e) => {
              setCurrentCity(e.target.value);
              if (validationTrigger) {
                setCurrentCityError(addressValidator(e.target.value));
              }
            }}
            value={currentCity}
            error={currentCityError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={true}
            label="Native State"
            options={stateList}
            onChange={(e) => {
              setNativeStateId(e.target.value);
              if (validationTrigger) {
                setNativeStateIdError(selectValidator(e.target.value));
              }
            }}
            value={nativeStateId}
            error={nativeStateIdError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Native City"
            onChange={(e) => {
              setNativeCity(e.target.value);
              if (validationTrigger) {
                setNativeCityError(addressValidator(e.target.value));
              }
            }}
            value={nativeCity}
            error={nativeCityError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Permanent Address"
            onChange={(e) => {
              setAddress(e.target.value);
              if (validationTrigger) {
                setAddressError(addressValidator(e.target.value));
              }
            }}
            value={address}
            error={addressError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={true}
            label="Pincode"
            type="number"
            onChange={(e) => {
              setPincode(e.target.value);
              if (validationTrigger) {
                setPincodeError(addressValidator(e.target.value));
              }
            }}
            value={pincode}
            error={pincodeError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={false}
            label="Gap In Academics"
            options={yesOrNoOptions}
            onChange={(e) => {
              setGapsInAcademicsId(e.target.value);
            }}
            value={gapsInAcademicsId}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={false}
            label="Enrolled In"
            options={yesOrNoOptions}
            onChange={(e) => {
              setEnrolledIn(e.target.value);
            }}
            value={enrolledIn}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={false}
            label="Ready For Relocation"
            options={yesOrNoOptions}
            onChange={(e) => {
              setRelocation(e.target.value);
            }}
            value={relocation}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={false}
            label="Github Link"
            prefix={<FiGithub size={18} color="gray" />}
            onChange={(e) => {
              setGithubLink(e.target.value);
            }}
            value={githubLink}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={false}
            label="Portfolio Link"
            onChange={(e) => {
              setPortfolioLink(e.target.value);
            }}
            value={portfolioLink}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: "24px" }}>
          <CommonInputField
            required={false}
            label="Portfolio Title"
            onChange={(e) => {
              setPortfolioTitle(e.target.value);
            }}
            value={portfolioTitle}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: "24px" }}>
          <CommonTextArea
            required={false}
            multiline={true}
            label="Summary"
            onChange={(e) => {
              setSummary(e.target.value);
            }}
            value={summary}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: "24px" }}>
          <CommonAntdMultiSelect
            required={true}
            label="Skills"
            labelMarginTop="-1px"
            options={skillsOptions}
            onChange={(value) => {
              console.log("skillsss", value);
              setSkills(value);
              if (validationTrigger) {
                setSkillsError(selectValidator(value));
              }
            }}
            value={skills}
            error={skillsError}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: "24px" }}>
          {/* <CommonMultiSelect
            required={false}
            freeSolo={true}
            label={
              <>
                Hobbies — Press <AiOutlineEnter size={14} /> Enter to add
              </>
            }
            labelMarginTop="-1px"
            onChange={(e) => {
              setHobbies(e.target.value);
            }}
            value={hobbies}
          /> */}
          <CommonAntdMultiSelect
            label={
              <>
                Hobbies — Press <AiOutlineEnter size={14} /> Enter to add
              </>
            }
            mode="tags"
            labelMarginTop="-1px"
            onChange={(value) => {
              setHobbies(value);
            }}
            value={hobbies}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: "24px" }}>
          <CommonAntdMultiSelect
            label={
              <>
                Languages — Press <AiOutlineEnter size={14} /> Enter to add
              </>
            }
            mode="tags"
            labelMarginTop="-1px"
            onChange={(value) => {
              setLanguages(value);
            }}
            value={languages}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={false}
            label="Ready to sign the service aggreement"
            options={yesOrNoOptions}
            onChange={(e) => {
              setService(e.target.value);
            }}
            value={service}
            error={""}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <CommonSelectField
            required={false}
            label="Placed"
            options={yesOrNoOptions}
            onChange={(e) => {
              setPlaced(e.target.value);
            }}
            value={placed}
            error={""}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "24px" }}>
          <p className="profilepage_resume_label">
            Resume<span style={{ color: "#d32f2f", marginLeft: "4px" }}>*</span>
          </p>
          <Upload
            style={{ width: "100%" }}
            multiple={false}
            maxCount={1}
            accept=".pdf,.docx"
            beforeUpload={(file) => {
              console.log(file);
              return false; // Prevent auto-upload
            }}
            onChange={handleResumeAttachment}
            onRemove={() => {
              setResumeArray([]);
              setUploadedResume(null);
              setResume("");
            }}
            fileList={resumeArray}
            showUploadList={{ showRemoveIcon: false, showPreviewIcon: false }}
            itemRender={(originNode) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {originNode}
                {uploadedResume && (
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, paddingTop: 10 }}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <EyeOutlined style={{ color: "gray" }} />
                  </Button>
                )}
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, paddingTop: 10, paddingLeft: 8 }}
                  onClick={() => {
                    setResumeArray([]);
                    setUploadedResume(null);
                    setResume("");
                  }}
                >
                  <DeleteOutlined style={{ color: "gray" }} />
                </Button>
              </div>
            )}
          >
            <Button
              icon={<UploadOutlined />}
              className="profilepage_resumeupload_button"
              style={{ width: "100%" }}
            >
              Click to Upload
            </Button>
          </Upload>
          {resumeError && (
            <p style={{ color: "#d32f2f", fontSize: "13px", marginTop: "6px" }}>
              Resume{resumeError}
            </p>
          )}
        </Col>
      </Row>

      <div className="profilepages_personalinfo_button_container">
        <button
          className="coursereviews_rating_modal_btn coursereviews_rating_modal_cancelbutton"
          style={{ width: "max-content" }}
        >
          Cancel
        </button>
        {buttonLoading ? (
          <button
            style={{ width: "145px" }}
            className="coursereviews_rating_modal_btn coursereviews_rating_modal_loading_submitbutton"
          >
            <CommonSpinner />
          </button>
        ) : (
          <button
            className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
            style={{ width: "max-content" }}
            onClick={handleSubmit}
          >
            Save Changes
          </button>
        )}
      </div>

      <Modal
        title="Resume Preview"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPageNumber(1);
          setScale(1.2);
        }}
        footer={null}
        width={1000}
        centered
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "80vh" }}
        >
          {/* Toolbar */}
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              backgroundColor: "#fff",
              alignItems: "center",
            }}
          >
            <Button
              className="profilepage_resume_zoom_buttons"
              icon={<ZoomOutOutlined />}
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              disabled={scale <= 0.5}
            />
            <span style={{ minWidth: "60px", textAlign: "center" }}>
              {Math.round(scale * 100)}%
            </span>
            <Button
              className="profilepage_resume_zoom_buttons"
              icon={<ZoomInOutlined />}
              onClick={() => setScale((prev) => Math.min(2.0, prev + 0.1))}
              disabled={scale >= 2.0}
            />
          </div>

          {/* PDF Viewer Area */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#f5f5f5", // Light gray background
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            {uploadedResume && uploadedResume.type === "application/pdf" && (
              <Document
                file={previewUrl}
                options={{
                  workerSrc: PDF_WORKER_URL,
                  cMapUrl: `https://unpkg.com/pdfjs-dist@5.4.296/cmaps/`,
                  cMapPacked: true,
                }}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div style={{ padding: 20 }}>Loading PDF...</div>}
              >
                <div
                  style={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // Shadow for paper effect
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              </Document>
            )}
            {uploadedResume &&
              (uploadedResume.name.toLowerCase().endsWith(".docx") ||
                uploadedResume.type ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
              docxHtml && (
                <div
                  style={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    backgroundColor: "white",
                    padding: "40px",
                    width: "794px", // A4 width at 96 DPI
                    minHeight: "1123px", // A4 height at 96 DPI
                    margin: "0 auto",
                    zoom: scale,
                  }}
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              )}
          </div>

          {/* Footer with Pagination */}
          <div
            style={{
              padding: "12px 24px",
              borderTop: "1px solid #e8e8e8",
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {uploadedResume &&
            (uploadedResume.type === "application/pdf" ||
              uploadedResume.name.toLowerCase().endsWith(".pdf")) ? (
              <>
                <div style={{ color: "gray" }}>
                  Page {pageNumber} of {numPages || "--"}
                </div>
                {numPages && (
                  <ConfigProvider
                    theme={{ token: { colorPrimary: "#2160ad" } }}
                  >
                    <Pagination
                      current={pageNumber}
                      total={numPages}
                      pageSize={1}
                      onChange={(page) => setPageNumber(page)}
                      showSizeChanger={false}
                    />
                  </ConfigProvider>
                )}
              </>
            ) : (
              <div style={{ color: "gray" }}>DOCX Preview (Scroll to view)</div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title="Resume Warning"
        open={resumeWarningModal}
        onOk={() => setResumeWarningModal(false)}
        onCancel={() => setResumeWarningModal(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setResumeWarningModal(false)}
          >
            OK
          </Button>,
        ]}
      >
        <p>Your resume must contain the keyword "acte technologies".</p>
      </Modal>
    </div>
  );
}

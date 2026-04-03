import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Drawer } from "antd";
import { Tabs } from "antd";
import "./styles.css";
import CompanyQuestions from "./CompanyQuestions";
import FavoriteCompanyQuestions from "./FavoriteCompanyQuestions";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
  isAdmin,
} from "../Common/Validation";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonAntdMultiSelect from "../Common/CommonAntMultiSelect";
import CommonPdfUpload from "../Common/CommonPdfUpload";
import { getCompanyQuestions, getCompanySkills } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { addCompany } from "../ApiService/MultipartApi";
import { useDispatch, useSelector } from "react-redux";
import {
  storeCompanyQuestionList,
  storefavoriteCompanyQuestionSearchValue,
} from "../Redux/Slice";

export default function CompanyQuestionsTab() {
  const dispatch = useDispatch();
  const searchValue = useSelector((state) => state.companyquestionsearchvalue);
  //usestates
  const [isOpenAddCompanyDrawer, setIsOpenAddCompanyDrawer] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [companyLogoBase64, setCompanyLogoBase64] = useState("");
  const [companyLogoBase64Error, setCompanyLogoBase64Error] = useState("");
  const [skillsData, setSkillsData] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  const [pdfArray, setPdfArray] = useState([]);
  const [pdfFile, setPdfFile] = useState([]);
  const [pdfFileError, setPdfFileError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleEdit = useCallback(
    (item) => {
      console.log("itemmm", item);
      setEditCompanyId(item?.id || null);
      setCompanyName(item?.company_name || "");
      setCompanyLogoBase64(item?.company_logo || "");

      // Map skills back to IDs
      const rawSkills =
        typeof item?.skills === "string"
          ? JSON.parse(item?.skills || "[]")
          : item?.skills || [];
      const skillIds = rawSkills
        .map((name) => {
          const skillObj = skillsData.find(
            (s) => s.name === name || s.role_name === name,
          );
          return skillObj ? skillObj.id || skillObj.skill_id : null;
        })
        .filter((id) => id !== null);
      setSkills(skillIds);

      // Map attachments for Ant Design Upload
      const attachments = (item?.attachments || []).map((file) => ({
        uid: file.id,
        name: file.original_name,
        status: "done",
        url: `${import.meta.env.VITE_API_URL}${file.file_path}`,
      }));
      setPdfArray(attachments);

      setIsOpenAddCompanyDrawer(true);
    },
    [skillsData],
  );

  const tabItems = useMemo(() => {
    return [
      {
        label: "Company Questions",
        key: "1",
        children: <CompanyQuestions handleEdit={handleEdit} />,
      },
      {
        label: "Favorite Company Questions",
        key: "2",
        children: <FavoriteCompanyQuestions />,
      },
    ];
  }, [handleEdit]);

  useEffect(() => {
    dispatch(storefavoriteCompanyQuestionSearchValue(""));
    getCompanySkillsData();
  }, []);

  const getCompanySkillsData = async () => {
    try {
      const response = await getCompanySkills();
      console.log("get skills response", response);
      const skills_data = response?.data?.result || [];
      setSkillsData(skills_data);
    } catch (error) {
      setSkillsData([]);
      console.log("get skills error", error);
    } finally {
      getCompanyQuestionsData();
    }
  };

  const getCompanyQuestionsData = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    const payload = {
      company_name: searchValue,
      user_id: converAsJson?.id || null,
    };
    try {
      const response = await getCompanyQuestions(payload);
      console.log("get company questions response", response);
      const company_questions_data = response?.data?.result || [];
      dispatch(storeCompanyQuestionList(company_questions_data));
    } catch (error) {
      dispatch(storeCompanyQuestionList([]));
      console.log("get company questions error", error);
    }
  };

  const handleFileChange = (file) => {
    setPdfFile(file);
    setPdfFileError(selectValidator(file));
  };

  const handleSubmit = async () => {
    const companyNameValidate = addressValidator(companyName);
    const companyLogoValidate = selectValidator(companyLogoBase64);
    const skillsValidate = selectValidator(skills);
    const pdfValidate = selectValidator(pdfArray);

    setCompanyNameError(companyNameValidate);
    setCompanyLogoBase64Error(companyLogoValidate);
    setSkillsError(skillsValidate);
    setPdfFileError(pdfValidate);

    if (
      companyNameValidate ||
      companyLogoValidate ||
      skillsValidate ||
      pdfValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();

    const formData = new FormData();
    if (editCompanyId) {
      formData.append("company_id", editCompanyId);
    }
    formData.append("company_name", companyName);
    formData.append("company_logo", companyLogoBase64);

    const skillNames = skills.map((skillId) => {
      const skillObj = skillsData.find(
        (item) => (item.id || item.skill_id) === skillId,
      );
      return skillObj ? (skillObj.name ?? skillObj.role_name ?? "") : "";
    });

    skillNames.forEach((name) => {
      if (name) formData.append("skills", name);
    });

    const existingAttachmentsIds = pdfArray
      .filter((file) => !file.originFileObj && !(file instanceof File))
      .map((file) => file.uid);

    existingAttachmentsIds.forEach((id) => {
      formData.append("existing_attachments", id);
    });

    pdfArray.forEach((file) => {
      if (file instanceof File) {
        formData.append("content", file);
      } else if (file.originFileObj) {
        formData.append("content", file.originFileObj);
      }
    });

    formData.append("created_date", formatToBackendIST(today));

    try {
      await addCompany(formData);

      setTimeout(() => {
        CommonMessage(
          "success",
          `Company ${editCompanyId ? "Updated" : "Created"} Successfully!`,
        );
        setButtonLoading(false);
        getCompanyQuestionsData();
        formReset();
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

  const formReset = () => {
    setIsOpenAddCompanyDrawer(false);
    setEditCompanyId(null);
    setCompanyName("");
    setCompanyNameError("");
    setCompanyLogoBase64("");
    setCompanyLogoBase64Error("");
    setSkills([]);
    setSkillsError("");
    setPdfArray([]);
    setPdfFile(null);
    setPdfFileError("");
    setValidationTrigger(false);
    setButtonLoading(false);
  };

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <p className="common_heading" style={{ margin: 0 }}>
            Company Questions
          </p>
        </Col>

        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="tests_createtopic_button_container"
        >
          {isAdmin() && (
            <button
              className="courses_createcourse_button"
              onClick={() => setIsOpenAddCompanyDrawer(true)}
            >
              Create Company
            </button>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <Tabs
          className="companyquestions_tabs"
          defaultActiveKey={tabItems[0]?.key}
          items={tabItems}
        />
      </div>

      <Drawer
        title={editCompanyId ? "Update Company" : "Add a new company"}
        onClose={formReset}
        open={isOpenAddCompanyDrawer}
        size={"40%"}
        className="courses_createcourses_drawer questions-drawer"
      >
        <div className="questions-drawer-body">
          <div className="questions-drawer-field">
            <CommonInputField
              label="Company Name"
              required={true}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setCompanyNameError(addressValidator(e.target.value));
              }}
              value={companyName}
              error={companyNameError}
            />
          </div>

          <div className="questions-drawer-field-mt">
            <ImageUploadCrop
              label="Company Logo"
              aspect={1}
              maxSizeMB={1}
              required={true}
              value={companyLogoBase64}
              onChange={(base64) => setCompanyLogoBase64(base64)}
              onErrorChange={setCompanyLogoBase64Error}
            />
            {companyLogoBase64Error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#d32f2f",
                  marginTop: 4,
                }}
              >
                {`Company Logo ${companyLogoBase64Error}`}
              </p>
            )}
          </div>

          <div className="questions-drawer-field-mt">
            <CommonAntdMultiSelect
              required={true}
              label="Skills"
              options={skillsData}
              onChange={(value) => {
                setSkills(value);
                setSkillsError(selectValidator(value));
              }}
              value={skills}
              error={skillsError}
            />
          </div>

          <div className="questions-drawer-field-mt">
            <CommonPdfUpload
              label="Company Questions"
              required={true}
              pdfArray={pdfArray}
              setPdfArray={setPdfArray}
              onFileChange={handleFileChange}
              error={pdfFileError}
            />
          </div>
        </div>

        <div className="courses_createcourses_drawer_footer">
          <div className="courses_createcourses_drawer_submit_buttoncontainer">
            {buttonLoading ? (
              <button className="courses_createcourses_drawer_loadingsubmitbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="courses_createcourses_drawer_submitbutton"
                onClick={handleSubmit}
              >
                {editCompanyId ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Row, Col } from "antd";
import { IoArrowBackOutline } from "react-icons/io5";
import { LuFile } from "react-icons/lu";
import { FiBookmark } from "react-icons/fi";
import { pdfjs } from "react-pdf";
import PdfIcon from "../../assets/pdf_icon.png";
import CommonPdfViewer from "../Common/CommonPdfViewer";

// Use the same worker version established in the viewer
const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

export default function CompanyDocuments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [attachments, setAttachments] = useState([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState({ url: "", title: "" });
  const [pageCounts, setPageCounts] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log("locationn", location);
    const attachmentList = location?.state?.attachments || [];
    setAttachments(attachmentList);

    // Fetch actual page counts for each PDF
    attachmentList.forEach((item) => {
      if (item.mime_type === "application/pdf") {
        fetchPageCount(item);
      }
    });
  }, []);

  const fetchPageCount = async (item) => {
    try {
      const loadingTask = pdfjs.getDocument({
        url: `${API_URL}${item.file_path}`,
        workerSrc: PDF_WORKER_URL,
      });
      const pdf = await loadingTask.promise;
      setPageCounts((prev) => ({
        ...prev,
        [item.id]: pdf.numPages,
      }));
    } catch (error) {
      console.error("Error fetching page count for", item.file_name, error);
    }
  };

  const handleViewPdf = (item) => {
    setCurrentPdf({
      url: `${API_URL}${item.file_path}`,
      title: item.original_name,
    });
    setIsPdfModalOpen(true);
  };

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/company-questions");
              }}
            />
            <p className="common_heading">
              {location?.state?.company_name || ""}
            </p>
          </div>
        </Col>
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="tests_createtopic_button_container"
        ></Col>
      </Row>

      <div className="company_documents_main_container">
        {attachments.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <div className="company_documents_container">
                <div className="company_documents_preparation_container">
                  <div className="company_documents_name_container">
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div className="company_documents_icon_container">
                        <LuFile size={16} color="#2091d0" />
                      </div>
                      <div>
                        <p className="company_documents_name">
                          {item?.original_name || ""}
                          <FiBookmark size={16} color="#2160ad" />
                        </p>
                        <p className="company_documents_page_number">
                          Pages:{" "}
                          <span style={{ color: "#344054" }}>
                            {pageCounts[item.id] || "Loading..."}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="company_documents_pdf_icon_container">
                    <img src={PdfIcon} className="company_documents_pdf_icon" />
                  </div>

                  <div className="company_documents_viewpdf_button_container">
                    <button
                      className="company_documents_viewpdf_button"
                      onClick={() => handleViewPdf(item)}
                    >
                      View PDF
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <CommonPdfViewer
        open={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={currentPdf.url}
        title={currentPdf.title}
        isFullScreen={true}
      />
    </div>
  );
}

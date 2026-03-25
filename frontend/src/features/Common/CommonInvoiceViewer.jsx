import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "antd";
import { LuDownload } from "react-icons/lu";
import CommonSpinner from "./CommonSpinner";
import "./commonstyles.css";

export default function CommonInvoiceViewer({ htmlTemplate, candidateName }) {
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // const generatePDF = async () => {
  //   if (!certificateRef.current) return;
  //   setLoading(true);

  //   const canvas = await html2canvas(certificateRef.current, {
  //     scale: 2,
  //     useCORS: true,
  //     backgroundColor: null,
  //   });

  //   const imgData = canvas.toDataURL("image/png");

  //   const pdf = new jsPDF("portrait", "px", "a4");
  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const pageHeight = pdf.internal.pageSize.getHeight();

  //   // Since container is already A4 ratio, scale directly
  //   pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

  //   pdf.save(`${candidateName}_Acte_Invoice.pdf`);
  //   setLoading(false);
  // };

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);

    const canvas = await html2canvas(certificateRef.current, {
      scale: 3, // you can lower to 1.5 if still big
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Convert canvas to JPEG with compression
    const imgData = canvas.toDataURL("image/jpeg", 0.9); // ✅ 0.6 compression reduces size massively

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [780, 880],
      compress: true, // ✅ Enable PDF compression
      hotfixes: ["px_scaling"],
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    // Insert JPEG instead of PNG
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfHeight);

    pdf.save(`${candidateName}_Acte_Invoice.pdf`);

    setLoading(false);
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* Render the certificate HTML */}
      <div
        ref={certificateRef}
        dangerouslySetInnerHTML={{ __html: htmlTemplate }}
        style={{
          width: "100%", // A4 width in px
          height: "950px", // A4 height in px
          margin: 0,
          padding: 0,
          position: "relative", // needed for absolute images
          backgroundColor: "transparent",
        }}
      ></div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "16px",
          marginRight: "20px",
        }}
      >
        {loading ? (
          <Button type="primary" style={{ width: 160, cursor: "default" }}>
            <CommonSpinner />
          </Button>
        ) : (
          <Button type="primary" style={{ width: 160 }} onClick={generatePDF}>
            <LuDownload size={16} /> Download PDF
          </Button>
        )}
      </div>
    </div>
  );
}

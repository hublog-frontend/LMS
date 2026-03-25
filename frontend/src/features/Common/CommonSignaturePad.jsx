import React from "react";
import { Button } from "antd";
import SignatureCanvas from "react-signature-canvas";
import { CommonMessage } from "./CommonMessage";
import "./commonstyles.css";

export default function CommonSignaturePad({ instruction, onUpload }) {
  const signatureRef = React.useRef(null);

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  // const saveSignature = () => {
  //   if (signatureRef.current.isEmpty()) {
  //     CommonMessage("error", "Please provide a signature first.");
  //     return;
  //   }
  //   const dataURL = signatureRef.current.toDataURL("image/png");

  //   // Create a temporary link to download
  //   const link = document.createElement("a");
  //   link.href = dataURL;
  //   link.download = "signature.png";
  //   link.click();
  //   CommonMessage("success", "Downloaded");
  // };

  const saveSignature = async () => {
    if (signatureRef.current.isEmpty()) {
      CommonMessage("error", "Please provide a signature.");
      return;
    }

    const dataURL = signatureRef.current.toDataURL("image/png"); // Base64 string

    try {
      if (onUpload) {
        // Call parent callback with signature image
        // const base64 = dataURL.split(",")[1];
        await onUpload(dataURL);
        CommonMessage("success", "Signature uploaded successfully!");
      } else {
        CommonMessage("warning", "Upload function not provided.");
      }
    } catch (error) {
      CommonMessage("error", "Failed to upload signature.");
      console.error(error);
    }
  };

  return (
    <div>
      <SignatureCanvas
        ref={signatureRef}
        penColor="black"
        canvasProps={{
          width: window.innerWidth > 767 ? 500 : 260,
          height: "auto",
          className: "sigCanvas",
        }}
      />

      {instruction && (
        <div className="customer_registraion_sign_instruction_container">
          <p style={{ fontSize: "12px", fontWeight: 500 }}>Note:</p>
          <ul>
            <li>
              {" "}
              Acte Technologies has rights to postpone/cancel courses due to
              instructor illness or natural calamities. No refund in this case.
            </li>
            <li>The refund requisition will not be accepted</li>
          </ul>
        </div>
      )}

      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          className="signaturepad_clearbutton"
          onClick={clearSignature}
          style={{ marginRight: "10px" }}
        >
          Clear
        </Button>
        <Button className="signaturepad_downloadbutton" onClick={saveSignature}>
          Save
        </Button>
      </div>
    </div>
  );
}

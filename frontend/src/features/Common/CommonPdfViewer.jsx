import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import {
  MdClose,
  MdNavigateBefore,
  MdNavigateNext,
  MdZoomIn,
  MdZoomOut,
} from "react-icons/md";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./commonstyles.css";

// Use CDN worker for maximum compatibility across environments
const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

export default function CommonPdfViewer({
  open,
  onClose,
  pdfUrl,
  title = "PDF Viewer",
  isFullScreen = false,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(isFullScreen ? 1.1 : 1.0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    const handleFullScreenChange = () => {
      if (isFullScreen && !document.fullscreenElement && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    if (open && isFullScreen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen: ${err.message}`);
        });
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      if (isFullScreen && document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit full-screen: ${err.message}`);
        });
      }
    };
  }, [open, isFullScreen, onClose]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(scale + 0.2);
  const zoomOut = () => setScale(Math.max(scale - 0.2, 0.5));

  if (isFullScreen) {
    if (!open) return null;
    return (
      <div className="pdf-full-page-viewer-overlay">
        <div className="pdf-full-screen-container">
          {/* PDF Content Area */}
          <div className="pdf-scrollable-area">
            <Document
              file={{
                url: pdfUrl,
              }}
              options={{
                workerSrc: PDF_WORKER_URL,
                cMapUrl: `https://unpkg.com/pdfjs-dist@5.4.296/cmaps/`,
                cMapPacked: true,
              }}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="pdf-loading">Loading Document...</div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>

          {/* Footer Navigation */}
          <div className="pdf-full-footer">
            <div className="pdf-footer-left">
              <button
                className="pdf-side-nav-btn"
                disabled={pageNumber <= 1}
                onClick={previousPage}
              >
                <MdNavigateBefore size={24} /> Prev
              </button>
            </div>

            <div className="pdf-footer-center">
              <span className="pdf-page-indicator">- {pageNumber} -</span>
            </div>

            <div className="pdf-footer-right">
              <button
                className="pdf-side-nav-btn"
                disabled={pageNumber >= numPages}
                onClick={nextPage}
              >
                Next <MdNavigateNext size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      closeIcon={null}
      className="common_pdf_viewer_modal"
      centered
    >
      <div className="pdf-viewer-header">
        <h3 className="pdf-viewer-title">{title}</h3>
        <div className="pdf-viewer-controls-top">
          <Button
            icon={<MdZoomOut />}
            onClick={zoomOut}
            disabled={scale <= 0.5}
          />
          <span className="scale-text">{Math.round(scale * 100)}%</span>
          <Button icon={<MdZoomIn />} onClick={zoomIn} disabled={scale >= 3} />
          <Button
            icon={<MdClose size={24} />}
            onClick={onClose}
            type="text"
            className="pdf-close-btn"
          />
        </div>
      </div>

      <div className="pdf-document-container">
        <Document
          file={{
            url: pdfUrl,
          }}
          options={{
            workerSrc: PDF_WORKER_URL,
            cMapUrl: `https://unpkg.com/pdfjs-dist@5.4.624/cmaps/`,
            cMapPacked: true,
          }}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="pdf-loading">Loading PDF...</div>}
        >
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>

      <div className="pdf-viewer-footer">
        <div className="pdf-pagination-controls">
          <Button
            icon={<MdNavigateBefore size={20} />}
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className="pdf-nav-btn"
          >
            Prev
          </Button>
          <span className="pdf-page-info">
            {pageNumber} / {numPages || "--"}
          </span>
          <Button
            disabled={pageNumber >= numPages}
            onClick={nextPage}
            className="pdf-nav-btn"
          >
            Next <MdNavigateNext size={20} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

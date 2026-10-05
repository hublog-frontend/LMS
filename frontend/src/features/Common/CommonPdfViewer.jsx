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
import { ErrorBoundary } from "./ErrorBoundary";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./commonstyles.css";

// Use unpkg CDN to completely bypass Vite bundler for the worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
          console.error(
            `Error attempting to enable full-screen: ${err.message}`,
          );
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

  const pdfFile = React.useMemo(() => ({ url: pdfUrl }), [pdfUrl]);
  const pdfOptions = React.useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    [],
  );

  if (isFullScreen) {
    if (!open) return null;
    return (
      <ErrorBoundary>
        <div className="pdf-full-page-viewer-overlay">
          <div className="pdf-full-screen-container">
            {/* PDF Content Area */}
            <div className="pdf-scrollable-area">
              <Document
                file={pdfFile}
                options={pdfOptions}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="pdf-loading">Loading Document...</div>}
                error={
                  <div className="pdf-loading" style={{ color: "red" }}>
                    Failed to load PDF document. Please check the network
                    connection.
                  </div>
                }
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

            {/* Fix: Added close button to exit fullscreen if PDF fails */}
            <button
              className="pdf-full-close-btn"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 1000,
              }}
            >
              <MdClose size={24} />
            </button>
          </div>
        </div>
      </ErrorBoundary>
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
          file={pdfFile}
          options={pdfOptions}
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

import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import "./commonstyles.css";

const CommonTable = ({
  columns,
  dataSource,
  dataPerPage,
  scroll,
  bordered,
  selectedDatas,
  checkBox,
  loading,
  paginationStatus,
  size,
  className,
  selectedRowKeys,
  rowClassName,
  limit,
  page_number,
  totalPageNumber,
  onPaginationChange,
}) => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPageSize(limit || 10);
  }, [limit, page_number]);

  useEffect(() => {
    setCurrentPage(page_number || 1);
  }, [page_number]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const sizeChanger = document.querySelector(
        ".ant-pagination-options-size-changer",
      );
      if (
        sizeChanger &&
        !sizeChanger.querySelector(".commontable_paginationlabel")
      ) {
        const label = document.createElement("span");
        label.innerText = "Show Rows ";
        label.className = "commontable_paginationlabel";
        sizeChanger.prepend(label);
      }

      // Watch for DOM changes under the table container instead of body
      const tableContainer = document.querySelector(".ant-table-wrapper");
      if (tableContainer) {
        const observer = new MutationObserver(() => {
          const sizeChangerUpdated = document.querySelector(
            ".ant-pagination-options-size-changer",
          );
          if (
            sizeChangerUpdated &&
            !sizeChangerUpdated.querySelector(".commontable_paginationlabel")
          ) {
            const label = document.createElement("span");
            label.innerText = "Show Rows ";
            label.className = "commontable_paginationlabel";
            sizeChangerUpdated.prepend(label);
          }
        });
        observer.observe(tableContainer, {
          childList: true,
          subtree: true,
        });

        return () => observer.disconnect();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection().toString();
      if (selection) {
        e.clipboardData.setData("text/plain", selection.trim());
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setPageSize(pagination.pageSize);
    setCurrentPage(pagination.current);
    if (onPaginationChange) {
      onPaginationChange({
        page: pagination.current,
        limit: pagination.pageSize,
      });
    }
  };

  const rowSelection =
    checkBox === "false"
      ? null
      : {
          selectedRowKeys,
          onChange: (selectedKeys, selectedRows) => {
            if (selectedDatas) {
              selectedDatas(selectedRows);
            }
          },
        };

  const paginationConfig = {
    current: page_number || 1,
    pageSize: limit || 10,
    showSizeChanger: true,
    total: totalPageNumber || 0,
    pageSizeOptions: ["10", "20", "50", "100", "250", "500"],
    position: ["bottomRight"],
    showLessItems: true, // <--- this reduces visible page buttons
    itemRender: (page, type, originalElement) => {
      const safeLimit = limit || 10;
      const totalPages = Math.ceil((totalPageNumber || 0) / safeLimit);

      if (type === "prev") {
        const isDisabled = page_number === 1;
        return (
          <div
            className="commontable_pagination_prevbutton"
            style={{ opacity: isDisabled ? 0.6 : 1 }}
          >
            <GrFormPrevious size={15} />
          </div>
        );
      }
      if (type === "next") {
        const isDisabled = page_number === totalPages;
        return (
          <div
            style={{ opacity: isDisabled ? 0.6 : 1 }}
            className="commontable_pagination_prevbutton"
          >
            <GrFormNext size={15} />
          </div>
        );
      }
      return originalElement;
    },
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={dataSource}
      scroll={scroll}
      pagination={paginationConfig}
      onChange={handleTableChange}
      tableLayout="fixed"
      bordered={bordered === "true"}
      loading={loading}
      size={size}
      className={className}
      rowClassName={rowClassName}
      rowKey={(record) => record.id || record.question_id}
    />
  );
};

export default CommonTable;

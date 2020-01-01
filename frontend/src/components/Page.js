import "./Page.css";

import React from "react";
import { Link } from "react-router-dom";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

import { range } from "../utils/arrayUtils";

const Page = ({ page, path, loadPage, children }) => {
  return (
    <div className="page-items">
      {children}
      {page.totalPages > 1 ? (
        <Pagination>
          {page.currentPage > 0 ? (
            <PaginationItem>
              <PaginationLink
                previous
                tag={Link}
                onClick={(e) => loadPage(page.currentPage - 1)}
                to={{
                  pathname: path,
                  search: `?page=${page.currentPage - 1}`,
                }}
              />
            </PaginationItem>
          ) : null}
          {range(0, (page.totalPages || 1) - 1).map((pageNum) => (
            <PaginationItem active={pageNum === page.currentPage} key={pageNum}>
              <PaginationLink
                tag={Link}
                onClick={() => loadPage(pageNum)}
                to={{
                  pathname: path,
                  search: `?page=${pageNum}`,
                }}
              >
                {pageNum + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {page.currentPage < page.totalPages - 1 ? (
            <PaginationItem>
              <PaginationLink
                next
                tag={Link}
                onClick={(e) => loadPage(page.currentPage + 1)}
                to={{
                  pathname: path,
                  search: `?page=${page.currentPage + 1}`,
                }}
              />
            </PaginationItem>
          ) : null}
        </Pagination>
      ) : null}
    </div>
  );
};

export default Page;

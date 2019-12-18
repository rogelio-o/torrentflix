import React from "react";
import { Link } from "react-router-dom";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const range = (start, end) => {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
};

const Page = ({ page, path, loadPage, children }) => {
  return (
    <div>
      {children}
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
          <PaginationItem active={pageNum == page.currentPage}>
            <PaginationLink
              tag={Link}
              onClick={(e) => loadPage(pageNum)}
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
    </div>
  );
};

export default Page;

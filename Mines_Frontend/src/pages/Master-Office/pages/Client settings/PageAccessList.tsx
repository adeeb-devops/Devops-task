import React, { useState } from "react";
import {
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface SubPage {
  name: string;
}

interface Page {
  name: string;
  subpages?: SubPage[];
}

interface PageAccessListProps {
  pagesData: Page[];
  selectedPages: string[];
  handlePageChange: (pageName: string, subpageName?: string) => void;
  handleSelectAll: () => void;
}

const StyledCheckbox = styled(Checkbox)({
  color: "#3b82f6",
  "&.Mui-checked": {
    color: "#2563eb",
  },
});

const StyledAccordion = styled(Accordion)({
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  "&:before": {
    display: "none",
  },
  borderRadius: "0.5rem",
  overflow: "hidden",
});

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "#f3f4f6",
  "&:hover": {
    backgroundColor: "#e5e7eb",
  },
});

const PageAccessList: React.FC<PageAccessListProps> = ({
  pagesData,
  selectedPages,
  handlePageChange,
  handleSelectAll,
}) => {
  const [expandedPage, setExpandedPage] = useState<string | false>(false);

  const handleAccordionChange =
    (pageName: string) =>
    (_event: React.ChangeEvent<object>, isExpanded: boolean) => {
      setExpandedPage(isExpanded ? pageName : false);
    };

  return (
    <div className="mt-8 mx-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Page Access List
      </h2>
      <button
        onClick={handleSelectAll}
        className="mb-6 bg-color text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        {selectedPages.length ===
        pagesData.flatMap((page) => [
          page.name,
          ...(page.subpages?.map((sp) => sp.name) || []),
        ]).length
          ? "Deselect All"
          : "Select All"}
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagesData.map((page) => (
          // <StyledAccordion key={page.name}>
          <div
            key={page.name}
            className={`relative ${expandedPage === page.name ? "z-10" : ""}`}
          >
            <StyledAccordion
              key={page.name}
              expanded={expandedPage === page.name}
              onChange={handleAccordionChange(page.name)}
              className={
                expandedPage === page.name ? "absolute inset-0 w-full" : ""
              }
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${page.name}-content`}
                id={`${page.name}-header`}
              >
                <label className="inline-flex items-center w-full">
                  <StyledCheckbox
                    checked={selectedPages.includes(page.name)}
                    onChange={() => handlePageChange(page.name)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <Typography className="ml-2 text-lg font-semibold text-gray-800">
                    {page.name}
                  </Typography>
                </label>
              </StyledAccordionSummary>
              {page.subpages && (
                // <AccordionDetails className="px-4 py-2 max-h-48 overflow-y-auto custom-scrollbar">
                <AccordionDetails className="px-4 py-2 max-h-48 overflow-y-auto custom-scrollbar bg-white">
                  {page.subpages.map((subpage) => (
                    <label
                      key={subpage.name}
                      className="flex items-center py-1"
                    >
                      <StyledCheckbox
                        checked={selectedPages.includes(subpage.name)}
                        onChange={() =>
                          handlePageChange(page.name, subpage.name)
                        }
                      />
                      <Typography className="ml-2 text-gray-700">
                        {subpage.name}
                      </Typography>
                    </label>
                  ))}
                </AccordionDetails>
              )}
            </StyledAccordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageAccessList;

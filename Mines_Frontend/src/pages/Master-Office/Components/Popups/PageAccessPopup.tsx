import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface PageAccessPopupProps {
  onClose: () => void;
  initialPermissions: { [key: number]: string };
  onSubmit: (newPermissions: { [key: number]: string }) => void;
  userType: "admin" | "client" | "player" | "downline";
}

const PageAccessPopup: React.FC<PageAccessPopupProps> = ({
  onClose,
  initialPermissions,
  onSubmit,
  userType,
}) => {
  const [permissions, setPermissions] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    setPermissions(initialPermissions || {});
  }, [initialPermissions]);

  const handleCheckboxChange = (permissionValue: string) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      const existingKey = Object.entries(newPermissions).find(
        ([, value]) => value === permissionValue
      );

      if (existingKey) {
        delete newPermissions[Number(existingKey[0])];
      } else {
        const newKey =
          Math.max(...Object.keys(newPermissions).map(Number), -1) + 1;
        newPermissions[newKey] = permissionValue;
      }

      return newPermissions;
    });
  };

  const handleSubmit = () => {
    onSubmit(permissions);
    onClose();
  };

  const permissionsData = {
    admin: [
      {
        name: "Players",
        subpages: ["Player Search", "Block Players"],
      },

      {
        name: "Transactions",
        subpages: ["Game Transactions"],
      },

      {
        name: "Game History",
        subpages: [],
      },
      {
        name: "Game Creation",
        subpages: ["Create Game", "Manage Game"],
      },
      {
        name: "Game Settings",
        subpages: ["Winnings % Settings"],
      },
      {
        name: "MBO Settings",
        subpages: ["Create Mbo user", "User Mbo Settings", "Admin Logs"],
      },

      {
        name: "Client Settings",
        subpages: [
          "Create Client",
          "Client Management",

          "Website Maintainance",
        ],
      },
      {
        name: "Master CMS",
        subpages: [
          "How to Play",
          "Rules",
          "Faq",
          "Terms & Condition",
          "Create Message",
        ],
      },

      {
        name: "Reports",
        subpages: [
          "Player Report",
          "Daily Report",
          "Game Reports",
          "Downline Settlement Report",
        ],
      },
      {
        name: "Live Player P&L",
        subpages: [],
      },
    ],
    client: [
      {
        name: "Players",
        subpages: ["Player Search"],
      },
      {
        name: "Transactions",
        subpages: ["Game Transactions"],
      },
      {
        name: "Game History",
        subpages: [],
      },
      {
        name: "BO Settings",
        subpages: ["BO User Settings", "Create BO User"],
      },
      {
        name: "Reports",
        subpages: [
          "Player Report",
          "Daily Report",
          "Game Report",
          "Upline Settlement Report",
        ],
      },
    ],
    downline: [
      {
        name: "Players",
        subpages: [
          "Player Search",
          "Register Player",
          "Block Players",
          "Adjust Points",
        ],
      },
      {
        name: "Transactions",
        subpages: [
          "Deposit Search",
          "Withdrawal Search",
          "Game Transactions",
          "Adjustment Transactions",
        ],
      },
      {
        name: "Reports",
        subpages: [
          "Area Wise Reports",
          "Ledger Reports",
          "Turnover Reports",
          "Live Sale Reports",
          "Game Turnover Reports",
          "Upline Settlement Reports",
          "Downline Settlement Reports",
        ],
      },
      {
        name: "Settings",
        subpages: ["Create Downline", "Downline Settings"],
      },
      {
        name: "Manager",
        subpages: ["Create Manager", "Manager Settings"],
      },
      {
        name: "Logs",
        subpages: ["Player Logs", "Admin Logs"],
      },
    ],
    player: [
      {
        name: "Games",
        subpages: [
          "Roulette",
          "Andar Bahar",
          "Lottery Spin Wheel",
          "Rashi Spin Wheel",
          "Triple Chance",
        ],
      },
    ],
  };

  const allPermissions = permissionsData[userType];

  return (
    <Dialog onClose={onClose} open fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#f3f4f6",
          color: "#1f2937",
        }}
      >
        <Typography variant="h6">Page Access List</Typography>
        <IconButton edge="end" onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {allPermissions.map((section) => (
            <Grid item xs={12} md={6} key={section.name}>
              <Accordion
                sx={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                  borderRadius: "4px",
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${section.name}-content`}
                  id={`${section.name}-header`}
                  sx={{
                    backgroundColor: "#f8fafc",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                >
                  <FormControlLabel
                    onClick={(event) => event.stopPropagation()}
                    onFocus={(event) => event.stopPropagation()}
                    control={
                      <Checkbox
                        checked={[section.name, ...section.subpages].every(
                          (item) => Object.values(permissions).includes(item)
                        )}
                        indeterminate={
                          [section.name, ...section.subpages].some((item) =>
                            Object.values(permissions).includes(item)
                          ) &&
                          ![section.name, ...section.subpages].every((item) =>
                            Object.values(permissions).includes(item)
                          )
                        }
                        onChange={() => {
                          handleCheckboxChange(section.name);
                          section.subpages.forEach(handleCheckboxChange);
                        }}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="subtitle2">
                        {section.name}
                      </Typography>
                    }
                  />
                </AccordionSummary>
                <AccordionDetails
                  sx={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {section.subpages.map((subpage) => (
                    <FormControlLabel
                      key={subpage}
                      control={
                        <Checkbox
                          checked={Object.values(permissions).includes(subpage)}
                          onChange={() => handleCheckboxChange(subpage)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{subpage}</Typography>}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", padding: 2 }}>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-700 text-white rounded-md transition-colors hover:bg-blue-500"
        >
          Submit
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default PageAccessPopup;

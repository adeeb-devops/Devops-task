import React, { useMemo, useState } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import PageAccessList from "../Client settings/PageAccessList";
import { toast } from "react-toastify";
import axios from "axios";

interface Page {
  name: string;
  subpages?: SubPage[];
}

interface SubPage {
  name: string;
}
const CreateMaster = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const pagesData: Page[] = [
    {
      name: "Players",
      subpages: [
        { name: "Player Search" },
        { name: "Block Players" },
        { name: "Player Device Info" },
      ],
    },
    {
      name: "Transactions",
      subpages: [{ name: "Game Transactions" }],
    },

    {
      name: "Game History",
      subpages: [],
    },
    {
      name: "Game Creation",
      subpages: [{ name: "Create Game" }, { name: "Manage Game" }],
    },
    {
      name: "Game Settings",
      subpages: [{ name: "Winnings % Settings" }],
    },
    {
      name: "MBO Settings",
      subpages: [{ name: "Create Mbo user" }, { name: "User Mbo Settings" }],
    },
    {
      name: "Client Settings",
      subpages: [
        { name: "Create Client" },
        { name: "Client Management" },
        { name: "Admin Logs" },
        { name: "Website Maintainance" },
      ],
    },
    {
      name: "Master CMS",
      subpages: [
        { name: "How to Play" },
        { name: "Rules" },
        { name: "Faq" },
        { name: "Terms & Condition" },
        { name: "Create Message" },
      ],
    },

    {
      name: "Reports",
      subpages: [
        { name: "Player Report" },
        { name: "Daily Report" },
        { name: "Game Reports" },
        { name: "Downline Settlement Report" },
      ],
    },
    {
      name: "Live Player P&L",
      subpages: [],
    },
  ];

  const handleSubmit = async () => {
    if (!formData.role) {
      formData.role = "admin";
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/; // Adjust this regex based on your requirements
    if (!phoneRegex.test(formData.phone_number)) {
      toast.error("Invalid phone number! Please enter a valid number.");
      return;
    }

    if (Object.values(formData).some((value) => !value)) {
      toast.error("All fields are necessary!");
      return;
    }

    const token = sessionStorage.getItem("masterToken");

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/admin`,
        {
          ...formData,
          role: "admin",
          permissions: selectedPages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success("User Created Successfully");
        handleClear();
      } else {
        toast.error("Something not right !");
      }
    } catch (error) {
      toast.error(error.response.data.message + "! Try with different data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const regex = /^[a-zA-Z0-9\s.,-]*$/;
    if (name !== "password" && !regex.test(value)) {
      return;
    }
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      username: "",
      password: "",
      role: "",
      phone_number: "",
    });
    setSelectedPages([]);
  };

  const handlePageChange = (pageName: string, subpageName?: string) => {
    setSelectedPages((prev) => {
      let newSelection = [...prev];
      const page = pagesData.find((p) => p.name === pageName);

      if (subpageName) {
        // Toggle subpage selection
        newSelection = newSelection.includes(subpageName)
          ? newSelection.filter((name) => name !== subpageName)
          : [...newSelection, subpageName];

        // Check if any subpages are selected
        const hasSelectedSubpages = page?.subpages?.some((sp) =>
          newSelection.includes(sp.name)
        );

        // Update main page selection based on subpage selections
        if (hasSelectedSubpages && !newSelection.includes(pageName)) {
          newSelection.push(pageName);
        } else if (!hasSelectedSubpages) {
          newSelection = newSelection.filter((name) => name !== pageName);
        }
      } else {
        // Toggle main page selection
        if (newSelection.includes(pageName)) {
          // Deselect main page and all its subpages
          newSelection = newSelection.filter(
            (name) =>
              name !== pageName &&
              !page?.subpages?.some((sp) => sp.name === name)
          );
        } else {
          // Select main page and all its subpages (if any)
          newSelection.push(pageName);
          page?.subpages?.forEach((sp) => {
            if (!newSelection.includes(sp.name)) newSelection.push(sp.name);
          });
        }
      }

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allPageNames = pagesData.flatMap((page) => [
      page.name,
      ...(page.subpages?.map((sp) => sp.name) || []),
    ]);
    setSelectedPages((prevSelected) =>
      prevSelected.length === allPageNames.length ? [] : allPageNames
    );
  };
  const roleOptions = useMemo(
    () => [
      { label: "Manager", value: "manager" },
      // { label: "Master Admin", value: "master" },
      // { label: "Admin", value: "admin" },
    ],
    []
  );
  return (
    <div>
      <h1 className="title">Create Mbo User</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "User Name",
              name: "username",
              type: "text",
              value: formData.username,
              onChange: handleInputChange,
              placeholder: "Enter User Name",
            },
            {
              label: "Password",
              name: "password",
              type: "text",
              value: formData.password,
              onChange: handleInputChange,
              placeholder: "Enter Password",
            },

            {
              label: "Mobile Number",
              name: "phone_number",
              type: "number",
              value: formData.phone_number,
              onChange: handleInputChange,
              placeholder: "Enter Mobile Number",
              maxLength: 10,
            },
            {
              label: "Role",
              name: "role",
              type: "dropdown",
              value: formData.role,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: roleOptions,
            },
          ]}
          buttons={[]}
        />
      </div>
      <PageAccessList
        pagesData={pagesData}
        selectedPages={selectedPages}
        handlePageChange={handlePageChange}
        handleSelectAll={handleSelectAll}
      />

      <div className="pb-5 ml-6">
        <InputWithButtons
          fields={[]}
          buttons={[
            {
              text: "Submit",
              onClick: handleSubmit,
              className: "SubmitButton",
              disabled: isLoading,
            },
            {
              text: "Clear",
              onClick: handleClear,
              className: "ClearButton",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CreateMaster;

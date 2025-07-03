import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";
import PageAccessList from "../../../Master-Office/pages/Client settings/PageAccessList";
import ConfirmationPopup from "../../../Master-Office/Components/Popups/ConfirmationPopup";
interface Page {
  name: string;
  subpages?: SubPage[];
}

interface SubPage {
  name: string;
}

const CreateBoUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    mobileNumber: "",
    role: "",
  });

  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onSubmit: () => void;
  } | null>(null);

  const pagesData: Page[] = [
    {
      name: "Players",
      subpages: [{ name: "Player Search" }],
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
      name: "BO Settings",
      subpages: [{ name: "BO User Settings" }, { name: "Create BO User" }],
    },
    {
      name: "Reports",
      subpages: [
        { name: "Player Report" },
        { name: "Daily Report" },
        { name: "Game Report" },
        { name: "Upline Settlement Report" },
      ],
    },
  ];

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("clientToken");
    // Validate phone number
    if (formData.mobileNumber) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.mobileNumber)) {
        toast.error("Invalid phone number! Please enter a valid number.");
        return;
      }
    }

    if (Object.values(formData).some((value) => !value)) {
      toast.error("All fields are necessary!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/`,
        {
          distributor_key: formData.password,
          phone_number: formData.mobileNumber,
          role: formData.role,
          name: formData.username,
          password: formData.password,
          permissions: selectedPages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("create distributor : ", response);
      if (response.data.success) {
        handlePopup(
          `Client Created with Distributor ID : ${response.data.data.distributor.distributor_id}`
        );
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
  const handlePopup = (msg: string) => {
    setConfirmPopup({
      isOpen: true,
      title: "Create Client",
      message: `${msg}`,
      onSubmit: () => {
        // handleStatusUpdate(admin.id, newStatus);
        setConfirmPopup(null);
      },
    });
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
      mobileNumber: "",
      role: "",
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

  const roles = [
    "super_distributor",
    "distributor",
    "sub_distributor",
    "retailer",
  ];

  const getDownwardRoles = (role) => {
    const roleIndex = roles.indexOf(role);

    if (roleIndex === -1) {
      return [];
    }

    return roles.slice(roleIndex + 1);
  };

  const clientRole = sessionStorage.getItem("clientRole");
  const availableRoles = getDownwardRoles(clientRole);

  const user_roles = useMemo(() => {
    // Start with the default "Select Role" option
    return [
      { label: "Select Role", value: "" },
      ...availableRoles.map((role) => ({
        label: role
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        value: role,
      })),
    ];
  }, [availableRoles]);

  return (
    <div>
      <h1 className="title">Create Bo User</h1>
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
              name: "mobileNumber",
              type: "number",
              value: formData.mobileNumber,
              onChange: handleInputChange,
              placeholder: "Enter Mobile Number",
              maxLength: 10,
            },
            {
              label: "Select Role",
              name: "role",
              type: "dropdown",
              value: formData.role,
              onChange: handleInputChange,
              options: user_roles,
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
      {confirmPopup && (
        <ConfirmationPopup
          isOpen={confirmPopup.isOpen}
          title={confirmPopup.title}
          message={confirmPopup.message}
          onClose={() => setConfirmPopup(null)}
          onSubmit={confirmPopup.onSubmit}
        />
      )}
    </div>
  );
};

export default CreateBoUser;

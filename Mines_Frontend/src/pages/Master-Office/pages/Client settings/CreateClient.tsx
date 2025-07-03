import React, { useEffect, useMemo, useState } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import PageAccessList from "./PageAccessList";
import { toast } from "react-toastify";
import axios from "axios";
import ConfirmationPopup from "../../Components/Popups/ConfirmationPopup";

interface Page {
  name: string;
  subpages?: SubPage[];
}

interface SubPage {
  name: string;
}

const CreateClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    sharingType: "",
    selfSharing: "",
    clientSharing: "",
    mobileNumber: "",
    points: "",
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
    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.mobileNumber)) {
      toast.error("Invalid phone number! Please enter a valid number.");
      return;
    }

    if (Object.values(formData).some((value) => !value)) {
      toast.error("All fields are necessary!");
      return;
    }
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page!");
      return;
    }
    if (!formData.selfSharing || !formData.clientSharing) {
      toast.error("Please enter sharing percentage");
      return;
    }
    if (Number(formData.selfSharing) + Number(formData.clientSharing) !== 100) {
      toast.error("Sum of self and client sharing should be 100 %");
      return;
    }
    if (Number(formData.selfSharing) + Number(formData.clientSharing) > 100) {
      toast.error("Sum of self and client sharing should not be more than 100 %");
      return;
    }

    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/`,
        {
          distributor_key: formData.password,
          sharing_type: formData.sharingType,
          sharing_percentage: {
            self: formData.selfSharing,
            client: formData.clientSharing,
          },
          role: "distributor",
          phone_number: formData.mobileNumber,
          name: formData.username,
          password: formData.password,
          permissions: selectedPages,
          points: Number(formData.points),
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
    if (name === "selfSharing" && Number(value) > 100) {
      toast.error("Self Sharing cannot exceed 100%.");
      return;
    }
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      username: "",
      password: "",
      selfSharing: "",
      clientSharing: "",
      sharingType: "",
      mobileNumber: "",
      points: "",
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

  const sharingsOptions = useMemo(
    () => [
      { label: "Select sharing Type", value: "" },
      { label: "Turnover (On Bets)", value: "turnover" },
      { label: "Commission Sharing", value: "commission" },
      { label: "P&L Sharing", value: "plsharing" },
    ],
    []
  );

  useEffect(()=>{
    const client=String(100-Number(formData.selfSharing));
    setFormData((prevFormData) => ({ ...prevFormData, clientSharing:client }));
  },[formData.selfSharing])

  return (
    <div>
      <h1 className="title">Create Client</h1>
      <div className="">
        <InputWithButtons
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
              label: "Points",
              name: "points",
              type: "text",
              value: formData.points,
              onChange: handleInputChange,
              placeholder: "Enter Points",
            },
            {
              label: "Sharing Type",
              name: "sharingType",
              type: "dropdown",
              value: formData.sharingType,
              onChange: handleInputChange,
              placeholder: "Select",
              options: sharingsOptions,
            },

            {
              label: "Self Sharing %",
              name: "selfSharing",
              type: "number",
              value: formData.selfSharing,
              onChange: handleInputChange,
              placeholder: "Enter Self Sharing %",
              maxLength: 3,
            },
            {
              label: "Client Sharing %",
              name: "clientSharing",
              type: "number",
              value: formData.clientSharing,
              onChange: handleInputChange,
              placeholder: "Enter Client Sharing %",
              maxLength: 3,
              disabled:true
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
      <div className="pb-5">
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

export default CreateClient;

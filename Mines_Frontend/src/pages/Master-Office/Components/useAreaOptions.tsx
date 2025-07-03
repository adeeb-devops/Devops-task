import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Area {
  id: number;
  area_name: string;
}

interface AreaOption {
  label: string;
  value: number;
}

export const useAreaOptions = () => {
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([
    { label: "Select Area", value: 0 },
  ]);

  const getArea = async () => {
    try {
      const token = sessionStorage.getItem("masterToken") || sessionStorage.getItem("clientToken");
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/area`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        const mappedArea = response.data.data.area.map((area: Area) => ({
          label: area.area_name,
          value: area.id,
        }));
        setAreaOptions([{ label: "Select Area", value: 0 }, ...mappedArea]);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    getArea();
  }, []);

  return areaOptions;
};
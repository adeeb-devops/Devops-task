import { useState, useEffect } from 'react';
import axios from 'axios';

interface Distributor {
  label: string;
  value: string;
  organization_id?: string;
  parent_id?:number;
}

export const useDistributors = (role: string, parentId: string | undefined, organizationId?: string, id?:number) => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const formattedRole = role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

// console.log("response parent", parentId)

  useEffect(() => {
    const fetchDistributors = async () => {
      const token = sessionStorage.getItem("masterToken") || sessionStorage.getItem("clientToken");

      if (role !== 'super_distributor' && !organizationId) {
        console.warn(`organization_id is required for fetching ${role} but is not set.`);
        return;
      }

      try {
        const params: Record<string, string|number> = { role };

        if (role !== 'super_distributor') {
          params.organization_id = organizationId as string;
            // console.log("parent_id",id);
            params.parent_id= id as number;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND}/distributor/filter`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params
          }
        );
    //  console.log(`fetchDistributor ${role}`,response,params)

        if (response.data.success) {
          const distributorOptions = response.data.data.map((d) => ({
            label: d.name,
            value: d.distributor_id,
            organization_id: d.organization_id,
            parent_id:d.id
          }));

          setDistributors([
            { label: `Select ${formattedRole}`, value: '' },
            ...distributorOptions,
          ]);

          if (role === 'super_distributor' && parentId) {
            const selectedDistributor = distributorOptions.find(d => d.value === parentId);
            if (selectedDistributor && selectedDistributor.organization_id) {
              setDistributors(prev => ({
                ...prev,
                organizationId: selectedDistributor.organization_id
              }));
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching ${role}:`, error);
      }
    };

    if (role === 'super_distributor' || parentId) {
      fetchDistributors();
    } else {
      setDistributors([{ label: `Select ${formattedRole}`, value: '' },]);
    }
  }, [role, parentId, organizationId,formattedRole]);

  return distributors;
};

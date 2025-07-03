import { useState, useEffect } from "react";
import axios from "axios";

interface Distributor {
  id: number;
  name: string;
  organization_id: string;
  distributor_id: string;
  distributor_key: string;
  role: string;
  phone_number: string;
  status: "active" | "inactive";
  logo: string | null;
  permissions: string[];
  last_login: string | null;
  system_ip: string;
  wallet_token: string | null;
  wallet_url: string | null;
  sharing_type: string | null;
  sharing_percentage: number | null;
  points: number;
  created_by: string;
  created_by_admin: string | null;
  parent_id: number | null;
  createdAt: string;
  updatedAt: string;
}

interface useGetClientsProps {
  role?: "super_distributor" | "distributor" | "sub_distributor" | "retailer";
  organization_id?: string;
  parent_id?: string;
}

interface useGetClientsResult {
  clients: Distributor[] | null;
  loadingClients: boolean;
  errorClients: string | null;
}

const useGetClients = ({
  role,
  organization_id,
  parent_id,
}: useGetClientsProps): useGetClientsResult => {
  const [clients, setClients] = useState<Distributor[] | null>(null);
  const [loadingClients, setLoadingClients] = useState<boolean>(true);
  const [errorClients, setErrorClients] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDistributors = async () => {
      setLoadingClients(true);

      const token = sessionStorage.getItem("masterToken");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const params: Record<string, string> = {};
      if (role) params.role = role;
      if (organization_id) params.organization_id = organization_id;
      if (parent_id) params.parent_id = parent_id;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND}/distributor/filter`,
          {
            headers,
            params,
            signal: controller.signal,
          }
        );

        setClients(response.data.data || []);
        setErrorClients(null);
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          setErrorClients("Failed to fetch distributors");
          console.error(error);
        }
      } finally {
        setLoadingClients(false);
      }
    };

    fetchDistributors();

    return () => controller.abort();
  }, [role, organization_id, parent_id]);

  return { clients, loadingClients, errorClients };
};

export default useGetClients;

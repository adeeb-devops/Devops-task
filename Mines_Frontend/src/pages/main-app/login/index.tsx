import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { useEffect, useContext } from "react";
import InputField from "../Components/InputField";
import ApiClient from "../api";
// import { MyContext } from "../context/context";
import { useUserContext } from "../context/userContext";
import { toast } from "react-toastify";

const loginSchema = z.object({
  player_name: z.string().min(1, "Player Name is required"),
  user_name: z.string().min(1, "Username is required"),
  phoneNumber: z.string().refine((val) => /^\d{10}$/.test(val), {
    message: "Phone Number must be exactly 10 digits and contain only numbers",
  }),
  distributor_id: z.string().min(1, "Distributor ID is required"),
  distributor_key: z.string().min(1, "Distributor Key is required"),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // const {  handleSetUser } = useUserContext();

  const onSubmit = async (formValues: LoginFormInputs) => {
    const { ...loginData } = formValues;
    try {
      const { data } = await ApiClient.post("/player/login", { ...loginData });
      if (data.success) {
        localStorage.setItem("minesToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        navigate("/home");
        // redirectToGamePage(data.game);
      }
    } catch (error) {
       toast.error(error.response.data.message)
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-x-4 bg-black">
      <div className="text-white font-medium text-3xl my-5">PLAYER LOGIN</div>
      <div className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-neutral-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 grid gap-y-4"
        >
          <InputField
            register={register}
            label="Player Name"
            id="player_name"
            error={errors.player_name?.message}
          />

          <InputField
            register={register}
            label="Username"
            id="user_name"
            error={errors.user_name?.message}
          />

          <InputField
            register={register}
            label="Phone Number"
            id="phoneNumber"
            error={errors.phoneNumber?.message}
          />

          <InputField
            register={register}
            label="Distributor ID"
            id="distributor_id"
            error={errors.distributor_id?.message}
          />

          <InputField
            register={register}
            label="Distributor Key"
            id="distributor_key"
            error={errors.distributor_key?.message}
          />

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

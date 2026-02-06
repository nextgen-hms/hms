
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData, loginUser } from "../api";
import { UserData, DecodedToken } from "../types";


export function useLogin() {
  const [userCode, setUserCode] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


  const redirectByRole = (role: string) => {
    switch (role) {
      case "Doctor":
        router.replace("/doctor");
        break;
      case "Receptionist":
        router.replace("/receptionist");
        break;
      case "Pharmacist":
        router.replace("/pharmacy");
        break;
      case "Lab_Technician":
        router.replace("/lab");
        break;
      default:
        router.replace("/");
    }
  };

  const getUserData = async () => {
    if (!userCode.trim()) {
      setError("Please enter a Valid user code");
      return;
    }

    setIsFetchingInfo(true);
    setError("");

    try {
      const data = await fetchUserData(userCode);
      if (!data) setError("User code not found");
      else {
        setName(data.name);
        setDesignation(data.role);
      }
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const verifyUserLogin = async () => {
    if (!userCode || !name || !designation || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await loginUser(userCode, password);
      console.log(data);

      if (data?.role) redirectByRole(data.role);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };


  return {
    userCode,
    name,
    designation,
    password,
    showPassword,
    isLoading,
    isFetchingInfo,
    error,
    setUserCode,
    setName,
    setDesignation,
    setPassword,
    setShowPassword,
    getUserData,
    verifyUserLogin,
  };
}

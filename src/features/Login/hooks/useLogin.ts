
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
  const [error, setError] = useState("");
  const router = useRouter();

  // Auto-redirect if already logged in
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   try {
  //     const decoded = jwt.decode(token) as DecodedToken | null;
  //     if (decoded?.role) redirectByRole(decoded.role);
  //   } catch {
  //     localStorage.removeItem("token");
  //   }
  // }, []);

  const redirectByRole = (role: any) => {
    switch (role) {
      case "Doctor":
        router.push("/doctor");
        break;
      case "Receptionist":
        router.push("/receptionist");
        break;
      case "Pharmacist":
        router.push("/pharmacy");
        break;
      case "Lab_Technician":
        router.push("/lab");
        break;
      default:
        router.push("/");
    }
  };

  const getUserData = async () => {
    if (!userCode.trim()) {
      setError("Please enter a Valid user code");
      return;
    }

    // setIsLoading(true);
    setError("");

    const data = await fetchUserData(userCode);
    if (!data) setError("User code not found");
    else {
      setName(data.name);
      setDesignation(data.role);
    }

    // setIsLoading(false);
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
      
      if (data?.role) redirectByRole(data.role );
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

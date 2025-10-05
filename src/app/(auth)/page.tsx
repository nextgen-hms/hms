"use client";
import Image from "next/image";
import { useState } from "react";
import {Eye} from 'lucide-react';
import Link from "next/link";
export default function Login() {
    const [userCode, setUserCode] = useState("");
    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [password, setPassword] = useState("");
    const [hiddenPassword, SetHiddenPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    console.log(password);
    console.log(hiddenPassword);

    async function getUserData() {
        const res = await fetch(`api/login/${userCode}`);
        const data = await res.json();
        if(!data){
            //usercode not found
        }
        console.log(data);
        setName(data.name);
        setDesignation(data.designation);
    }
    async function verifyUserLogin() {
        const res = await fetch("api/login", {
            method: "POST",
            body: JSON.stringify({
                code: userCode,
                uname: name,
                udesignation: designation,
                upassword: password,
            }),
        });
    }
    return (
        <div
          className="
            flex
            h-screen w-screen
            bg-[#e3f7e9]
            items-center justify-center
          "
        >
            <div
              className="
                flex
                w-[60dvw] h-3/4
                relative
                font-
              "
            >
                <div
                  className="
                    flex flex-col
                    w-[30dvw]
                    bg-white
                    rounded-l-[40px]
                    gap-25
                  "
                >
                    <div
                      className="
                        flex
                        m-5
                      "
                    >
                        <div
                          className="
                            h-7 w-7
                            relative
                          "
                        >
                            <Image src="/logo.png" alt="logo" fill />
                        </div>
                        <h1
                          className="
                            font-bold text-green-700 
                          "
                        >
                            Dr Fouzia Ishaq Clinic
                        </h1>
                    </div>
                    <div
                      className="
                        text-center
                      "
                    >
                        <h1
                          className="
                            font-semibold text-3xl text-green-400 mask-b-from-neutral-700
                          "
                        >
                            Welcome!
                        </h1>
                        <h3
                          className="
                            text-sm text-green-300 mask-radial-from-neutral-800
                          "
                        >
                            Welcome to Next Gen HMS Made By love
                        </h3>
                    </div>
                    <div
                      className="
                        flex flex-col
                        items-center gap-20 w-[30dvw] pl-[1dvw]
                      "
                    >
                        <div
                          className="
                            flex flex-col  w-[30dvw] pl-[1dvw] 
                          "
                        >
                            <div
                              className="
                                w-full
                                relative
                              "
                            >
                                <textarea
                                  rows={1}
                                  value={userCode}
                                  onChange={(e) => setUserCode(e.target.value)}
                                  onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            getUserData();
                                        }
                                    }}
                                  className={`
                                    h-10 w-[23dvw]
                                    px-3 pt-3
                                    text-gray-500 text-sm
                                    bg-slate-200
                                    rounded-2xl
                                    resize-none
                                    ease duration-200 peer outline-none caret-slate-400
                                    ${userCode ? "focus:h-10 " : "focus:h-15"}
                                  `}
                                />
                                <span
                                  className={`
                                    block
                                    text-sm text-slate-500
                                    pointer-events-none
                                    ease duration-200 absolute top-2.5 left-2 peer-focus:top-10
                                    ${userCode ? "opacity-0" : "opacity-100"}
                                  `}
                                >
                                    Enter Your User Code e.g,DOC001
                                </span>
                            </div>
                            <div
                              className="
                                relative
                              "
                            >
                                <textarea
                                  rows={1}
                                  onChange={(e) => setName(e.target.value)}
                                  value={name}
                                  onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }
                                    }}
                                  className={`
                                    h-10 w-[23dvw]
                                    px-3 pt-3
                                    text-gray-500 text-sm
                                    bg-slate-200
                                    rounded-2xl
                                    resize-none
                                    ease duration-200 peer outline-none caret-slate-400
                                    ${name ? "focus:h:10" : "focus:h-15"}
                                  `}
                                />
                                <span
                                  className={`
                                    block
                                    text-sm text-slate-500
                                    pointer-events-none
                                    ease duration-200 absolute top-2.5 left-2 peer-focus:top-10
                                    ${name ? "opacity-0" : "opacity-100"}
                                  `}
                                >
                                    Name
                                </span>
                            </div>
                            <div
                              className="
                                w-full
                                relative
                              "
                            >
                                <textarea
                                  rows={1}
                                  value={designation}
                                  onChange={(e) => setDesignation(e.target.value)}
                                  onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }
                                    }}
                                  className={`
                                    h-10 w-[23dvw]
                                    px-3 pt-3
                                    text-gray-500 text-sm
                                    bg-slate-200
                                    rounded-2xl
                                    resize-none
                                    ease duration-200 peer outline-none caret-slate-400
                                    ${designation ? "focus:h-10" : "focus:h-15"}
                                  `}
                                />
                                <span
                                  className={`
                                    block
                                    text-sm text-slate-500
                                    pointer-events-none
                                    ease duration-200 absolute top-2.5 left-2 peer-focus:top-10
                                    ${designation ? "opacity-0" : "opacity-100"}
                                  `}
                                >
                                    Designation
                                </span>
                            </div>
                            <div
                              className="
                               relative
                               w-80
                              "
                            >
                                <textarea
                                  rows={1}
                                  value={showPassword ? password : "•".repeat(password.length)}
                                  onChange={(e) => e.target.value}
                                  onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }

                                        if (e.key === "Backspace") {
                                            e.preventDefault();
                                            setPassword(password.slice(0, -1));
                                            return;
                                        }

                                        if (e.key.length > 1) return;

                                        e.preventDefault();
                                        setPassword(password + e.key);
                                    }}
                                  className={`
                                    h-10 w-[23dvw]
                                    px-3 pt-3
                                    text-gray-500 text-sm
                                    bg-slate-200
                                    rounded-2xl
                                    resize-none
                                    ease duration-200 peer outline-none caret-slate-400
                                    ${password ? "focus:h-10" : "focus:h-15"}
                                  `}
                                />
                                <span
                                  className={`
                                    block
                                    text-sm text-slate-500
                                    pointer-events-none
                                    ease duration-200 absolute top-2.5 left-2 peer-focus:top-10
                                    ${password ? "opacity-0" : "opacity-100"}
                                  `}
                                >
                                    Enter Your Password
                                </span>
                                <button
                                  onClick={() => {
                                        showPassword
                                            ? setShowPassword(false)
                                            : setShowPassword(true);
                                    }}
                                  className="
                                    
                                    text-sm
                                    relative
                                    top-0
                                    left-3
                                    w-5
                                    h-5
                                  "
                                >
                                    {/* <Eye className="text-slate-500"/> */}
                                </button>
                                
                            </div>
                        </div>
                        <div
                          className="
                            flex flex-col
                            absolute bottom-2 items-center
                          "
                        >
                            <div>
                              <Link href="/receptionist">
                                <button
                                  onClick={() => verifyUserLogin()}
                                  className="
                                    w-[23dvw] h-8
                                    mb-20
                                    text-white
                                    bg-green-600
                                    rounded-md
                                    hover:bg-green-400
                                  "
                                >
                                  Login
                                    
                                </button>
                                </Link>
                            </div>
                            <div>
                                <span
                                  className="
                                    text-sm text-slate-400
                                  "
                                >
                                    Powered By Bublu
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                  className="
                    flex
                    w-[30dvw] h-full
                    bg-[url('/login_bg.jpg')] bg-cover bg-no-repeat
                    rounded-r-[40px]
                    items-center justify-center backdrop-blur-md
                  "
                >
                    <div
                      className="
                        flex
                        w-3/4 h-2/4
                        text-center
                        bg-white/30
                        rounded-2xl
                        justify-center items-center backdrop-blur-md
                      "
                    >
                        <h1
                          className="
                            text-white text-6xl font-bold
                          "
                        >
                            Health is Wealth
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
}

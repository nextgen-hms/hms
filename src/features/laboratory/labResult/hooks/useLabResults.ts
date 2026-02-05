"use client"
import { useEffect, useState } from "react";
import { Test, TestParameters } from "../types";
import { fetchAllTests, fetchTestParameters } from "../api";
import { useForm } from "react-hook-form"; 
export function useLabResults(){
  const [AllTests,SetAllTests]=useState<Test[]>([]);
  const [loading,setLoading]=useState<boolean>(true);
  const [error,setError]=useState<string|null>(null);
  const [TestId,setTestId]=useState<number|null>(null);
  const [TestName,SetTestName]=useState<string|null>(null);
  const [filteredTests,SetFilteredTests]=useState<Test[]>([]);
  const [testParameters,setTestParameters]=useState<TestParameters[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState:{errors}
  }=useForm();
  useEffect(()=>{
    loadAllTests();
  },[]);
  useEffect(()=>{
    console.log(AllTests);
    if(!TestId) return;
   SetFilteredTests(filterByTestId());
  },[TestId]);
  useEffect(()=>{
    if(!TestName)return;
    SetFilteredTests(filterByName());
  },[TestName]);
  useEffect(()=>{
    if(!TestId)return;
    loadAllParameters();
  },[TestId]);
  async function loadAllTests(){
    try{
      const tests=await fetchAllTests();
      SetAllTests(tests);
    }
    catch(err){
      console.error(err);
      setError("Failed to fetch All tests /useLabResults")
    }
    finally{
      setLoading(false);
    }
  }

  function filterByTestId():Test[]{
    return AllTests.filter((t:Test) => t.test_id === TestId);
  }

  function filterByName():Test[]{
    return AllTests.filter((t:Test)=> t.test_name.includes(TestName!));
  }
  async function loadAllParameters(){
          try{
      const testp=await fetchTestParameters(TestId!);
      setTestParameters(testp);
    }
    catch(err){
      console.error(err);
      setError("Failed to fetch  test Parameters /useLabResults")
    }
    finally{
      setLoading(false);
    }
  }
  
  function saveTestResults(data:any){
  
   
  }

  return{
    AllTests,
    loading,
    error,
    TestId,setTestId,
    TestName,SetTestName,
    filteredTests,
    testParameters,
    register,
   handleSubmit,
   saveTestResults,
   SetFilteredTests
  }
}

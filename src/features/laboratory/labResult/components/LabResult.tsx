//show all aprameter of test selelcted
//store test results
//generaate test report
//print pdf of test report
"use client";
import { Label } from "@/src/components/ui/Label";
import { useLabResults } from "../hooks/useLabResults";
import { Test, TestParameters } from "../types";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
export default function LabResult() {
  const {
    AllTests,
    loading,
    error,
    TestId,
    setTestId,
    TestName,
    SetTestName,
    filteredTests,
    testParameters,
    register,
    handleSubmit,
    saveTestResults,
    SetFilteredTests
  } = useLabResults();
  
  return (
    <div>
      <div className="flex space-x-3 w-full">
        <div className="w-1/6">
          <Label>Test Id</Label>
          <Input
            type="text"
            placeholder="Enter Test Id"
            value={TestId?.toString()}
            onChange={(e) =>
              setTestId(e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
        <div className="w-2/6">
          <Label>Test Name</Label>
          <Input
            type="text"
            placeholder="Enter Test Name"
            value={TestName?.toString()}
            onChange={(e) =>
              SetTestName(e.target.value ? e.target.value : null)
            }
          />
          {filteredTests.length > 0 && TestName && (
            <div className="absolute z-10  mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-y-auto">
               {filteredTests && (
           filteredTests.map((test:Test)=>(
            <div className="p-2 text-sm hover:bg-blue-100 cursor-pointer " key={test.test_id} onClick={()=>{
              setTestId(test.test_id);
              SetTestName(test.test_name);
              SetFilteredTests([]);
            }}><strong>Test Name:</strong>{test.test_name} <strong>Test Description: </strong>{test.description}  <strong>Test Price: </strong>{test.price}</div>
           ))
          )}
            </div>
          )}

           
        </div>
      </div>
      <Card  className="mt-4 ">
        <form className="grid grid-cols-4 space-x-4 space-y-2">
        {testParameters.map((parameter:TestParameters,index)=>(
          <div key={parameter.parameter_id}>
            <Label>{parameter.parameter_name}</Label>
            <Input type={parameter.input_type} placeholder={parameter.parameter_name} 
                {...register(parameter.parameter_name)}    
            ></Input>
            
          </div>
        ))}
        </form>
      </Card>
      <Button className="mt-5" onClick={handleSubmit(saveTestResults)}>Submit Results</Button>
    </div>
  );
}

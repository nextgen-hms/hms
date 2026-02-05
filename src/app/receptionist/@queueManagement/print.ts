//   <div
//             style={{ display: "none" }}
//               ref={contentRef}
//               className=" p-4 bg-white text-black w-[80mm]" // 80mm = receipt width
//             >
//               {/* Header */}
//               <div className="text-center border-b pb-2 mb-2">
//                 <h1 className="text-lg font-bold">🏥 Dr Bablu Clinic</h1>
//                 <p className="text-xs text-gray-600">Patient Queue Slip</p>
//               </div>

//               {/* Token Number Big */}
//               <div className="text-center my-4">
//                 <p className="text-sm font-semibold">Clinic No</p>
//                 <p className="text-4xl font-extrabold">{clinicNo}</p>
//               </div>

//               {/* Patient Info */}
//               <div className="text-sm space-y-1 flex flex-col items-center border-t">
//                 <p>
//                   <span className="font-semibold">Patient ID:</span> P000{pId}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Name:</span> {patientName}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Age/Gender:</span> {age} /{" "}
//                   {gender}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Visit Type:</span> {VisitType}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Reason:</span> {visitReason}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Doctor:</span>
//                   {doctors.find((d: any) => d.doctor_id === doctor)
//                     ?.doctor_name || "N/A"}
//                 </p>
//               </div>

//               {/* Footer */}
//               <div className="mt-4 text-center text-xs border-t pt-2">
//                 <p>Please present this slip at reception</p>
//                 <p suppressHydrationWarning>{new Date().toLocaleString()}</p>
//               </div>
//             </div>
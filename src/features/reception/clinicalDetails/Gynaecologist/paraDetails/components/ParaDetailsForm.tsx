// features/reception/patientRegistration/obstetricHistory/components/ParaDetailsForm.tsx

"use client";
import { useFieldArray } from "react-hook-form";
import { useParaDetails } from "../hooks/useParaDetails";

export default function ParaDetailsForm() {
  const { methods, control, addPara, updateParaData, obstetricHistoryId } = useParaDetails();
  const { register, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: "para" });

  return (
    <form>
      <div className="col-span-2 flex px-4 mt-4">
        <h1 className="text-2xl pl-2 font-semibold rounded-2xl border-black/30 w-[60%] text-black/70">
          Para Details
        </h1>
        <h1>obstetric_history_id: {obstetricHistoryId}</h1>
        <div className="w-full flex space-x-2.5">
          <button
            type="button"
            className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            onClick={() =>
              append({
                obstetric_history_id: "",
                para_number: "",
                birth_year: "",
                birth_month: "",
                gender: "Male",
                delivery_type: "Normal",
                alive: "true",
                birth_weight_grams: "",
                complications: "",
                notes: "",
                gestational_age_weeks: "",
              })
            }
          >
            Add Para
          </button>
          <button
            type="button"
            className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            onClick={handleSubmit(addPara)}
          >
            Submit
          </button>
          <button
            type="button"
            className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            onClick={handleSubmit(updateParaData)}
          >
            Update Info
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-scroll h-[400px] custom-scrollbar">
        {fields.map((field, index) => (
          <div key={field.id} className="w-2/3 border-black/40 grid grid-cols-2 px-4 space-y-3">
            <div className="col-span-2">
              <h1 className="text-xl pl-2 font-semibold rounded-2xl border-black/30 w-[60%] text-black/70">
                Para No {index + 1}
              </h1>
            </div>
            <div className="flex flex-col">
              <label className="px-2 pb-1 text-sm text-black/70">Birth Year :</label>
              <input
                className="w-[80%] p-2 bg-gray-200 rounded-2xl text-black/50"
                {...register(`para.${index}.birth_year`)}
                type="text"
                placeholder="Enter Birth Year"
              />
              <input {...register(`para.${index}.para_number`)} defaultValue={index + 1} type="hidden" />
            </div>

            <div className="flex flex-col">
              <label className="px-2 pb-1 text-sm text-black/70">Birth Month:</label>
              <input
                type="text"
                placeholder="Birth Month"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register(`para.${index}.birth_month`)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm px-2 pb-1 text-black/70">Gender :</label>
              <select className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black" {...register(`para.${index}.gender`)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm px-2 pb-1 text-black/70">Delivery Type :</label>
              <select
                className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black"
                {...register(`para.${index}.delivery_type`)}
              >
                <option value="Normal">Normal</option>
                <option value="C-Section">C-Section</option>
                <option value="AssistedVD">Assisted Vd</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm px-2 pb-1 text-black/70">Alive :</label>
              <select className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black" {...register(`para.${index}.alive`)}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="px-2 pb-1 text-sm text-black/70">Birth Weight in grams:</label>
              <input
                type="text"
                placeholder="Birth Weight in grams"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register(`para.${index}.birth_weight_grams`)}
              />
            </div>

            <div className="flex flex-col">
              <label className="px-2 pb-1 text-sm text-black/70">Gestational age weeks:</label>
              <input
                type="text"
                placeholder="Gestational age weeks"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register(`para.${index}.gestational_age_weeks`)}
              />
            </div>

            <div className="flex flex-col">
              <label className="px-2 pb-1 text-sm text-black/70">Complications:</label>
              <input type="text" placeholder="Enter Complications" className="w-[80%] p-2 bg-gray-200 rounded-2xl" {...register(`para.${index}.complications`)} />
            </div>

            <div className="flex flex-col col-span-2">
              <label className="px-2 pb-1 text-sm text-black/70">Notes:</label>
              <textarea placeholder="Any complications, e.g., NICU stay, congenital anomaly" className="w-[80%] p-2 bg-gray-200 rounded-2xl" {...register(`para.${index}.notes`)} />
            </div>

            <button className="bg-gradient-to-r w-[40%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl" type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </form>
  );
}

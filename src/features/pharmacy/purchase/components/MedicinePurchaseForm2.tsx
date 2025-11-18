"use client"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";

// ------------------ Zod Schema ------------------
const PurchaseSchema = z.object({
  party: z.string().min(1, "Please select a party"),
  medicine: z.string().min(1, "Please select a medicine"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  sub_quantity: z.number().min(0, "Sub quantity cannot be negative"),
  unit_cost: z.number().min(0, "Unit cost must be positive"),
  sub_unit_cost: z.number().min(0, "Sub unit cost must be positive"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  batch_no: z.string().min(1, "Batch number is required"),
});

export default function MedicinePurchase() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PurchaseSchema),
  });

  const onSubmit = (data:any) => {
    console.log("Form Data:", data);
    //call purhase medicine api
  };

  return (
    <div className="border-3 h-full w-full pt-2 space-y-6">
      <h1 className="text-4xl text-center font-bold">Medicine Purchase</h1>

      {/* Party */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1 w-full">
            <Label>Party :</Label>
            <Input placeholder="Select The Party" {...register("party")} />
            {errors.party && (
              <p className="text-red-500 text-sm">{errors.party.message}</p>
            )}
          </div>
          <Button type="button" className="h-fit">Add Party</Button>
        </div>

        {/* Medicine */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1 w-full">
            <Label>Medicine :</Label>
            <Input placeholder="Select Medicine" {...register("medicine")} />
            {errors.medicine && (
              <p className="text-red-500 text-sm">{errors.medicine.message}</p>
            )}
          </div>
          <Button type="button" className="h-fit">Add Medicine</Button>
        </div>

        {/* Quantity */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-full">
            <Label>Quantity :</Label>
            <Input
              type="number"
              placeholder="Enter Quantity"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label>Sub Quantity :</Label>
            <Input
              type="number"
              placeholder="Enter Sub Quantity"
              {...register("sub_quantity", { valueAsNumber: true })}
            />
            {errors.sub_quantity && (
              <p className="text-red-500 text-sm">{errors.sub_quantity.message}</p>
            )}
          </div>
        </div>

        {/* Unit Costs */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-full">
            <Label>Unit Cost :</Label>
            <Input
              type="number"
              placeholder="Enter The Unit Cost"
              {...register("unit_cost", { valueAsNumber: true })}
            />
            {errors.unit_cost && (
              <p className="text-red-500 text-sm">{errors.unit_cost.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label>Sub Unit Cost :</Label>
            <Input
              type="number"
              placeholder="Enter The Sub Unit Cost"
              {...register("sub_unit_cost", { valueAsNumber: true })}
            />
            {errors.sub_unit_cost && (
              <p className="text-red-500 text-sm">{errors.sub_unit_cost.message}</p>
            )}
          </div>
        </div>

        {/* Expiry & Batch */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-full">
            <Label>Expiry Date :</Label>
            <Input
              type="date"
              {...register("expiry_date")}
            />
            {errors.expiry_date && (
              <p className="text-red-500 text-sm">{errors.expiry_date.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label>Batch No :</Label>
            <Input placeholder="Enter The Batch Number" {...register("batch_no")} />
            {errors.batch_no && (
              <p className="text-red-500 text-sm">{errors.batch_no.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full mt-4">Save Purchase</Button>
      </form>
    </div>
  );
}
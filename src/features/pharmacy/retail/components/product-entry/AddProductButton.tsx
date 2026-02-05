import React from "react";

export default function AddProductButton({handleSearchSelected}:{handleSearchSelected:()=> void}) {


    const handleClick=(e:React.MouseEvent<HTMLButtonElement>)=>{
        handleSearchSelected();
    }
  return (
    <div>
      <button className="bg-green-300 p-2 rounded-2xl px-4" onClick={handleClick}>Add Product</button>
    </div>
  );
}

export function InputLabel({type,placeholder,id}:{type:string,placeholder:string,id:string}){
    return(
        
      <div className="relative">
           <input type={type}
             placeholder=" "
             className="border-2 rounded-md border-black/60 p-2 peer "
             id={id}
           />
           <label 
           htmlFor={id}
           className="
           absolute left-3 -top-2 bg-white  px-1 text-sm
           peer-placeholder-shown:top-3
           peer-placeholder-shown:text-base
           peer-focus:text-sm
           peer-focus:-top-2
           transition-all
           "
           >
            {placeholder}
           </label>
      </div>
    )
}
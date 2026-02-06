import { Plus } from "lucide-react";

export default function AddProductButton({ handleSearchSelected }: { handleSearchSelected: () => void }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleSearchSelected();
  }

  return (
    <button
      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 group"
      onClick={handleClick}
    >
      <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
        <Plus size={16} strokeWidth={3} />
      </div>
      ADD TO BILL
    </button>
  );
}

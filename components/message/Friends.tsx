import { useState, FormEvent } from "react";
import { BiSearch } from "react-icons/bi";

export default function Friend() {
  const [input, setInput] = useState("");

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-600">
      <p className="text-xl">Friends</p>
      <form
        className="bg-gray-600 rounded mr-5 mt-3 items-center hidden md:flex"
        onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
      >
        <button type="submit" className="px-2">
          <BiSearch className="h-5 w-5 text-gray-800" />
        </button>
        <input
          placeholder="Search"
          className="text-gray-300 bg-gray-600 py-1 rounded outline-none border-none"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
      </form>
    </div>
  );
}

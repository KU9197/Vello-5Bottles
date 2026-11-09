import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";

export interface Bottle {
  id: number;
  product_name: string;
  price: string | number;
}

interface CellProps {
  chair: Bottle;
  image: string;
  userId: string;
}

const Cell: React.FC<CellProps> = ({ chair, image, userId }) => {
  const [mode, setMode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setMode(searchParams.get("mode"));
  }, []);

  const handleClick = (): void => {
    // Do not let unavailable session storage prevent the product route from opening.
    let productIdSequence: number[] = [];
    try {
      const storedSequence = JSON.parse(sessionStorage.getItem("shuffledIDs") ?? "[]");
      if (Array.isArray(storedSequence)) productIdSequence = storedSequence;
    } catch (error) {
      console.warn("Unable to read shuffled bottle order:", error);
    }

    let versions: (boolean | null | undefined)[] = [];
    try {
      const storedVersions = JSON.parse(sessionStorage.getItem("productdetailsVersion") ?? "[]");
      if (Array.isArray(storedVersions)) versions = storedVersions;
    } catch (error) {
      console.warn("Unable to read product detail versions:", error);
    }

    const index = productIdSequence.indexOf(Number(chair.id));
    let version = index >= 0 && versions[index] === true;

    // Preserve the alternating good/bad presentation assignment when storage works.
    if (index >= 0 && typeof versions[index] !== "boolean") {
      try {
        const lastValueRaw = sessionStorage.getItem("lastValue");
        const lastValue = lastValueRaw === null ? Math.random() < 0.5 : lastValueRaw === "true";
        version = !lastValue;
        versions[index] = version;
        sessionStorage.setItem("productdetailsVersion", JSON.stringify(versions));
        sessionStorage.setItem("lastValue", String(version));
      } catch (error) {
        console.warn("Unable to save product detail version:", error);
      }
    }

    // Navigate immediately; slow/unavailable Firestore must not block product loading.
    const query = new URLSearchParams({
      mode: mode ?? "",
      product_id: String(chair.id),
      userId,
    });
    navigate(`/product?${query.toString()}`);

    if (userId) {
      void setDoc(
        doc(db, "users", userId),
        {
          "Clicked Shop Now": arrayUnion(`${chair.product_name} ${new Date().toISOString()}`),
        },
        { merge: true }
      ).catch((error) => {
        console.error("Unable to save Shop Now interaction:", error);
      });
    }
  };

  return (
    <div
      className="border-[1px] border-[#FCE698] rounded-[2px] w-[270px] min-h-[420px] p-[10px] mt-[80px] flex flex-col items-center text-center transition-transform duration-500 hover:scale-110 shadow-inner shadow-[inset_0_0_0_1px_rgba(252,230,152,1)]"
    >
      <figure className="w-[70%] h-[70%] aspect-[4/3]">
        <img
          src={image}
          alt={chair.product_name}
          className="object-contain w-full h-full mx-auto"
        />
      </figure>

      <p className="text-[22px] font-bold mb-1 font-round text-[#364F6B]">
        {chair.product_name}
      </p>
      <p className="text-[20px] font-bold text-black mb-1">{chair.price}</p>
      <p className="text-[17px] font-semibold text-[#364F6B] mb-3">20 oz capacity</p>

      <button
        onClick={handleClick}
        className="bg-[#364F6B] text-white font-bold text-[20px] px-[4px] py-[2px] hover:bg-[#FCE698] hover:text-[#364F6B] hover:text-[18px] transition-colors mb-[10px]"
      >
        Shop now
      </button>
    </div>
  );
};

export default Cell;

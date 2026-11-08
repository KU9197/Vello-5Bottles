import React, { useEffect } from 'react';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { BsDot } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, arrayUnion } from '@firebase/firestore';
import { db } from '../services/firebase';
import { TimeData } from '../types/types';

interface ProductDisplayProps {
  product: { id: string; product_name: string; farbe: string; price?: string | number };
  userId: string;
  mode?: string;
  timeData: TimeData;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  userId,
  mode,
  timeData,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    let productIdSequence: number[] = [];
    let productDetailsVersion: (boolean | null)[] = [];

    try {
      const storedSequence = JSON.parse(sessionStorage.getItem('shuffledIDs') ?? '[]');
      if (Array.isArray(storedSequence)) productIdSequence = storedSequence;
    } catch (error) {
      console.error('Unable to read shuffled product order:', error);
    }

    try {
      const storedVersions = JSON.parse(sessionStorage.getItem('productdetailsVersion') ?? '[]');
      if (Array.isArray(storedVersions)) productDetailsVersion = storedVersions;
    } catch (error) {
      console.error('Unable to read product detail versions:', error);
    }

    const shuffledIndex = productIdSequence.indexOf(Number(product.id));
    const versionValue = productDetailsVersion[shuffledIndex] === true ? 'true' : 'false';
    const query = new URLSearchParams({
      mode: mode ?? '',
      product_id: product.id,
      userId,
      isV: versionValue,
    });

    // Navigate immediately so a slow or unavailable mobile connection to Firestore
    // cannot leave the user stuck on the product page.
    navigate(`/product/moreinfo?${query.toString()}`);

    void setDoc(
      doc(db, 'users', userId),
      {
        'Clicked More Information': arrayUnion(`${product.product_name} ${new Date().toISOString()}`),
        'Time Spent on Presentation Section': arrayUnion(timeData.productName ? timeData : 'Mobile view'),
      },
      { merge: true },
    ).catch((error) => {
      console.error('Unable to save product information interaction:', error);
    });
  };

  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <section className="relative items-center p-2.5 mr-2.5 flex flex-col justify-around ">
      <h2 className="mb-4 text-center font-bold underline decoration-4 decoration-primary-blue text-[28px] text-primary-blue">
        Features
      </h2>

      <div className="space-y-4 items-center text-[25px] font-fira-sans mb-10 mt-10">
        {[
          { label: `Price: ${product.price ?? '$19.99'}`, key: 'price' },
          { label: `Color: ${product.farbe}`, key: 'color' },
        ].map(({ label, key }) => (
          <li
            key={key}
            className="flex items-center font-round font-bold text-[18px]"
          >
            <BsDot className="mr-2" /> {label}
          </li>
        ))}

        <button
          onClick={handleClick}
          className="mt-4 flex items-center gap-2 bg-white px-4 py-4 font-bold text-[16px] 
              hover:shadow-[0px_1px_4px_rgba(0,0,0,0.16)] 
              hover:scale-[0.96] 
              transition-transform duration-150 "
        >
          <AiOutlineArrowRight /> MORE INFORMATION
        </button>
      </div>
    </section>
  );
};

export default ProductDisplay;

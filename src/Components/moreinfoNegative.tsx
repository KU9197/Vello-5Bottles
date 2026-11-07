// MoreinfoNegative.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactGA from "react-ga4";
import SecondHeader from "./SecondHeader";
import Footer from "./Footer";
import data from "../data/product_data";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";
import { Product } from "../types/types";

const MoreinfoNegative: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.href,
      title: "MoreInfo Page",
    });
  }, []);

  const params = new URLSearchParams(window.location.search);
  const product =
    data.find((p: Product) => String(p.id) === params.get("product_id")) ?? null;

  const userId = params.get("userId") ?? "";
  const version = params.get("isV");

  const startRef = useRef<number>(Date.now());
  const initialRef = useRef<number>(0);

  const DETAILS_TOTAL_ALL_KEY = "timeSpentOnProductDetailsPage_all";
  const perKey = product
    ? `timeSpentOnProductDetailsPage_${product.product_name}`
    : null;

  useEffect(() => {
    if (!product || !perKey) return;

    startRef.current = Date.now();
    initialRef.current = Number(sessionStorage.getItem(perKey) ?? "0") || 0;
  }, [product, perKey]);

  useEffect(() => {
    return () => {
      if (!product || !perKey) return;

      const elapsed = (Date.now() - startRef.current) / 1000;
      if (!Number.isFinite(elapsed) || elapsed < 0) return;

      sessionStorage.setItem(perKey, String(initialRef.current + elapsed));

      const prevAll =
        Number(sessionStorage.getItem(DETAILS_TOTAL_ALL_KEY) ?? "0") || 0;
      sessionStorage.setItem(DETAILS_TOTAL_ALL_KEY, String(prevAll + elapsed));
    };
  }, [product, perKey]);

  const [open, setOpen] = useState({
    insulation: false,
    dishwasher: false,
    wall: false,
    material: false,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  const logBuyNow = async (payload: string) =>
    setDoc(
      doc(db, "users", userId),
      { "Clicked Jetzt Kaufen": arrayUnion(payload) },
      { merge: true }
    );

  const logFeature = async (feature: string) =>
    setDoc(
      doc(db, "users", userId),
      { "Clicked Feature": arrayUnion(`${feature} ${new Date().toISOString()}`) },
      { merge: true }
    );

  if (!product) return <div>Loading…</div>;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <SecondHeader
          userId={userId}
          product_id={params.get("product_id") ?? ""}
          version={version ?? undefined}
          onClickJetztKaufen={logBuyNow}
          timeData={{}}
        />
      </div>

      <main
        id="top"
        className="mt-20 px-10 mb-10 flex flex-col items-center text-center"
      >
        <h1 className="text-primary-blue text-[32px] font-bold my-8">
          Product Details
        </h1>

        <FeatureBlock
          title="Insulation: not present"
          open={open.insulation}
          toggle={() => {
            toggle("insulation");
            logFeature("Insulation");
          }}
        >
          The bottle does not feature built-in insulation. Beverages therefore tend to lose their temperature more quickly compared to insulated bottles.
        </FeatureBlock>

        <FeatureBlock
          title="Dishwasher-proof: no"
          open={open.dishwasher}
          toggle={() => {
            toggle("dishwasher");
            logFeature("Dishwasher-proof");
          }}
        >
          The bottle is not dishwasher-safe and should be cleaned only by hand. Dishwasher use may damage the bottle's finish or compromise its appearance over time.
        </FeatureBlock>

        <FeatureBlock
          title="Wall construction: single-wall medium leak-proof design"
          open={open.wall}
          toggle={() => {
            toggle("wall");
            logFeature("Wall construction");
          }}
        >
          The bottle features a single-wall construction. This construction provides a lower level of leak protection.
        </FeatureBlock>

        <FeatureBlock
          title="Material: standard steel"
          open={open.material}
          toggle={() => {
            toggle("material");
            logFeature("Material");
          }}
        >
          The bottle is made of standard steel. This material is less durable and does not provide protection against scratches.
        </FeatureBlock>
      </main>

      <Footer />
    </>
  );
};

export default MoreinfoNegative;

interface FeatureProps {
  title: string;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}

const FeatureBlock: React.FC<FeatureProps> = ({ title, open, toggle, children }) => {
  return (
    <div className="w-full max-w-2xl py-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-start justify-between gap-4 text-left text-primary-blue text-xl font-semibold"
      >
        <span className="flex-1 text-center leading-snug">{title}</span>

        <span className="shrink-0 pt-1">
          {open ? <AiOutlineUp size={22} /> : <AiOutlineDown size={22} />}
        </span>
      </button>

      <p className={`${open ? "block mt-3" : "hidden"} text-black text-lg`}>
        {children}
      </p>
    </div>
  );
};

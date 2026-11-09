import React, { useState, useEffect, useMemo, useCallback } from "react";
import product_card from "../data/product_data";
import ProductDisplay from "../Components/ProductDisplay";
import Footer from "../Components/Footer";
import SecondHeader from "../Components/SecondHeader";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";
import { Product, TimeData } from "../types/types";

const SingleProduct: React.FC = () => {
  const product_id = Number(
    new URLSearchParams(window.location.search).get("product_id")
  );
  const [mode, setMode] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [pageStartTime, setPageStartTime] = useState<number>(0);
  const [initialTimeSpent, setInitialTimeSpent] = useState<number>(0);

  const [upperSectionStart, setUpperSectionStart] = useState<number | null>(null);
  const [timeSpentUpper, setTimeSpentUpper] = useState<number>(0);
  const [timeData, setTimeData] = useState<TimeData | null>(null);

  const AWAY_CTX_KEY = "timeSpentAwayCtx";
  const AWAY_TOTAL_ALL_KEY = "timeSpentAway_all";

  const getAwayTotalKeyForProduct = (productName: string) =>
    `timeSpentAway_${productName}`;

  const startAway = useCallback(() => {
    if (!product) return;

    if (sessionStorage.getItem(AWAY_CTX_KEY)) return;

    sessionStorage.setItem(
      AWAY_CTX_KEY,
      JSON.stringify({
        productId: product.id,
        productName: product.product_name,
        startedAt: Date.now(),
      })
    );
  }, [product]);

  const stopAwayAndAccumulate = useCallback(() => {
    const raw = sessionStorage.getItem(AWAY_CTX_KEY);
    if (!raw) return;

    let ctx: { productId: number; productName: string; startedAt: number } | null = null;
    try {
      ctx = JSON.parse(raw);
    } catch {
      ctx = null;
    }

    if (!ctx?.startedAt || !ctx.productName) {
      sessionStorage.removeItem(AWAY_CTX_KEY);
      return;
    }

    const deltaSec = (Date.now() - ctx.startedAt) / 1000;
    const perKey = getAwayTotalKeyForProduct(ctx.productName);
    const prevPer = Number(sessionStorage.getItem(perKey) ?? "0");
    sessionStorage.setItem(perKey, String(prevPer + deltaSec));

    const prevAll = Number(sessionStorage.getItem(AWAY_TOTAL_ALL_KEY) ?? "0");
    sessionStorage.setItem(AWAY_TOTAL_ALL_KEY, String(prevAll + deltaSec));
    sessionStorage.removeItem(AWAY_CTX_KEY);
  }, []);

  const version = useMemo(() => {
    const seen = sessionStorage.getItem("productdetailsVersion");
    const order = sessionStorage.getItem("shuffledIDs");
    if (!seen || !order || !product) return undefined;

    try {
      const seenArr = JSON.parse(seen) as (boolean | null | undefined)[];
      const orderArr = JSON.parse(order) as (number | string)[];
      const idx = orderArr.map(String).indexOf(String(product.id));
      return idx > -1 ? (seenArr[idx] ?? undefined) : undefined;
    } catch {
      return undefined;
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);

    setMode(params.get("mode"));
    setUserId(params.get("userId"));

    setPageStartTime(Date.now());

    const found = product_card.find((p) => p.id === product_id) as
      | Product
      | undefined;

    setProduct(found ?? null);

    if (found) {
      const prev = Number(
        sessionStorage.getItem(
          `timeSpentOnSingleProductPage_${found.product_name}`
        ) ?? "0"
      );
      setInitialTimeSpent(prev);
    }

    stopAwayAndAccumulate();
  }, [product_id, stopAwayAndAccumulate]);

  useEffect(() => {
    return () => {
      if (!product) return;

      const elapsed = (Date.now() - pageStartTime) / 1000;

      sessionStorage.setItem(
        `timeSpentOnSingleProductPage_${product.product_name}`,
        String(initialTimeSpent + elapsed)
      );
    };
  }, [pageStartTime, initialTimeSpent, product]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") startAway();
      if (document.visibilityState === "visible") stopAwayAndAccumulate();
    };

    const onPageHide = () => startAway();
    const onPageShow = () => stopAwayAndAccumulate();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [startAway, stopAwayAndAccumulate]);

  useEffect(() => {
    const upper = document.querySelector<HTMLDivElement>(".uppersection");
    const single =
      document.querySelector<HTMLDivElement>(".single-product-page");
    const header = document.querySelector<HTMLDivElement>(".secondHeader");

    const start = () => setUpperSectionStart(Date.now());
    const stop = () => {
      if (!upperSectionStart) return;
      const delta = (Date.now() - upperSectionStart) / 1000;
      setTimeSpentUpper((prev) => prev + delta);
    };

    if (upper) {
      upper.addEventListener("mouseenter", start);
      if (mode !== "1") upper.addEventListener("mouseleave", stop);
    }

    if (mode === "1" && single && header) {
      single.addEventListener("mouseenter", stop);
      header.addEventListener("mouseenter", stop);
    }

    return () => {
      upper?.removeEventListener("mouseenter", start);
      if (mode !== "1") upper?.removeEventListener("mouseleave", stop);

      if (mode === "1" && single && header) {
        single.removeEventListener("mouseenter", stop);
        header.removeEventListener("mouseenter", stop);
      }
    };
  }, [upperSectionStart, mode]);

  useEffect(() => {
    if (product) {
      setTimeData({
        productName: product.product_name,
        timeSpentInUpperSection: timeSpentUpper,
      });
    }
  }, [timeSpentUpper, product]);

  const handleJetztKaufenClick = async (log: string): Promise<void> => {
    if (!userId) return;

    try {
      await setDoc(
        doc(db, "users", userId),
        { "Clicked Jetzt Kaufen": arrayUnion(log) },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore error:", err);
    }
  };

  const get3DViewerUrl = useCallback(() => {
    if (!product?.src) return "";

    return (
      `${window.location.origin}/3dviewer` +
      `?src=${encodeURIComponent(product.src)}` +
      `&name=${encodeURIComponent(product.product_name)}`
    );
  }, [product]);

  const arViewerUrl =
    product?.arUrl ??
    `https://ar-chair-viewer-three.vercel.app/?model=${encodeURIComponent(
      product?.sku ?? ""
    )}`;

  const build3DLauncherSrcDoc = useCallback((url: string) => {
    return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        html, body { height: 100%; margin: 0; }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E6E8EA;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        }
        button {
          border: 0;
          border-radius: 8px;
          padding: 22px 24px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: #364F6B;
          cursor: pointer;
        }
        button:hover { filter: brightness(0.9); }
      </style>
    </head>
    <body>
      <button id="btn">Open 3D bottle view</button>
      <script>
        document.getElementById('btn').addEventListener('click', function () {
          window.open(${JSON.stringify(url)}, '_blank', 'noopener,noreferrer');
        });
      </script>
    </body>
  </html>`;
  }, []);

  if (!product) return <div>Loading…</div>;

  return (
    <section>
      <div className="secondHeader fixed top-0 left-0 w-full z-50">
        <SecondHeader
          userId={userId ?? ""}
          onClickJetztKaufen={handleJetztKaufenClick}
          product_id={String(product_id)}
          version={version}
          timeData={timeData ?? undefined}
        />
      </div>

      <div className="uppersection mt-20 pt-14">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-[50px] font-extrabold text-center text-primary-blue">
            {product.product_name}
          </h1>

          {mode === "2" ? (
            <div className="flex justify-center">
              <div className="mt-8 mb-12 w-[82%] max-w-md overflow-hidden rounded-2xl bg-[#E6E8EA] border border-[#D5D9DD] shadow-sm h-[240px]">
                <iframe
                  title="Open 3D Launcher"
                  srcDoc={build3DLauncherSrcDoc(get3DViewerUrl())}
                  className="w-full h-full"
                  onMouseDown={() => startAway()}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="mt-8 mb-12 w-[82%] max-w-md overflow-hidden rounded-2xl bg-[#E6E8EA] border border-[#D5D9DD] shadow-sm h-[240px] flex items-center justify-center">
                <a
                  href={arViewerUrl}
                  onClick={() => startAway()}
                  className="rounded-lg bg-[#364F6B] px-6 py-5 text-lg font-semibold text-white transition-colors hover:bg-[#2b4057]"
                >
                  Start AR experience
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="single-product-page">
        <ProductDisplay
          userId={userId ?? ""}
          product={{
            ...product,
            id: String(product.id),
            product_name: product.product_name,
            farbe: product.farbe,
          }}
          mode={mode ?? undefined}
          timeData={
            timeData ?? {
              productName: product.product_name,
              timeSpentInUpperSection: 0,
            }
          }
        />
      </div>

      <Footer />
    </section>
  );
};

export default SingleProduct;

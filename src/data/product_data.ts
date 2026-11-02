/** Product type shared across the app */
export interface Product {
  id: number;
  product_name: string;
  price: string;
  farbe: string;
  currency: string;
  thumb: string;
  sku: string;
  src: string;
  arUrl?: string;
  images?: string[];
}

const product_card: readonly Product[] = [
  {
    id: 1,
    product_name: "Aqua Flow",
    price: "$19.99",
    farbe: "White",
    currency: "USD",
    thumb: "./images/aqua_flow1.png",
    sku: "aquaflow",
    src: "https://aquaflow3d.vercel.app/",
    arUrl: "https://aquaflowar.vercel.app/",
  },
  {
    id: 2,
    product_name: "Hydro Peak",
    price: "$19.99",
    farbe: "Light green",
    currency: "USD",
    thumb: "./images/hydro_peak1.png",
    sku: "hydropeak",
    src: "https://hydropeak3d.vercel.app/",
    arUrl: "https://hydropeakar.vercel.app/",
  },
  {
    id: 3,
    product_name: "PureSip",
    price: "$19.99",
    farbe: "Black",
    currency: "USD",
    thumb: "./images/puresip1.png",
    sku: "puresip",
    src: "https://puresip3d.vercel.app/",
    arUrl: "https://puresipar.vercel.app/",
  },
  {
    id: 4,
    product_name: "Flint",
    price: "$19.99",
    farbe: "White",
    currency: "USD",
    thumb: "./images/flint1.png",
    sku: "flint",
    src: "https://flint3d.vercel.app/",
    arUrl: "https://flintar.vercel.app/",
  },
  {
    id: 5,
    product_name: "Oryn",
    price: "$19.99",
    farbe: "Green",
    currency: "USD",
    thumb: "./images/oryn1.png",
    sku: "oryn",
    src: "https://oryn3d.vercel.app/",
    arUrl: "https://orynar.vercel.app/",
  },
];

export default product_card;

/** Master copy – change once and every file stays in sync */
export interface Product {
  id: string | number; // ← works for both “123” and 123
  product_name: string;
  price: string;
  farbe: string;
  currency: string;
  thumb: string;
  sku: string;
  src: string;
  arUrl?: string;
}

export interface TimeData {
  productName: string;
  timeSpentInUpperSection: number;
  /** allow custom keys if you log more analytics later */
  [key: string]: unknown;
}

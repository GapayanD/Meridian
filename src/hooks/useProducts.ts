import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Mirror the DB shape (snake_case from Supabase)
export interface DBProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews_count: number;
  sold_count: number;
  description: string;
  variants: { type: string; options: string[] }[];
  is_flash_sale: boolean;
  stock: number;
  active: boolean;
}

interface UseProductsOptions {
  category?: string;
  search?: string;
  flashSaleOnly?: boolean;
  limit?: number;
}

interface UseProductsResult {
  products: DBProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(opts: UseProductsOptions = {}): UseProductsResult {
  const { category, search, flashSaleOnly, limit } = opts;
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (category) query = query.ilike('category', category);
    if (flashSaleOnly) query = query.eq('is_flash_sale', true);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    if (limit)  query = query.limit(limit);

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setProducts((data ?? []) as DBProduct[]);
    }
    setLoading(false);
  }, [category, search, flashSaleOnly, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

// ── Single product ─────────────────────────────────────────────────────────────
interface UseProductResult {
  product: DBProduct | null;
  loading: boolean;
  error: string | null;
}

export function useProduct(id: string | undefined): UseProductResult {
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setProduct(data as DBProduct);
        setLoading(false);
      });
  }, [id]);

  return { product, loading, error };
}

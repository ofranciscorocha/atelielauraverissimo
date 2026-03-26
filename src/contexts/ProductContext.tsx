import React, { createContext, useContext, useState, useEffect } from "react";
import { initialProducts, initialModels, type Product, type ProductModel } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  models: ProductModel[];
  addModel: (model: ProductModel) => Promise<void>;
  updateModel: (model: ProductModel) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Map DB row → ProductModel
function rowToModel(row: any): ProductModel {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    description: row.description ?? undefined,
    modelCategory: row.model_category ?? undefined,
    capacityVariants: row.capacity_variants ?? [],
  };
}

// Map DB row → Product
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    technique: row.technique ?? "",
    price: Number(row.price),
    category: row.category ?? "",
    modelId: row.model_id ?? "",
    collectionId: row.collection_id ?? undefined,
    image: row.image ?? "",
    images: row.images ?? [],
    inStock: row.in_stock,
    stock: row.stock,
    launchDate: row.launch_date ?? undefined,
    salesCount: row.sales_count ?? 0,
    colors: row.colors ?? [],
    reviews: row.reviews ?? [],
    observations: row.observations ?? undefined,
    variants: row.variants ?? [],
  };
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [models, setModels] = useState<ProductModel[]>(initialModels);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [modelsRes, productsRes] = await Promise.all([
          supabase.from("product_models").select("*").order("created_at"),
          supabase.from("products").select("*").order("created_at"),
        ]);

        if (cancelled) return;

        if (modelsRes.data && modelsRes.data.length > 0) {
          setModels(modelsRes.data.map(rowToModel));
        }
        if (productsRes.data && productsRes.data.length > 0) {
          setProducts(productsRes.data.map(rowToProduct));
        }
      } catch (err) {
        console.warn("Failed to load from Supabase, using local data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Products
  const addProduct = async (product: Product) => {
    setProducts((p) => [...p, product]);
    await supabase.from("products").upsert({
      id: product.id,
      name: product.name,
      description: product.description,
      technique: product.technique,
      price: product.price,
      category: product.category,
      model_id: product.modelId || null,
      collection_id: product.collectionId || null,
      image: product.image,
      images: product.images ?? [],
      in_stock: product.inStock,
      stock: product.stock,
      launch_date: product.launchDate || null,
      sales_count: product.salesCount,
      colors: product.colors ?? [],
      reviews: product.reviews ?? [],
      observations: product.observations || null,
      variants: product.variants ?? [],
    });
  };

  const updateProduct = async (product: Product) => {
    setProducts((p) => p.map((item) => (item.id === product.id ? product : item)));
    await supabase.from("products").upsert({
      id: product.id,
      name: product.name,
      description: product.description,
      technique: product.technique,
      price: product.price,
      category: product.category,
      model_id: product.modelId || null,
      collection_id: product.collectionId || null,
      image: product.image,
      images: product.images ?? [],
      in_stock: product.inStock,
      stock: product.stock,
      launch_date: product.launchDate || null,
      sales_count: product.salesCount,
      colors: product.colors ?? [],
      reviews: product.reviews ?? [],
      observations: product.observations || null,
      variants: product.variants ?? [],
      updated_at: new Date().toISOString(),
    });
  };

  const deleteProduct = async (id: string) => {
    setProducts((p) => p.filter((item) => item.id !== id));
    await supabase.from("products").delete().eq("id", id);
  };

  // Models
  const addModel = async (model: ProductModel) => {
    setModels((m) => [...m, model]);
    await supabase.from("product_models").upsert({
      id: model.id,
      name: model.name,
      image: model.image,
      description: model.description || null,
      model_category: model.modelCategory || null,
      capacity_variants: model.capacityVariants ?? [],
    });
  };

  const updateModel = async (model: ProductModel) => {
    setModels((m) => m.map((item) => (item.id === model.id ? model : item)));
    await supabase.from("product_models").upsert({
      id: model.id,
      name: model.name,
      image: model.image,
      description: model.description || null,
      model_category: model.modelCategory || null,
      capacity_variants: model.capacityVariants ?? [],
      updated_at: new Date().toISOString(),
    });
  };

  const deleteModel = async (id: string) => {
    setModels((m) => m.filter((item) => item.id !== id));
    await supabase.from("product_models").delete().eq("id", id);
  };

  return (
    <ProductContext.Provider value={{
      products, loading, addProduct, updateProduct, deleteProduct,
      models, addModel, updateModel, deleteModel,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be inside ProductProvider");
  return ctx;
};

import React, { createContext, useContext, useState } from "react";
import { initialProducts, initialModels, type Product, type ProductModel } from "@/data/products";

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  // Modelos (com capacidades)
  models: ProductModel[];
  updateModel: (model: ProductModel) => void;
  addModel: (model: ProductModel) => void;
  deleteModel: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [models, setModels] = useState<ProductModel[]>(initialModels);

  const addProduct = (product: Product) => setProducts((p) => [...p, product]);
  const updateProduct = (product: Product) =>
    setProducts((p) => p.map((item) => (item.id === product.id ? product : item)));
  const deleteProduct = (id: string) =>
    setProducts((p) => p.filter((item) => item.id !== id));

  const addModel = (model: ProductModel) => setModels((m) => [...m, model]);
  const updateModel = (model: ProductModel) =>
    setModels((m) => m.map((item) => (item.id === model.id ? model : item)));
  const deleteModel = (id: string) =>
    setModels((m) => m.filter((item) => item.id !== id));

  return (
    <ProductContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
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

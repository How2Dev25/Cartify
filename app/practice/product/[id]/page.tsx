"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import Modal from "../../component/productModal";


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function ProductDetailPage() {
  const { id } = useParams(); // 👈 get route param

  const [product, setProduct] = useState<Product | null>(null);
  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setProduct(data);
    };

    fetchProduct();
  }, [id]); // 👈 important dependency

  if (!product) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main>
    <div className="p-6 text-black">
      <img
        src={product.image_url}
        className="w-64 h-64 object-cover rounded mb-4"
      />
      <h1 className="text-2xl font-bold">{product.name}</h1>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => {
          setSelectProduct(product);
          setIsModalOpen(true);
        }
        }
        >View Details </button>

    </div>

    
        <Modal
        product={selectProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        >
        </Modal>

    </main>

    



  );
}
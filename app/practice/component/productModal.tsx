
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";


type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
}

type modalProps = {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}


export default function Modal ({ product, isOpen, onClose }: modalProps) {

    if (!isOpen || !product) return null;      

    return (
          <div className="fixed inset-0 flex items-center justify-center shadow-md  bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg text-black">
                <h2 className="text-xl font-bold mb-4">Product Details</h2>
                <img src={product.image_url} alt={product.name} className="w-32 h-32 object-cover mb-4" />
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>

    );
}
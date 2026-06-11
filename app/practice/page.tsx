"use client";


import { routes } from "@/app/routes";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import  Modal from "./component/modal";
import router from "next/router";           
import Link from "next/link";


export default function PracticePage() {
    


    // set the data type to match the users table in supabase
    interface Users { 
        id: string;
        email: string;
        first_name: string;
    }

    interface Product {
        id: string;
        name: string;
        description: string;
        price: number;
        image_url: string;
    }


    

//    create a state variable to hold the data from the users table
    const [data, setData] = useState<Users[]>([]);
    const [products, setProducts] = useState<Product[]>([]);


    // create a state variable to hold the selected user for the modal
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);

    // create a state variable to control the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {

            try {
                // fetch data from the users table in supabase
            const { data, error } = await supabase.from('users').select('*');

            if (error) {
                console.error(error);
                return;
            }

            setData(data);
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    // fetch data when the component mounts
        fetchData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // fetch data from the products table in supabase
                const { data, error } = await supabase.from('products').select('*');
        
                if (error) {
                    console.error(error);
                    return;
                }

                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <main className="p-4 min-h-screen bg-white flex gap-5">
            <div className="text-black w-1/2 justify-start items-center">
                 <h1 className="text-2xl font-bold mb-4">Practice Fetching Data</h1>
                 
                 {data.map(user => (
                    <div key={user.id} className="mb-2 p-2 border rounded">
                       
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>First Name:</strong> {user.first_name}</p>
                        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                            }}
                        >
                            View Details
                        </button>
                    </div>

                
                ))}
                <p>This page is for practicing data fetching from an API.</p>
                
            </div>

            <div className="w-1/2 text-black">
                <h2 className="text-xl font-bold mb-4">Products</h2>
                {products.map(product => (
                    <div key={product.id} className="mb-2 p-2 border rounded">
                        <p><strong>Name:</strong> {product.name}</p>
                        <p><strong>Description:</strong> {product.description}</p>
                        <p><strong>Price:</strong> ${product.price}</p>
                        <img src={product.image_url} alt={product.name} className="w-32 h-32 object-cover mt-2" />
                     <div className="mt-2">
                        <Link
                            href={`/practice/product/${product.id}`}
                            className="text-blue-500 hover:underline"
                        >
                            View Details
                        </Link>
                        </div>
                     </div>
                ))}
                <p>This section can be used to practice fetching product data from the products table in supabase.</p>
            </div>

            
            <Modal 
                user={selectedUser} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />


                

        </main>
    );
}

// app/admin/products/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { isAdmin } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import gsap from "gsap";

interface Product {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount: number;
  stock: number;
  status: string;
  category: string;
  image_url: string | null;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  images: string[];
  details: string[];
  sizes: string[];
  colors: string[];
  color_names: string[];
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "footwear", label: "Footwear" },
  { value: "accessories", label: "Accessories" },
  { value: "bags", label: "Bags" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
];

const availableSizesByCategory: Record<string, string[]> = {
  footwear: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  accessories: ["One Size"],
  bags: ["One Size"],
  electronics: ["One Size"],
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
};

const commonColors = [
  { value: "#1a1a18", label: "Black" },
  { value: "#f5f5f0", label: "White" },
  { value: "#f97316", label: "Orange" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#dc2626", label: "Red" },
  { value: "#16a34a", label: "Green" },
  { value: "#92400e", label: "Brown" },
  { value: "#be185d", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
  { value: "#b45309", label: "Tan" },
  { value: "#065f46", label: "Olive" },
  { value: "#be123c", label: "Berry" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    discount: "0",
    stock: "",
    category: "",
    is_new: false,
    is_featured: false,
    details: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    color_names: [] as string[],
  });
  const [tempDetail, setTempDetail] = useState("");
  const [tempColor, setTempColor] = useState({ value: "#1a1a18", label: "Black" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const deleteModalContentRef = useRef<HTMLDivElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isAdmin();
      if (!admin) {
        router.push("/");
      }
    };
    checkAdmin();
    fetchProducts();
  }, []);

  // Apply filters, search, and sorting whenever dependencies change
  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "stock-low":
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    document.getElementById('products-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("newest");
  };

  const generateProductId = () => {
    const prefix = "PRD";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    
    if (e.target.name === 'category' && value) {
      const categorySizes = availableSizesByCategory[value as keyof typeof availableSizesByCategory] || ["One Size"];
      setFormData(prev => ({
        ...prev,
        sizes: categorySizes,
      }));
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch('/api/upload/product', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setUploadingImage(false);
    } catch (error) {
      console.error('Error preparing image:', error);
      setError("Failed to prepare image");
      setUploadingImage(false);
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError("Please upload image files");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
    
    setUploadingImage(false);
    if (additionalImageInputRef.current) {
      additionalImageInputRef.current.value = '';
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const addDetail = () => {
    if (tempDetail.trim()) {
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, tempDetail.trim()]
      }));
      setTempDetail("");
    }
  };

  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (tempColor.label && !formData.colors.includes(tempColor.value)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, tempColor.value],
        color_names: [...prev.color_names, tempColor.label]
      }));
    }
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
      color_names: prev.color_names.filter((_, i) => i !== index)
    }));
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setMainImagePreview(product.image_url || null);
      setAdditionalImages(product.images || []);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        original_price: product.original_price?.toString() || "",
        discount: product.discount?.toString() || "0",
        stock: product.stock.toString(),
        category: product.category || "",
        is_new: product.is_new || false,
        is_featured: product.is_featured || false,
        details: product.details || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        color_names: product.color_names || [],
      });
    } else {
      setEditingProduct(null);
      setMainImagePreview(null);
      setAdditionalImages([]);
      setFormData({
        name: "",
        description: "",
        price: "",
        original_price: "",
        discount: "0",
        stock: "",
        category: "",
        is_new: false,
        is_featured: false,
        details: [],
        sizes: [],
        colors: [],
        color_names: [],
      });
      setTempDetail("");
      setTempColor({ value: "#1a1a18", label: "Black" });
    }
    setError("");
    setSuccess("");
    setShowModal(true);
    
    setTimeout(() => {
      if (modalContentRef.current) {
        gsap.fromTo(modalContentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.4)" }
        );
      }
    }, 0);
  };

  const closeModal = () => {
    if (modalContentRef.current) {
      gsap.to(modalContentRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 30,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowModal(false);
          setEditingProduct(null);
          setMainImagePreview(null);
          setAdditionalImages([]);
        }
      });
    } else {
      setShowModal(false);
    }
  };

  const openDeleteConfirm = (productId: string) => {
    setDeleteConfirm(productId);
    setTimeout(() => {
      if (deleteModalContentRef.current) {
        gsap.fromTo(deleteModalContentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.4)" }
        );
      }
    }, 0);
  };

  const closeDeleteConfirm = () => {
    if (deleteModalContentRef.current) {
      gsap.to(deleteModalContentRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 30,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setDeleteConfirm(null)
      });
    } else {
      setDeleteConfirm(null);
    }
  };

  const saveProduct = async () => {
    try {
      setError("");
      
      if (!formData.name || !formData.price || !formData.stock) {
        setError("Name, price, and stock are required");
        return;
      }

      const price = parseFloat(formData.price);
      const original_price = formData.original_price ? parseFloat(formData.original_price) : null;
      const stock = parseInt(formData.stock);
      const discount = parseInt(formData.discount) || 0;

      if (isNaN(price) || price < 0) {
        setError("Invalid price");
        return;
      }

      if (isNaN(stock) || stock < 0) {
        setError("Invalid stock quantity");
        return;
      }

      const status = stock === 0 ? "Out of Stock" : stock < 10 ? "Low Stock" : "Active";

      let mainImageUrl = null;
      const allImages: string[] = [];
      
      if (mainImagePreview && (!editingProduct || mainImagePreview !== editingProduct.image_url)) {
        if (mainImagePreview.startsWith('data:')) {
          const blob = await (await fetch(mainImagePreview)).blob();
          const file = new File([blob], 'main-image.jpg', { type: blob.type });
          mainImageUrl = await uploadImageToServer(file);
          allImages.push(mainImageUrl);
        } else {
          mainImageUrl = mainImagePreview;
          allImages.push(mainImagePreview);
        }
      } else if (editingProduct?.image_url) {
        mainImageUrl = editingProduct.image_url;
        allImages.push(editingProduct.image_url);
      }
      
      for (const img of additionalImages) {
        if (img.startsWith('data:')) {
          const blob = await (await fetch(img)).blob();
          const file = new File([blob], 'additional-image.jpg', { type: blob.type });
          const uploadedUrl = await uploadImageToServer(file);
          allImages.push(uploadedUrl);
        } else if (!allImages.includes(img)) {
          allImages.push(img);
        }
      }

      let sizes = formData.sizes;
      if (sizes.length === 0 && formData.category) {
        sizes = availableSizesByCategory[formData.category as keyof typeof availableSizesByCategory] || ["One Size"];
      }

      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: price,
        original_price: original_price,
        discount: discount,
        stock: stock,
        status: status,
        category: formData.category,
        is_new: formData.is_new,
        is_featured: formData.is_featured,
        updated_at: new Date().toISOString(),
        images: allImages,
        details: formData.details,
        sizes: sizes,
        colors: formData.colors,
        color_names: formData.color_names,
      };

      if (mainImageUrl) {
        productData.image_url = mainImageUrl;
      }

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;
        setSuccess("Product updated successfully!");
      } else {
        const productId = generateProductId();
        
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            product_id: productId,
            ...productData,
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
        setSuccess("Product created successfully!");
      }

      await fetchProducts();
      
      setTimeout(() => {
        closeModal();
        setSuccess("");
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.message);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) throw deleteError;

      setSuccess("Product deleted successfully!");
      closeDeleteConfirm();
      await fetchProducts();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Low Stock": return "bg-yellow-100 text-yellow-700";
      case "Out of Stock": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  const currentProducts = getCurrentPageItems();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <>
      <div className="space-y-6">
        {success && (
          <div className="success-message bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="error-message bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Products Catalog</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
              </div>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by product name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 text-black pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border text-black border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="stock-low">Stock: Low to High</option>
                </select>
              </div>
              
              {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
                <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Clear all filters
                </button>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length > 0 ? startIndex : 0} to {endIndex} of {filteredProducts.length} products
            </div>
          </div>

          <div className="overflow-x-auto" id="products-table">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.product_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {categories.find(c => c.value === product.category)?.label || product.category || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">₱{product.price.toFixed(2)}</div>
                      {product.original_price > 0 && (
                        <div className="text-xs text-gray-400 line-through">₱{product.original_price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_featured ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">Featured</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                        <button onClick={() => openDeleteConfirm(product.id)} className="text-red-600 hover:text-red-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Previous</button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => paginate(pageNum)} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{pageNum}</button>
                  );
                })}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Next</button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your filters</p>
              <button onClick={clearFilters} className="mt-4 text-orange-500 hover:text-orange-600 font-medium">Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div ref={modalRef} className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div ref={modalContentRef} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                  <p className="text-sm text-gray-500 mt-1">{editingProduct ? "Update product information" : "Create a new product"}</p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Images Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Product Images</label>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Main Image (Thumbnail)</p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                        {mainImagePreview ? <img src={mainImagePreview} alt="Main product" className="w-full h-full object-cover" /> : <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      </div>
                      <button onClick={() => mainImageInputRef.current?.click()} className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full shadow-lg hover:bg-orange-600 transition-colors" disabled={uploadingImage}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                      <input ref={mainImageInputRef} type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Additional Images (Gallery)</p>
                  <div className="flex flex-wrap gap-3">
                    {additionalImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden border border-gray-200"><img src={img} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" /></div>
                        <button onClick={() => removeAdditionalImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" /></svg></button>
                      </div>
                    ))}
                    <button onClick={() => additionalImageInputRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <input ref={additionalImageInputRef} type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} className="hidden" />
                  </div>
                </div>
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900" placeholder="Product name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900" placeholder="Product description" /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"><option value="">Select category</option>{categories.filter(c => c.value !== "all").map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900" placeholder="0" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900" placeholder="0.00" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₱)</label><input type="number" name="original_price" value={formData.original_price} onChange={handleInputChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900" placeholder="0.00" /></div>
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label><input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900" placeholder="0" /></div>

              {/* Product Details */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Product Features / Details</label>
  <div className="space-y-2">
    {formData.details.map((detail, idx) => (
      <div key={idx} className="flex items-center gap-2 group">
        <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{detail}</span>
        <button onClick={() => removeDetail(idx)} className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    ))}
    <div className="flex gap-2">
      <input 
        type="text" 
        value={tempDetail} 
        onChange={(e) => setTempDetail(e.target.value)} 
        onKeyPress={(e) => e.key === 'Enter' && addDetail()} 
        placeholder="e.g., Premium canvas upper" 
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900" 
      />
      <button onClick={addDetail} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
        Add
      </button>
    </div>
  </div>
</div>

              {/* Sizes */}
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>{formData.sizes.length > 0 ? (<div className="flex flex-wrap gap-2">{formData.sizes.map((size, idx) => (<span key={idx} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">{size}</span>))}</div>) : (<p className="text-sm text-gray-400 italic">Select a category to see available sizes</p>)}<p className="text-xs text-gray-500 mt-1">Sizes are automatically set based on category selection</p></div>

              {/* Colors */}
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Colors</label><div className="space-y-3"><div className="flex flex-wrap gap-3">{formData.colors.map((color, idx) => (<div key={idx} className="flex items-center gap-2 group"><div className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: color }} /><span className="text-sm text-gray-700">{formData.color_names[idx]}</span><button onClick={() => removeColor(idx)} className="text-red-500 hover:text-red-700 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" /></svg></button></div>))}</div><div className="flex gap-2"><select value={tempColor.value} onChange={(e) => { const selected = commonColors.find(c => c.value === e.target.value); if (selected) setTempColor(selected); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">{commonColors.map(color => (<option key={color.value} value={color.value}>{color.label}</option>))}</select><button onClick={addColor} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Add Color</button></div></div></div>

              <div className="flex gap-6"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleInputChange} className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer" /><span className="text-sm text-gray-700">Mark as New</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer" /><span className="text-sm text-gray-700">Feature this product</span></label></div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button onClick={saveProduct} disabled={uploadingImage} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{uploadingImage ? "Uploading..." : (editingProduct ? "Update Product" : "Create Product")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div ref={deleteModalRef} className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={(e) => { if (e.target === e.currentTarget) closeDeleteConfirm(); }}>
          <div ref={deleteModalContentRef} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4"><div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center"><svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div></div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex gap-3"><button onClick={closeDeleteConfirm} className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button><button onClick={() => deleteProduct(deleteConfirm)} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium shadow-md">Delete</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
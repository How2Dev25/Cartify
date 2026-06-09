// app/admin/users/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { isAdmin } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import gsap from "gsap";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar_url: string | null;
  created_at: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  orders_count?: number;
  total_spent?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer" as 'customer' | 'admin',
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Refs for GSAP animations
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const deleteModalContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isAdmin();
      if (!admin) {
        router.push("/");
      }
    };
    checkAdmin();
    fetchUsers();
  }, []);

  // Fetch all users with their order stats
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', user.id);

          if (ordersError) {
            return {
              ...user,
              orders_count: 0,
              total_spent: 0,
            };
          }

          const total_spent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          
          return {
            ...user,
            orders_count: orders?.length || 0,
            total_spent,
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB");
      return;
    }

    setUploadingAvatar(true);
    
    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (editingUser) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: base64 })
          .eq('id', editingUser.id);

        if (updateError) throw updateError;
        
        setSuccess("Avatar updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setError(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Open modal with GSAP animation
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setAvatarPreview(user.avatar_url || null);
      setFormData({
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        role: user.role,
        password: "",
      });
    } else {
      setEditingUser(null);
      setAvatarPreview(null);
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        role: "customer",
        password: "",
      });
    }
    setError("");
    setSuccess("");
    setShowModal(true);
    
    // GSAP entrance animation
    setTimeout(() => {
      if (modalContentRef.current) {
        gsap.fromTo(modalContentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.4)" }
        );
      }
    }, 0);
  };

  // Close modal with GSAP animation
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
          setEditingUser(null);
          setAvatarPreview(null);
          setFormData({
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            role: "customer",
            password: "",
          });
        }
      });
    } else {
      setShowModal(false);
      setEditingUser(null);
    }
  };

  // Open delete confirmation with animation
  const openDeleteConfirm = (userId: string) => {
    setDeleteConfirm(userId);
    setTimeout(() => {
      if (deleteModalContentRef.current) {
        gsap.fromTo(deleteModalContentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.4)" }
        );
      }
    }, 0);
  };

  // Close delete confirmation with animation
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

  // Save user
  const saveUser = async () => {
    try {
      setError("");
      
      if (!formData.email) {
        setError("Email is required");
        gsap.to(".error-message", { x: -5, duration: 0.05, repeat: 5, ease: "power1.inOut" });
        return;
      }
      
      if (!editingUser && !formData.password) {
        setError("Password is required for new users");
        gsap.to(".error-message", { x: -5, duration: 0.05, repeat: 5, ease: "power1.inOut" });
        return;
      }

      if (editingUser) {
        const updateData: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
        };

        if (avatarPreview && avatarPreview !== editingUser.avatar_url) {
          updateData.avatar_url = avatarPreview;
        }

        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (updateError) throw updateError;

        if (formData.password) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            editingUser.id,
            { password: formData.password }
          );
          if (authError) console.error('Error updating password:', authError);
        }

        setSuccess("User updated successfully!");
        gsap.fromTo(".success-message", 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(0.5)" }
        );
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('User creation failed');

        const insertData: any = {
          id: authData.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          created_at: new Date().toISOString(),
        };

        if (avatarPreview) {
          insertData.avatar_url = avatarPreview;
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert(insertData);

        if (insertError) throw insertError;
        
        setSuccess("User created successfully!");
        gsap.fromTo(".success-message", 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(0.5)" }
        );
      }

      await fetchUsers();
      
      setTimeout(() => {
        closeModal();
        setSuccess("");
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving user:', error);
      setError(error.message);
      gsap.to(".error-message", { x: -5, duration: 0.05, repeat: 5, ease: "power1.inOut" });
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) console.error('Error deleting auth user:', authError);

      setSuccess("User deleted successfully!");
      closeDeleteConfirm();
      await fetchUsers();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const getFullName = (user: User) => {
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || "N/A";
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    if (first && last) return `${first}${last}`.toUpperCase();
    if (first) return first.toUpperCase();
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Success/Error Messages with animations */}
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

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500 mt-1">Manage customers and administrators</p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold shadow-md">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={getFullName(user)} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(user)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{getFullName(user)}</p>
                          
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700' 
                          : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || "—"}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.orders_count || 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₱{(user.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(user.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div 
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 "
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div 
            ref={modalContentRef}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingUser ? "Update user information" : "Create a new user account"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-white">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : editingUser ? (
                      editingUser.avatar_url ? (
                        <img src={editingUser.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(editingUser)
                      )
                    ) : (
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full shadow-lg hover:bg-orange-600 transition"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition disabled:bg-gray-100 text-gray-900 placeholder-gray-400"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="+63 900 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? "New Password (optional)" : "Password *"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveUser}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-md"
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          ref={deleteModalRef}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 "
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteConfirm();
          }}
        >
          <div 
            ref={deleteModalContentRef}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete User</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
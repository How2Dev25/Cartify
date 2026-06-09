'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
  avatar_url: string | null;
  created_at: string;
  phone?: string;
  address?: string;
}

export default function RecentUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch users with role = 'customer'
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role, avatar_url, created_at, phone')
          .eq('role', 'customer')
          .order('created_at', { ascending: false })
          .limit(5);

        if (usersError) {
          console.error('Users fetch error:', usersError);
          throw usersError;
        }

        console.log('Found customers:', usersData);

        if (!usersData || usersData.length === 0) {
          console.log('No customers found with role=customer');
          setUsers([]);
          return;
        }

        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const getFullName = (user: User) => {
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || "N/A";
  };

  const getAvatarColor = (id: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
              <p className="text-sm text-gray-500 mt-1">Latest customer registrations</p>
            </div>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">View All →</button>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="flex items-center justify-center mb-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No customers found</p>
          <p className="text-sm text-gray-400 mt-2">Try adding a user with role='customer'</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
            <p className="text-sm text-gray-500 mt-1">Latest customer registrations</p>
          </div>
          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors">
            View All →
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={getFullName(user)}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-md ${getAvatarColor(user.id)}`}>
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-semibold text-gray-900">
                    {getFullName(user)}
                  </h4>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-orange-50 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
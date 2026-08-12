"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useToastStore } from "@/store/toastStore";
import { Loader2, Trash2 } from "lucide-react";
import { SkeletonTable } from "@/components/ui/SkeletonPresets";

interface PlatformUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin-portal/v1/settings/platform-users/");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      addToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Set up polling to refresh the list if a new user was added via modal
    const interval = setInterval(() => {
      fetchUsers();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user completely? This action cannot be undone.")) return;
    
    setIsDeletingId(id);
    try {
      await api.delete(`/admin-portal/v1/settings/platform-users/${id}/delete/`);
      addToast("User deleted successfully", "success");
      setUsers(users.filter(u => u.id !== id));
    } catch (error: any) {
      addToast(error.response?.data?.error || "Failed to delete user", "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) {
    return <SkeletonTable rows={6} cols={5} />;
  }

  return (
    <div className="overflow-x-auto border border-white/10 rounded-2xl">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="text-left p-4 font-semibold">User</th>
            <th className="text-left p-4 font-semibold">Email</th>
            <th className="text-left p-4 font-semibold">Role</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-right p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-background">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </span>
                  <span className="text-xs text-white/50">@{user.username}</span>
                </div>
              </td>
              <td className="p-4 text-white/70">{user.email}</td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={isDeletingId === user.id}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete User"
                >
                  {isDeletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-white/50">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

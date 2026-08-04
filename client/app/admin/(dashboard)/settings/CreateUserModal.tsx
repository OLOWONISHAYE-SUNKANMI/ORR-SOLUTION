"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { useToastStore } from "@/store/toastStore";
import { Loader2 } from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [roleType, setRoleType] = useState("consultant");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/admin-portal/v1/settings/platform-users/create/", {
        role_type: roleType,
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
      addToast(res.data.message || "User created successfully", "success");
      onClose();
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setRoleType("consultant");
    } catch (error: any) {
      addToast(error.response?.data?.error || "Failed to create user", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Create New User</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Role</label>
            <select
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              className="bg-background text-white p-3 rounded-lg border border-white/10"
              required
            >
              <option value="consultant">Consultant</option>
              <option value="pm">Project Manager</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-background text-white p-3 rounded-lg border border-white/10"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-background text-white p-3 rounded-lg border border-white/10"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background text-white p-3 rounded-lg border border-white/10"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

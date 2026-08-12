"use client";

import Link from "next/link";
import { useState } from "react";
import CreateUserModal from "./CreateUserModal";
import UserManagementTable from "./UserManagementTable";

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                + Add Platform User
              </button>
            </div>

            <form action="" className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-white">General</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Site Title</label>
                <input
                  type="text"
                  className="bg-background p-3 rounded-lg w-fit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Site Decription</label>
                <textarea className="bg-background p-3 rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Site Language</label>
                <input
                  type="text"
                  className="bg-background p-3 rounded-lg w-fit"
                />
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Platform Users
              </h2>
              <UserManagementTable />

              <h2 className="text-2xl font-semibold text-white">
                Integrations
              </h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Analytics Id</label>
                <input
                  type="text"
                  className="bg-background p-3 rounded-lg w-fit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Marketing Platform API Key</label>
                <textarea className="bg-background p-3 rounded-lg" />
              </div>

              <h2 className="text-2xl font-semibold text-white">Branding</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Logo URL</label>
                <input
                  type="text"
                  className="bg-background p-3 rounded-lg w-fit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">Favicon URL</label>
                <textarea className="bg-background p-3 rounded-lg" />
              </div>
            </form>
          </div>
        </div>
      </div>
      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

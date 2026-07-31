"use client";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

interface Country {
  name: { common: string };
  cca2: string;
}

export default function AccountSettingsPage() {
  const { profile, isLoading, isEditing, updateProfile, setEditing, fetchProfile } = useProfileStore();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [formData, setFormData] = useState(profile);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchCountries();
  }, [fetchProfile]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
      if (!response.ok) throw new Error('API down');
      const data = await response.json();
      const sortedCountries = data.sort((a: Country, b: Country) => 
        a.name.common.localeCompare(b.name.common)
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.warn('Using fallback country list due to fetch error:', error);
      setCountries([
        { name: { common: 'United States' }, cca2: 'US' },
        { name: { common: 'United Kingdom' }, cca2: 'GB' },
        { name: { common: 'Canada' }, cca2: 'CA' },
        { name: { common: 'Australia' }, cca2: 'AU' },
        { name: { common: 'Germany' }, cca2: 'DE' },
        { name: { common: 'France' }, cca2: 'FR' },
        { name: { common: 'Japan' }, cca2: 'JP' },
        { name: { common: 'India' }, cca2: 'IN' },
      ].sort((a, b) => a.name.common.localeCompare(b.name.common)));
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => {
    setFormData({...profile, email: user?.email || ''});
  }, [profile, user?.email]);

  const handleSave = async () => {
    await updateProfile(formData, profilePicFile || undefined);
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleImageUpload = (file: File) => {
    // Store file for backend upload
    setProfilePicFile(file);
    
    // Show immediate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setFormData({...formData, profile_pic: preview});
    };
    reader.readAsDataURL(file);
  };


  if (loadingCountries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-foreground/50 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-white px-4 sm:px-6 lg:px-12 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary">{interpolate(t.dashboard.account.settings.title)}</h1>
          <div className="w-full lg:w-auto lg:max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder={interpolate(t.dashboard.common.search)}
                className="w-full bg-card border border-secondary rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none text-foreground"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">🔍</button>
            </div>
          </div>
        </div>

        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">{interpolate(t.dashboard.account.settings.details)}</h2>
            <p className="text-sm text-gray-300">{interpolate(t.dashboard.account.settings.desc)}</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={handleCancel} className="px-4 sm:px-6 py-2 border border-gray-400 rounded-md text-sm sm:text-base">
                  {interpolate(t.dashboard.common.cancel)}
                </button>
                <button onClick={handleSave} disabled={isLoading} className="px-4 sm:px-6 py-2 bg-primary text-black rounded-md font-semibold disabled:opacity-50 text-sm sm:text-base">
                  {isLoading ? interpolate(t.dashboard.account.settings.saving) : interpolate(t.dashboard.common.save)}
                </button>
              </>
            ) : (
              <button onClick={handleEdit} className="px-4 sm:px-6 py-2 bg-primary text-black rounded-md font-semibold text-sm sm:text-base">
                {interpolate(t.dashboard.common.edit)}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row w-full gap-6 lg:gap-8">
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-secondary flex-1">
            <h3 className="text-lg font-semibold mb-6">{interpolate(t.dashboard.account.settings.personalInfo)}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.firstName)}</label>
                <input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.firstName)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.lastName)}</label>
                <input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.lastName)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.username)}</label>
                <input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.username)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.email)}</label>
                <input
                  value={user?.email || ''}
                  disabled={true}
                  className="w-full bg-card border border-secondary rounded-md px-4 py-3 text-sm focus:outline-none opacity-50 text-foreground cursor-not-allowed"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.email)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.country)}</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  disabled={!isEditing || loadingCountries}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                >
                  <option value="">{loadingCountries ? interpolate(t.dashboard.account.settings.placeholders.loadingCountries) : interpolate(t.dashboard.account.settings.placeholders.country)}</option>
                  {countries.map((country) => (
                    <option key={country.cca2} value={country.name.common}>{country.name.common}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.city)}</label>
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.city)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.zipCode)}</label>
                <input
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.zipCode)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.phoneNumber)}</label>
                <input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
                  placeholder={interpolate(t.dashboard.account.settings.placeholders.phoneNumber)}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.bio)}</label>
              <textarea
                value={formData.bio_text}
                onChange={(e) => setFormData({...formData, bio_text: e.target.value})}
                disabled={!isEditing}
                className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground min-h-[100px]"
                placeholder={interpolate(t.dashboard.account.settings.placeholders.bio)}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm mb-2">{interpolate(t.dashboard.account.settings.timezone)}</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                disabled={!isEditing}
                className="w-full bg-card border border-primary rounded-md px-4 py-3 text-sm focus:outline-none disabled:opacity-50 text-foreground"
              >
                <option value="">{interpolate(t.dashboard.account.settings.placeholders.timezone)}</option>
                <option value="UTC+00:00">UTC+00:00 (London, Dublin)</option>
                <option value="UTC+01:00">UTC+01:00 (Central European Time)</option>
                <option value="UTC+02:00">UTC+02:00 (Eastern European Time)</option>
                <option value="UTC-05:00">UTC-05:00 (Eastern Standard Time)</option>
                <option value="UTC-08:00">UTC-08:00 (Pacific Standard Time)</option>
              </select>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="w-full xl:w-80 xl:flex-shrink-0">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-secondary">
              <h3 className="text-lg font-semibold mb-4">{interpolate(t.dashboard.account.settings.photo.title)}</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-400 flex-shrink-0">
                  {formData.profile_pic ? (
                    <img src={formData.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xl">
                      {formData.first_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{interpolate(t.dashboard.account.settings.photo.edit)}</p>
                  {formData.profile_pic && (
                    <button 
                      onClick={() => setFormData({...formData, profile_pic: ''})}
                      disabled={!isEditing}
                      className="text-red-400 text-xs hover:text-red-300 disabled:opacity-50 mt-1"
                    >
                      {interpolate(t.dashboard.account.settings.photo.delete)}
                    </button>
                  )}
                </div>
              </div>

              <div className="border border-primary border-dashed rounded-xl h-32 sm:h-40 flex flex-col justify-center items-center text-center px-4 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={!isEditing || uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                ) : (
                  <>
                    <span className="text-primary text-2xl sm:text-3xl mb-2">⬆</span>
                    <p className="text-xs sm:text-sm text-gray-300">
                      {interpolate(t.dashboard.account.settings.photo.upload)}<br />
                      {interpolate(t.dashboard.account.settings.photo.formats)}<br />
                      <span className="hidden sm:inline">{interpolate(t.dashboard.account.settings.photo.maxSize)}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
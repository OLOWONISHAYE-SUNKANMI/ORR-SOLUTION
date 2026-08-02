"use client";

import React, { useState, useEffect } from "react";
import { Send, Briefcase, AlertCircle, Target, Tag, FileText, Paperclip, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRequestStore, CreateRequestPayload } from "@/store/requestStore";

// ── Field option maps (from PDF schema) ──

const REQUEST_TYPE_OPTIONS = [
  { value: "advice", label: "I need advice" },
  { value: "written_review", label: "I need a written review or report" },
  { value: "operational_problem", label: "I need help solving an operational problem" },
  { value: "compliance_regulatory", label: "I need compliance or regulatory support" },
  { value: "it_systems", label: "I need IT / systems support" },
  { value: "land_agriculture_environment", label: "I need land, agriculture, or environmental support" },
  { value: "ongoing_support", label: "I need ongoing support" },
  { value: "not_sure", label: "I am not sure" },
];

const SERVICE_AREA_OPTIONS = [
  { value: "strategy_advisory_compliance", label: "Strategy Advisory & Compliance" },
  { value: "operational_systems_infrastructure", label: "Operational Systems & Infrastructure" },
  { value: "living_systems_regeneration", label: "Living Systems Regeneration" },
  { value: "not_sure", label: "Not sure (Admin/PM will classify later)" },
];

const EXPECTED_SUPPORT_OPTIONS = [
  "Initial consultation", "Written advice", "Document review",
  "Technical review", "Compliance pathway", "Project planning",
  "Implementation support", "System setup", "Consultant matching",
  "Ongoing retainer support", "Other",
];

const EXPECTED_DELIVERABLE_OPTIONS = [
  "Meeting summary", "Advisory note", "Written report",
  "Technical specification", "Implementation plan", "Compliance review",
  "Risk assessment", "Project roadmap", "Client presentation",
  "Not sure", "Other",
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "priority", label: "Priority" },
  { value: "urgent", label: "Urgent" },
  { value: "critical", label: "Critical" },
];

const BUDGET_OPTIONS = [
  { value: "not_sure", label: "Not sure" },
  { value: "small_initial_review", label: "Small initial review only" },
  { value: "fixed_project_budget", label: "Fixed project budget" },
  { value: "retainer_support", label: "Retainer support" },
  { value: "prefer_to_discuss", label: "I prefer to discuss" },
];

const SECTOR_OPTIONS = [
  "Agriculture", "IT / Software", "Regulatory Affairs", "Environment",
  "Forestry", "Construction", "Finance", "Import / Export",
  "Immigration / Residency", "Healthcare", "Manufacturing", "Food",
  "Legal / Compliance", "Real estate / land", "Other",
];

const SENSITIVITY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "confidential", label: "Confidential" },
  { value: "highly_confidential", label: "Highly Confidential" },
  { value: "restricted", label: "Restricted / commercially sensitive" },
];

const NEXT_STEP_OPTIONS = [
  { value: "schedule_consultation", label: "Schedule a first consultation" },
  { value: "receive_feedback", label: "Receive initial feedback from ORR" },
  { value: "upload_documents", label: "Upload documents first" },
  { value: "discuss_pricing", label: "Discuss pricing" },
  { value: "not_sure", label: "I am not sure" },
];

const CONTACT_METHOD_OPTIONS = [
  "Portal message", "Email", "Phone", "Video meeting", "WhatsApp",
];

const LANGUAGE_OPTIONS = [
  "English", "Maltese", "Italian", "French", "Spanish", "Other",
];

// ── Form Data Interface ──

interface FormData {
  requestTitle: string;
  mainRequestType: string;
  orrServiceArea: string;
  shortDescription: string;
  desiredOutcome: string;
  backgroundContext: string;
  mainQuestion: string;
  currentChallenge: string;
  actionsTaken: string;
  decisionNeeded: string;
  expectedSupport: string[];
  expectedDeliverable: string[];
  urgency: string;
  targetDate: string;
  budgetExpectation: string;
  sector: string[];
  jurisdiction: string;
  location: string;
  hasDocuments: boolean;
  documents: { file: File; description: string }[];
  sensitivityLevel: string;
  confidentialityAgreed: boolean;
  preferredNextStep: string;
  preferredContactMethod: string[];
  preferredMeetingLanguage: string[];
  confirmAccuracy: boolean;
  confirmAuthority: boolean;
  confirmNoEmergency: boolean;
  aiProcessingNotice: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  requestTitle: "",
  mainRequestType: "",
  orrServiceArea: "",
  shortDescription: "",
  desiredOutcome: "",
  backgroundContext: "",
  mainQuestion: "",
  currentChallenge: "",
  actionsTaken: "",
  decisionNeeded: "",
  expectedSupport: [],
  expectedDeliverable: [],
  urgency: "",
  targetDate: "",
  budgetExpectation: "",
  sector: [],
  jurisdiction: "",
  location: "",
  hasDocuments: false,
  documents: [],
  sensitivityLevel: "",
  confidentialityAgreed: false,
  preferredNextStep: "",
  preferredContactMethod: [],
  preferredMeetingLanguage: [],
  confirmAccuracy: false,
  confirmAuthority: false,
  confirmNoEmergency: false,
  aiProcessingNotice: false,
};

// ── Helper to map form data → API payload ──

function formToPayload(formData: FormData): CreateRequestPayload {
  return {
    request_title: formData.requestTitle,
    main_request_type: formData.mainRequestType,
    orr_service_area: formData.orrServiceArea || undefined,
    short_description: formData.shortDescription,
    desired_outcome: formData.desiredOutcome,
    background_context: formData.backgroundContext || undefined,
    main_question: formData.mainQuestion || undefined,
    current_challenge: formData.currentChallenge || undefined,
    actions_taken: formData.actionsTaken || undefined,
    decision_needed: formData.decisionNeeded || undefined,
    expected_support: formData.expectedSupport,
    expected_deliverable: formData.expectedDeliverable,
    urgency: formData.urgency || undefined,
    target_date: formData.targetDate || null,
    budget_expectation: formData.budgetExpectation || undefined,
    sector: formData.sector,
    jurisdiction: formData.jurisdiction || undefined,
    location: formData.location || undefined,
    has_documents: formData.hasDocuments,
    sensitivity_level: formData.sensitivityLevel || undefined,
    confidentiality_agreed: formData.confidentialityAgreed,
    preferred_next_step: formData.preferredNextStep || undefined,
    preferred_contact_method: formData.preferredContactMethod,
    preferred_meeting_language: formData.preferredMeetingLanguage,
    confirm_accuracy: formData.confirmAccuracy,
    confirm_authority: formData.confirmAuthority,
    confirm_no_emergency: formData.confirmNoEmergency,
    ai_processing_notice: formData.aiProcessingNotice,
  };
}


export default function ClientProblemRequestForm() {
  const { user } = useAuthStore();
  const { createRequest, submitRequest, uploadDocuments, isSubmitting, currentRequest } = useRequestStore();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedRequestId, setSavedRequestId] = useState<string>("");
  const [savedPk, setSavedPk] = useState<number | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleNextOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    field: "expectedSupport" | "expectedDeliverable" | "sector" | "preferredContactMethod" | "preferredMeetingLanguage",
    value: string
  ) => {
    setFormData((prev) => {
      const currentList = prev[field];
      if (currentList.includes(value)) {
        return { ...prev, [field]: currentList.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentList, value] };
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files).map((file) => ({
        file,
        description: "",
      }));
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocs],
      }));
    }
    e.target.value = "";
  };

  const handleDocDescriptionChange = (index: number, description: string) => {
    setFormData((prev) => {
      const updated = [...prev.documents];
      updated[index].description = description;
      return { ...prev, documents: updated };
    });
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // ── Save as Draft ──
  const handleSaveDraft = async () => {
    const payload = formToPayload(formData);

    if (savedPk) {
      // Update existing draft
      const updated = await useRequestStore.getState().updateRequest(savedPk, payload);
      if (updated) {
        setSavedRequestId(updated.request_id);
      }
    } else {
      // Create new draft
      const created = await createRequest(payload);
      if (created) {
        setSavedRequestId(created.request_id);
        setSavedPk(created.id);

        // Upload documents if any
        if (formData.documents.length > 0) {
          const files = formData.documents.map((d) => d.file);
          const descriptions = formData.documents.map((d) => d.description);
          await uploadDocuments(created.id, files, descriptions);
        }
      }
    }
  };

  // ── Submit Request ──
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const payload = formToPayload(formData);
    let pk = savedPk;

    if (pk) {
      // Update existing draft before submitting
      await useRequestStore.getState().updateRequest(pk, payload);
    } else {
      // Create the request first
      const created = await createRequest(payload);
      if (!created) return;
      pk = created.id;
      setSavedPk(pk);
      setSavedRequestId(created.request_id);
    }

    // Upload documents if any
    if (formData.documents.length > 0 && pk) {
      const files = formData.documents.map((d) => d.file);
      const descriptions = formData.documents.map((d) => d.description);
      await uploadDocuments(pk, files, descriptions);
    }

    // Submit the request
    if (pk) {
      const submitted = await submitRequest(pk);
      if (submitted) {
        setSavedRequestId(submitted.request_id);
        setIsSuccess(true);
      }
    }
  };

  // ── Success State ──
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-10 p-8 bg-card border border-secondary rounded-2xl shadow-xl text-center"
      >
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/30 text-zinc-900 dark:text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Request Submitted Successfully!</h2>
        <p className="text-foreground opacity-60 mb-2">
          Your request has been securely logged with Reference ID: <strong className="text-foreground">{savedRequestId}</strong>
        </p>
        <p className="text-foreground opacity-60 mb-8">
          An Admin and Project Manager will review your brief shortly.
        </p>
        <button
          onClick={() => {
            setFormData(INITIAL_FORM_DATA);
            setSavedPk(null);
            setSavedRequestId("");
            setIsSuccess(false);
          }}
          className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-medium rounded-xl transition-colors"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  // ── Form UI ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-card border border-secondary rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8 border-b border-secondary bg-secondary/20">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Briefcase className="w-6 h-6 text-foreground" />
          Client Problem / Request Brief
        </h2>

        {/* System Linkage Display */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-foreground opacity-50 bg-card/50 p-3 rounded-lg border border-secondary inline-flex">
          <span className="flex items-center gap-1">Request ID: <strong className="text-foreground opacity-90">{savedRequestId || 'Will be generated on save'}</strong></span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="flex items-center gap-1">Submitted by: <strong className="text-foreground opacity-90">{user?.first_name} {user?.last_name}</strong></span>
        </div>
      </div>

      <form onSubmit={handleNextOrSubmit} className="p-8 space-y-6">

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center w-full">
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${currentStep === step ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : currentStep > step ? 'bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`w-full h-1 mx-2 sm:mx-4 rounded transition-colors ${currentStep > step ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center sm:text-left text-sm font-medium text-foreground opacity-70">
            Step {currentStep} of 5: {
              currentStep === 1 ? "Core Info" :
              currentStep === 2 ? "Problem Context" :
              currentStep === 3 ? "Scope & Domain" :
              currentStep === 4 ? "Docs & Comms" :
              "Declarations"
            }
          </div>
        </div>

        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Request Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground opacity-90 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            Give this request a short title
          </label>
          <input
            type="text"
            name="requestTitle"
            required
            value={formData.requestTitle}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
            placeholder='Example: "Need help entering the Italian market", "CRM process problem"'
          />
        </div>

        {/* Request Type & Service Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-90 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              What do you need ORR to help with?
            </label>
            <select
              name="mainRequestType"
              required
              value={formData.mainRequestType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select request type...</option>
              {REQUEST_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-90 flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-400" />
              Which ORR service area best fits?
              <span className="text-xs text-zinc-400 font-normal">(Optional)</span>
            </label>
            <select
              name="orrServiceArea"
              value={formData.orrServiceArea}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select service area...</option>
              {SERVICE_AREA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground opacity-90">
            Briefly describe the issue, objective, or problem you want ORR to assess.
          </label>
          <textarea
            name="shortDescription"
            required
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
            placeholder="Please provide the core details of your request. This will feed into our AI project summary generation..."
          />
        </div>

        {/* Desired Outcome */}
        <div className="space-y-2 pb-6 border-b border-secondary">
          <label className="text-sm font-medium text-foreground opacity-90 flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-400" />
            What outcome are you hoping to achieve?
          </label>
          <textarea
            name="desiredOutcome"
            required
            value={formData.desiredOutcome}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
            placeholder="Describe what success looks like (e.g., advice, decision support, implementation, compliance...)"
          />
        </div>

          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {/* --- PROBLEM DETAIL SECTION --- */}
        <div className="pt-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Problem Detail</h3>
          <div className="space-y-6">

            {/* Background / Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground opacity-90">
                Provide any background information that may help ORR understand the situation.
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <textarea
                name="backgroundContext"
                value={formData.backgroundContext}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
                placeholder="Background context..."
              />
            </div>

            {/* Main Question for ORR */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground opacity-90">
                If you could ask ORR one main question, what would it be?
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <textarea
                name="mainQuestion"
                value={formData.mainQuestion}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
                placeholder="Your main question..."
              />
            </div>

            {/* Current Challenge */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground opacity-90">
                What is currently blocking progress or creating difficulty?
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <textarea
                name="currentChallenge"
                value={formData.currentChallenge}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
                placeholder="What is the bottleneck or challenge..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Actions Already Taken */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-90">
                  Tell us what you have already tried, submitted, built, discussed, or decided.
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <textarea
                  name="actionsTaken"
                  value={formData.actionsTaken}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Previous actions..."
                />
              </div>

              {/* Decision Needed */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-90">
                  Is there a decision you need to make? If yes, describe it.
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <textarea
                  name="decisionNeeded"
                  value={formData.decisionNeeded}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Required decision..."
                />
              </div>
            </div>

          </div>
        </div>

          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {/* --- SCOPE & EXPECTATIONS SECTION --- */}
        <div className="pt-6 border-t border-secondary">
          <h3 className="text-lg font-semibold text-foreground mb-4">Scope & Expectations</h3>
          <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Expected Support */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground opacity-90">
                  What type of support do you expect from ORR?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-secondary rounded-xl bg-card/50">
                  {EXPECTED_SUPPORT_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={formData.expectedSupport.includes(opt)}
                        onChange={() => handleCheckboxChange("expectedSupport", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="text-sm text-foreground opacity-90">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expected Deliverable */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground opacity-90">
                  What would you like to receive from ORR?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-secondary rounded-xl bg-card/50">
                  {EXPECTED_DELIVERABLE_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={formData.expectedDeliverable.includes(opt)}
                        onChange={() => handleCheckboxChange("expectedDeliverable", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="text-sm text-foreground opacity-90">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Urgency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-90">
                  How urgent is this request?
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select urgency...</option>
                  {URGENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-90">
                  Target Date / Deadline
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Budget Expectation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-90">
                  Budget Expectation
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <select
                  name="budgetExpectation"
                  value={formData.budgetExpectation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select budget...</option>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* --- SECTOR & DOMAIN SECTION --- */}
        <div className="pt-6 border-t border-secondary">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sector & Domain</h3>
          <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground opacity-90">
                  Which sector or area does this request relate to?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-secondary rounded-xl bg-card/50">
                  {SECTOR_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={formData.sector.includes(opt)}
                        onChange={() => handleCheckboxChange("sector", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="text-sm text-foreground opacity-90">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Jurisdiction */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground opacity-90">
                    Country / Jurisdiction Involved
                    <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                  </label>
                  <input
                    type="text"
                    name="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
                    placeholder="e.g. United Kingdom, EU, Global"
                  />
                  <p className="text-xs text-foreground opacity-50 mt-1">
                    Enter multiple countries separated by commas if applicable.
                  </p>
                </div>

                {/* Location of Work / Asset */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground opacity-90">
                    Location of Work / Asset
                    <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
                    placeholder="Provide the location of the business, project, land..."
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {/* --- DOCUMENTS SECTION --- */}
        <div className="pt-6 border-t border-secondary">
          <h3 className="text-lg font-semibold text-foreground mb-4">Documents & Vault</h3>

          <div className="space-y-6">
            {/* Documents Available Toggle */}
            <div className="flex items-start justify-between p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="space-y-1 pr-4">
                <label className="text-sm font-medium text-foreground">
                  Do you have documents available?
                </label>
                <p className="text-xs text-foreground opacity-50">
                  Photos, screenshots, contracts, reports, or permits that may help ORR assess this request.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.hasDocuments}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasDocuments: e.target.checked }))}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.hasDocuments ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.hasDocuments ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-foreground opacity-90">
                    {formData.hasDocuments ? "Yes" : "No"}
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Document Upload */}
            {formData.hasDocuments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="border-2 border-dashed border-secondary rounded-xl p-6 text-center bg-card/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-zinc-900 dark:text-zinc-100 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Upload documents relevant to this request
                  </p>
                  <p className="text-xs text-foreground opacity-50 mb-4">
                    Files will be securely stored in your Client Vault and linked to this Request ID.
                  </p>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                    Browse Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {/* Uploaded Documents List */}
                {formData.documents.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-sm font-medium text-foreground opacity-90">Attached Files</h4>
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-card border border-zinc-200 dark:border-zinc-700 rounded-xl items-start sm:items-center">
                        <div className="flex-1 flex items-center gap-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100 shrink-0" />
                          <span className="text-sm text-foreground opacity-90 truncate font-medium">
                            {doc.file.name}
                          </span>
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Briefly describe this document..."
                            value={doc.description}
                            onChange={(e) => handleDocDescriptionChange(index, e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* --- COMMUNICATION SECTION --- */}
        <div className="pt-6 border-t border-secondary">
          <h3 className="text-lg font-semibold text-foreground mb-4">Communication</h3>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Preferred Contact Method */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground opacity-90">
                  How would you prefer ORR to contact you about this request?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 p-3 border border-secondary rounded-xl bg-card/50">
                  {CONTACT_METHOD_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input 
                        type="checkbox" 
                        checked={formData.preferredContactMethod.includes(opt)}
                        onChange={() => handleCheckboxChange("preferredContactMethod", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="text-sm text-foreground opacity-90">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Meeting Language */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground opacity-90">
                  Which language should be used for meetings or written communication?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 p-3 border border-secondary rounded-xl bg-card/50">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input 
                        type="checkbox" 
                        checked={formData.preferredMeetingLanguage.includes(opt)}
                        onChange={() => handleCheckboxChange("preferredMeetingLanguage", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="text-sm text-foreground opacity-90">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferred Next Step */}
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-foreground opacity-90">
                What would you prefer as the next step?
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <select 
                name="preferredNextStep"
                value={formData.preferredNextStep}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="" disabled>Select preferred next step...</option>
                {NEXT_STEP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {/* --- CONFIDENTIALITY SECTION --- */}
        <div className="pt-6 border-t border-secondary">
          <h3 className="text-lg font-semibold text-foreground mb-4">Confidentiality</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Sensitivity Level */}
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-foreground opacity-90">
                  How sensitive is this request?
                </label>
                <select 
                  name="sensitivityLevel"
                  required
                  value={formData.sensitivityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select sensitivity level...</option>
                  {SENSITIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Sensitive Information Notice */}
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                <div className="pt-0.5">
                  <input 
                    type="checkbox" 
                    required
                    checked={formData.confidentialityAgreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, confidentialityAgreed: e.target.checked }))}
                    className="w-5 h-5 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">
                    Sensitive Information Notice
                  </span>
                  <p className="text-sm text-foreground opacity-60 mt-1 leading-relaxed">
                    I understand that ORR will review this request internally and may assign authorised ORR personnel to assess it according to ORR&apos;s confidentiality procedures.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* --- COMPLIANCE / DECLARATION SECTION --- */}
        <div className="pt-6 border-t border-secondary">
          <h3 className="text-lg font-semibold text-foreground mb-4">Compliance / Declaration</h3>
          
          <div className="space-y-4">
            {/* Accuracy Confirmation */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.confirmAccuracy}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmAccuracy: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  Accuracy Confirmation <span className="text-red-500">*</span>
                </span>
                <p className="text-sm text-foreground opacity-60 mt-1 leading-relaxed">
                  I confirm that the information provided is accurate to the best of my knowledge.
                </p>
              </div>
            </label>

            {/* Authority to Submit */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.confirmAuthority}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmAuthority: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  Authority to Submit <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                </span>
                <p className="text-sm text-foreground opacity-60 mt-1 leading-relaxed">
                  I confirm that I am authorised to submit this request on behalf of the client or business profile.
                </p>
              </div>
            </label>

            {/* No Emergency Reliance */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.confirmNoEmergency}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmNoEmergency: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  No Emergency Reliance <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                </span>
                <p className="text-sm text-foreground opacity-60 mt-1 leading-relaxed">
                  I understand that this submission does not create an emergency support obligation and that ORR will confirm the next step after review.
                </p>
              </div>
            </label>

            {/* AI Processing Notice */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.aiProcessingNotice}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiProcessingNotice: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  AI Processing Notice <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                </span>
                <p className="text-sm text-foreground opacity-60 mt-1 leading-relaxed">
                  I understand that ORR may use secure internal AI-assisted tools to organise, summarise, and classify this request for review by ORR personnel.
                </p>
              </div>
            </label>
          </div>
        </div>

          </motion.div>
        )}

        {/* Submit Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 border-t border-secondary mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all border-2 border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all border-2 ${isSubmitting
                ? "border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600 cursor-not-allowed"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-[2] py-4 rounded-xl text-white font-medium text-lg flex items-center justify-center gap-2 transition-all ${isSubmitting
                ? "bg-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-lg shadow-zinc-500/10"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentStep < totalSteps ? "Processing..." : "Submitting Request..."}
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {currentStep < totalSteps ? "Next Step" : "Submit Problem Brief"}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

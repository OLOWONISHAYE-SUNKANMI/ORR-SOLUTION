"use client";

import React, { useState, useEffect } from "react";
import { Send, Briefcase, AlertCircle, Target, Tag, FileText, Paperclip } from "lucide-react";
import { motion } from "framer-motion";

// Request Status enum based on workflow
export type RequestStatus = 
  | "Draft"
  | "Submitted"
  | "Pending ORR Review"
  | "Clarification Requested"
  | "Approved for Meeting"
  | "Approved for PM Assignment"
  | "Converted to Project"
  | "Rejected"
  | "Closed"
  | "Archived";

// Types matching the provided schema
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

// Mock user context to simulate the "System Linkage" requirements
const MOCK_USER_CONTEXT = {
  clientId: "CL-9823-A",
  clientName: "Acme Corp Ltd.",
  submittedBy: "USR-4592"
};

export default function ClientProblemRequestForm() {
  const [formData, setFormData] = useState<FormData>({
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
  });

  const [systemLinkage, setSystemLinkage] = useState({
    requestId: "",
    submissionDate: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-generate Request ID on mount (System Linkage)
  useEffect(() => {
    const generateRequestId = () => {
      const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return `ORR-REQ-${randomNum}`;
    };

    setSystemLinkage({
      requestId: generateRequestId(),
      submissionDate: new Date().toISOString()
    });
  }, [isSuccess]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: "expectedSupport" | "expectedDeliverable" | "sector" | "preferredContactMethod" | "preferredMeetingLanguage", value: string) => {
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
    // Clear input so the same file can be selected again if removed
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

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    
    const draftPayload = {
      // System Linkage
      requestId: systemLinkage.requestId,
      clientName: MOCK_USER_CONTEXT.clientName,
      submittedBy: MOCK_USER_CONTEXT.submittedBy,
      submissionDate: new Date().toISOString(),
      
      // Request Basics
      ...formData,
      
      // Clean up file references for logging mock
      documents: formData.documents.map(d => ({
        fileName: d.file.name,
        size: d.file.size,
        description: d.description
      })),
      
      // Backend Status Tracking
      status: "Draft" as RequestStatus,

      // Internal Review Tracking (Not visible to client, initialized for backend)
      internalReview: {
        adminClassification: null,
        pmAssignmentLink: null,
        projectConversionLinks: []
      },
      
      // Audit Trail
      auditTrail: {
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: MOCK_USER_CONTEXT.clientId,
        versionHistory: []
      }
    };

    console.log("Saving Draft Payload to Backend:", JSON.stringify(draftPayload, null, 2));
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Draft saved successfully. You can continue editing later.");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Compiling the final structured payload matching workflow Step 5
    const finalPayload = {
      // System Linkage
      requestId: systemLinkage.requestId,
      clientId: MOCK_USER_CONTEXT.clientId,
      clientName: MOCK_USER_CONTEXT.clientName,
      submittedBy: MOCK_USER_CONTEXT.submittedBy,
      submissionDate: new Date().toISOString(),

      // Request Basics
      ...formData,

      // Clean up file references for logging mock
      documents: formData.documents.map(d => ({
        fileName: d.file.name,
        size: d.file.size,
        description: d.description
      })),

      // Backend Status Tracking
      status: "Submitted" as RequestStatus,

      // Internal Review Tracking (Not visible to client, initialized for backend)
      internalReview: {
        adminClassification: null,
        pmAssignmentLink: null,
        projectConversionLinks: []
      },
      
      // Audit Trail
      auditTrail: {
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: MOCK_USER_CONTEXT.clientId,
        versionHistory: []
      }
    };

    // Simulating API call
    setTimeout(() => {
      console.log("=== SUBMITTED CLIENT REQUEST BRIEF ===");
      console.log("Structured Payload for Backend:", finalPayload);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center"
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Request Submitted Successfully!</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-2">
          Your request has been securely logged with Reference ID: <strong className="text-zinc-900 dark:text-white">{systemLinkage.requestId}</strong>
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          An Admin and Project Manager will review your brief shortly.
        </p>
        <button
          onClick={() => {
            setFormData({
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
            });
            setIsSuccess(false);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          Client Problem / Request Brief
        </h2>

        {/* System Linkage Display */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 inline-flex">
          <span className="flex items-center gap-1">Request ID: <strong className="text-zinc-700 dark:text-zinc-300">{systemLinkage.requestId || 'Generating...'}</strong></span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="flex items-center gap-1">Client: <strong className="text-zinc-700 dark:text-zinc-300">{MOCK_USER_CONTEXT.clientName}</strong></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">

        {/* Request Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            Give this request a short title
          </label>
          <input
            type="text"
            name="requestTitle"
            required
            value={formData.requestTitle}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Example: “Need help entering the Italian market”, “CRM process problem”"
          />
        </div>

        {/* Request Type & Service Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              What do you need ORR to help with?
            </label>
            <select
              name="mainRequestType"
              required
              value={formData.mainRequestType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select request type...</option>
              <option value="I need advice">I need advice</option>
              <option value="I need a written review or report">I need a written review or report</option>
              <option value="I need help solving an operational problem">I need help solving an operational problem</option>
              <option value="I need compliance or regulatory support">I need compliance or regulatory support</option>
              <option value="I need IT / systems support">I need IT / systems support</option>
              <option value="I need land, agriculture, or environmental support">I need land, agriculture, or environmental support</option>
              <option value="I need ongoing support">I need ongoing support</option>
              <option value="I am not sure">I am not sure</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-400" />
              Which ORR service area best fits?
              <span className="text-xs text-zinc-400 font-normal">(Optional)</span>
            </label>
            <select
              name="orrServiceArea"
              value={formData.orrServiceArea}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select service area...</option>
              <option value="Strategy Advisory & Compliance">Strategy Advisory & Compliance</option>
              <option value="Operational Systems & Infrastructure">Operational Systems & Infrastructure</option>
              <option value="Living Systems Regeneration">Living Systems Regeneration</option>
              <option value="Not sure">Not sure (Admin/PM will classify later)</option>
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Briefly describe the issue, objective, or problem you want ORR to assess.
          </label>
          <textarea
            name="shortDescription"
            required
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Please provide the core details of your request. This will feed into our AI project summary generation..."
          />
        </div>

        {/* Desired Outcome */}
        <div className="space-y-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-400" />
            What outcome are you hoping to achieve?
          </label>
          <textarea
            name="desiredOutcome"
            required
            value={formData.desiredOutcome}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Describe what success looks like (e.g., advice, decision support, implementation, compliance...)"
          />
        </div>

        {/* --- PROBLEM DETAIL SECTION --- */}
        <div className="pt-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Problem Detail</h3>
          <div className="space-y-6">

            {/* Background / Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Provide any background information that may help ORR understand the situation.
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <textarea
                name="backgroundContext"
                value={formData.backgroundContext}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Background context..."
              />
            </div>

            {/* Main Question for ORR */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                If you could ask ORR one main question, what would it be?
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <textarea
                name="mainQuestion"
                value={formData.mainQuestion}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Your main question..."
              />
            </div>

            {/* Current Challenge */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What is currently blocking progress or creating difficulty?
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <textarea
                name="currentChallenge"
                value={formData.currentChallenge}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="What is the bottleneck or challenge..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Actions Already Taken */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tell us what you have already tried, submitted, built, discussed, or decided.
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <textarea
                  name="actionsTaken"
                  value={formData.actionsTaken}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Previous actions..."
                />
              </div>

              {/* Decision Needed */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Is there a decision you need to make? If yes, describe it.
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <textarea
                  name="decisionNeeded"
                  value={formData.decisionNeeded}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Required decision..."
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- SCOPE & EXPECTATIONS SECTION --- */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Scope & Expectations</h3>
          <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Expected Support */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  What type of support do you expect from ORR?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800/50">
                  {["Initial consultation", "Written advice", "Document review", "Technical review", "Compliance pathway", "Project planning", "Implementation support", "System setup", "Consultant matching", "Ongoing retainer support", "Other"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={formData.expectedSupport.includes(opt)}
                        onChange={() => handleCheckboxChange("expectedSupport", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expected Deliverable */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  What would you like to receive from ORR?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800/50">
                  {["Meeting summary", "Advisory note", "Written report", "Technical specification", "Implementation plan", "Compliance review", "Risk assessment", "Project roadmap", "Client presentation", "Not sure", "Other"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={formData.expectedDeliverable.includes(opt)}
                        onChange={() => handleCheckboxChange("expectedDeliverable", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Urgency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  How urgent is this request?
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select urgency...</option>
                  <option value="Normal">Normal</option>
                  <option value="Priority">Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Target Date / Deadline
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Budget Expectation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Budget Expectation
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                </label>
                <select
                  name="budgetExpectation"
                  value={formData.budgetExpectation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select budget...</option>
                  <option value="Not sure">Not sure</option>
                  <option value="Small initial review only">Small initial review only</option>
                  <option value="Fixed project budget">Fixed project budget</option>
                  <option value="Retainer support">Retainer support</option>
                  <option value="I prefer to discuss">I prefer to discuss</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* --- SECTOR & DOMAIN SECTION --- */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Sector & Domain</h3>
          <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Which sector or area does this request relate to?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800/50">
                  {["Agriculture", "IT / Software", "Regulatory Affairs", "Environment", "Forestry", "Construction", "Finance", "Import / Export", "Immigration / Residency", "Healthcare", "Manufacturing", "Food", "Legal / Compliance", "Real estate / land", "Other"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={formData.sector.includes(opt)}
                        onChange={() => handleCheckboxChange("sector", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Jurisdiction */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Country / Jurisdiction Involved
                    <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                  </label>
                  <input
                    type="text"
                    name="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. United Kingdom, EU, Global"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Enter multiple countries separated by commas if applicable.
                  </p>
                </div>

                {/* Location of Work / Asset */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Location of Work / Asset
                    <span className="text-xs text-zinc-400 font-normal ml-2">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Provide the location of the business, project, land..."
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- DOCUMENTS SECTION --- */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Documents & Vault</h3>

          <div className="space-y-6">
            {/* Documents Available Toggle */}
            <div className="flex items-start justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="space-y-1 pr-4">
                <label className="text-sm font-medium text-zinc-900 dark:text-white">
                  Do you have documents available?
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.hasDocuments ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.hasDocuments ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                    Upload documents relevant to this request
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
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
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Attached Files</h4>
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl items-start sm:items-center">
                        <div className="flex-1 flex items-center gap-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate font-medium">
                            {doc.file.name}
                          </span>
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Briefly describe this document..."
                            value={doc.description}
                            onChange={(e) => handleDocDescriptionChange(index, e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
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
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Communication</h3>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Preferred Contact Method */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  How would you prefer ORR to contact you about this request?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800/50">
                  {["Portal message", "Email", "Phone", "Video meeting", "WhatsApp"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input 
                        type="checkbox" 
                        checked={formData.preferredContactMethod.includes(opt)}
                        onChange={() => handleCheckboxChange("preferredContactMethod", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Meeting Language */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Which language should be used for meetings or written communication?
                  <span className="text-xs text-zinc-400 font-normal ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800/50">
                  {["English", "Maltese", "Italian", "French", "Spanish", "Other"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-1">
                      <input 
                        type="checkbox" 
                        checked={formData.preferredMeetingLanguage.includes(opt)}
                        onChange={() => handleCheckboxChange("preferredMeetingLanguage", opt)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferred Next Step */}
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What would you prefer as the next step?
                <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
              </label>
              <select 
                name="preferredNextStep"
                value={formData.preferredNextStep}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="" disabled>Select preferred next step...</option>
                <option value="Schedule a first consultation">Schedule a first consultation</option>
                <option value="Receive initial feedback from ORR">Receive initial feedback from ORR</option>
                <option value="Upload documents first">Upload documents first</option>
                <option value="Discuss pricing">Discuss pricing</option>
                <option value="I am not sure">I am not sure</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- CONFIDENTIALITY SECTION --- */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Confidentiality</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Sensitivity Level */}
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  How sensitive is this request?
                </label>
                <select 
                  name="sensitivityLevel"
                  required
                  value={formData.sensitivityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select sensitivity level...</option>
                  <option value="Standard">Standard</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Highly Confidential">Highly Confidential</option>
                  <option value="Restricted / commercially sensitive">Restricted / commercially sensitive</option>
                </select>
              </div>

              {/* Sensitive Information Notice */}
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                <div className="pt-0.5">
                  <input 
                    type="checkbox" 
                    required
                    checked={formData.confidentialityAgreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, confidentialityAgreed: e.target.checked }))}
                    className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    Sensitive Information Notice
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    I understand that ORR will review this request internally and may assign authorised ORR personnel to assess it according to ORR’s confidentiality procedures.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* --- COMPLIANCE / DECLARATION SECTION --- */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Compliance / Declaration</h3>
          
          <div className="space-y-4">
            {/* Accuracy Confirmation */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.confirmAccuracy}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmAccuracy: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  Accuracy Confirmation <span className="text-red-500">*</span>
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  I confirm that the information provided is accurate to the best of my knowledge.
                </p>
              </div>
            </label>

            {/* Authority to Submit */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.confirmAuthority}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmAuthority: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  Authority to Submit <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  I confirm that I am authorised to submit this request on behalf of the client or business profile.
                </p>
              </div>
            </label>

            {/* No Emergency Reliance */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.confirmNoEmergency}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmNoEmergency: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  No Emergency Reliance <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  I understand that this submission does not create an emergency support obligation and that ORR will confirm the next step after review.
                </p>
              </div>
            </label>

            {/* AI Processing Notice */}
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.aiProcessingNotice}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiProcessingNotice: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  AI Processing Notice <span className="text-xs text-zinc-400 font-normal ml-2">(Recommended)</span>
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  I understand that ORR may use secure internal AI-assisted tools to organise, summarise, and classify this request for review by ORR personnel.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all border-2 ${isSubmitting
                ? "border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600 cursor-not-allowed"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
          >
            Save Draft
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-[2] py-4 rounded-xl text-white font-medium text-lg flex items-center justify-center gap-2 transition-all ${isSubmitting
                ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Request...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Problem Brief
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

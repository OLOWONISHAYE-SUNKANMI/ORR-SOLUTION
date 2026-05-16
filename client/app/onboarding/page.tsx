"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useToastStore } from "@/store/toastStore";
import { useLanguage } from "../components/LanguageProvider";
import { LanguageToggle } from "../components/LanguageToggle";
import { ThemeToggle } from "../components/ThemeToggle";

function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const { t, interpolate } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#10253F] border border-[#1A3B56] rounded-xl px-6 py-5 text-foreground text-base focus-within:border-[#00D683] flex justify-between items-center cursor-pointer transition-colors hover:border-[#00D683]/50"
      >
        <span className={value ? "text-foreground" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00D683"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#10253F] border border-[#1A3B56] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-[#1A3B56]">
            <input
              type="text"
              className="w-full bg-[#0B1829] text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#00D683]"
              placeholder={interpolate(t?.onboarding?.search || "Search...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00D683] scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-6 py-3 cursor-pointer text-sm transition-colors hover:bg-[#1A3B56] ${
                    value === option ? 'bg-[#1A3B56] text-[#00D683]' : 'text-foreground'
                  }`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-sm text-gray-400 text-center">
                {interpolate(t?.onboarding?.noResults || "No results found")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const steps = [1, 2, 3, 4, 5, 6];

const JURISDICTIONS = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const getQuestionnaire = (t: any, interpolate: any) => ({
  1: {
    title: interpolate(t?.onboarding?.s1?.title || 'JURISDICTION & LANGUAGE SETUP'),
    steps: [
      {
        question: interpolate(t?.onboarding?.s1?.q1 || '1. Which Jurisdiction will you be operating from?'),
        options: JURISDICTIONS,
        type: "dropdown",
        placeholder: interpolate(t?.onboarding?.s1?.p1 || 'Select your jurisdiction')
      },
      {
        question: interpolate(t?.onboarding?.s1?.q2 || '2. Preferred interface language:'),
        options: t?.onboarding?.languages || [],
        type: "dropdown",
        placeholder: interpolate(t?.onboarding?.s1?.p2 || 'Select your language')
      },
      {
        question: interpolate(t?.onboarding?.s1?.q3 || '3. Preferred Keyboard Layout:'),
        options: ["EN-US", "EN-UK", "MT", "IT", "Others"],
        type: "dropdown",
        placeholder: interpolate(t?.onboarding?.s1?.p3 || 'Select keyboard layout')
      },
      {
        question: interpolate(t?.onboarding?.s1?.q4 || '4. Preferred Date/Time format:'),
        options: ["DD/MM/YYYY", "MM/DD/YYYY", "24-hour", "12-Hours"],
        type: "dropdown",
        placeholder: interpolate(t?.onboarding?.s1?.p4 || 'Select date/time format')
      },
      {
        question: interpolate(t?.onboarding?.s1?.q5 || '5. Preferred currency:'),
        options: t?.onboarding?.currencies || ["USD ($)", "EUR (€)"],
        type: "dropdown",
        placeholder: interpolate(t?.onboarding?.s1?.p5 || 'Select currency')
      }
    ]
  },
  2: {
    title: interpolate(t?.onboarding?.s2?.title || 'SERVICE AGREEMENT'),
    steps: [
      {
        question: interpolate(t?.onboarding?.s2?.q1 || '5. Do you confirm that you have read and accept the Service Agreement?'),
        options: [interpolate(t?.onboarding?.s2?.accept || 'Yes, I accept'), interpolate(t?.onboarding?.s2?.decline || 'No')],
        type: "single",
        helpLink: { text: interpolate(t?.onboarding?.s2?.linkText || 'Read the full Service Agreement'), url: "/legal-policy" }
      }
    ]
  },
  3: {
    title: interpolate(t?.onboarding?.s3?.title || 'PORTAL OVERVIEW & EXPECTATION'),
    steps: [
      {
        question: interpolate(t?.onboarding?.s3?.q1 || '6. What are you mainly interested in using the portal for? (Select all that apply)'),
        options: (t?.onboarding?.s3?.options || []).map((opt: string) => interpolate(opt)),
        type: "multiple"
      }
    ]
  },
  4: {
    title: interpolate(t?.onboarding?.s4?.title || 'YOUR BUSINESS/PROJECT PROFILE'),
    steps: [
      {
        question: interpolate(t?.onboarding?.s4?.q1 || '7. What best describes you?'),
        options: (t?.onboarding?.s4?.options1 || []).map((opt: string) => interpolate(opt)),
        type: "single"
      },
      {
        question: interpolate(t?.onboarding?.s4?.q2 || '8. What stage is your project or organisation currently in?'),
        options: (t?.onboarding?.s4?.options2 || []).map((opt: string) => interpolate(opt)),
        type: "single"
      },
      {
        question: interpolate(t?.onboarding?.s4?.q3 || '9. Which area(s) best match your needs? (ORR pillars) — Select all that apply'),
        options: (t?.onboarding?.s4?.options3 || []).map((opt: string) => interpolate(opt)),
        type: "multiple"
      },
      {
        question: interpolate(t?.onboarding?.s4?.q4 || '10. Do you currently have an active project in mind?'),
        options: (t?.onboarding?.s4?.options4 || []).map((opt: string) => interpolate(opt)),
        type: "single"
      },
      {
        question: interpolate(t?.onboarding?.s4?.q5 || '11. Briefly describe your project or business:'),
        type: "text",
        options: [] as string[],
        placeholder: interpolate(t?.onboarding?.typeMessage || 'Type your message here...')
      }
    ]
  },
  5: {
    title: interpolate(t?.onboarding?.s5?.title || 'MEETING & COMMUNICATION PREFERENCES'),
    steps: [
      {
        question: interpolate(t?.onboarding?.s5?.q1 || '13. Preferred meeting format:'),
        options: (t?.onboarding?.s5?.options1 || []).map((opt: string) => interpolate(opt)),
        type: "single"
      },
      {
        question: interpolate(t?.onboarding?.s5?.q2 || '14. Preferred communication tone:'),
        options: (t?.onboarding?.s5?.options2 || []).map((opt: string) => interpolate(opt)),
        type: "single"
      },
      {
        question: interpolate(t?.onboarding?.s5?.q3 || '15. Preferred contact method for notifications:'),
        options: (t?.onboarding?.s5?.options3 || []).map((opt: string) => interpolate(opt)),
        type: "single"
      }
    ]
  },
  6: {
    title: interpolate(t?.onboarding?.s6?.title || 'OPTIONAL (to improve AI response)'),
    steps: [
      {
        question: interpolate(t?.onboarding?.s6?.q1 || "16. Any additional context you'd like the system to know?"),
        type: "text",
        options: [] as string[],
        placeholder: interpolate(t?.onboarding?.typeMessage || 'Type your message here...')
      }
    ]
  }
});

function CustomStepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex flex-col items-center">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${index === activeStep ? "bg-lemon" : "bg-gray-600"
              }`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <div className="w-0.5 h-16 bg-gray-600 my-2"></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { t, language, setLanguage, interpolate } = useLanguage();
  const [currentSection, setCurrentSection] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [textInput, setTextInput] = useState("");

  const questionnaire = getQuestionnaire(t, interpolate);
  const currentQuestion = questionnaire[currentSection as keyof typeof questionnaire];
  const currentStepData = currentQuestion.steps[currentStep];

  // Restore text input when step changes
  useEffect(() => {
    if (currentStepData.type === "text") {
      const key = `${currentSection}-${currentStep}`;
      setTextInput(answers[key] || "");
    }
  }, [currentSection, currentStep, currentStepData.type]);

  const handleOptionSelect = (value: string) => {
    const key = `${currentSection}-${currentStep}`;

    if (currentStepData.type === "multiple") {
      const current = answers[key] || [];
      const updated = current.includes(value)
        ? current.filter((item: string) => item !== value)
        : [...current, value];
      setAnswers({ ...answers, [key]: updated });
    } else {
      setAnswers({ ...answers, [key]: value });
    }
  };

  const handleNext = () => {
    const key = `${currentSection}-${currentStep}`;
    const currentAnswer = currentStepData.type === "text" ? textInput : answers[key];

    // Basic validation: must have some content/selection to proceed
    if (currentStepData.type === "text" && !textInput.trim() && currentSection !== 6) {
      addToast(interpolate(t?.onboarding?.errors?.requiredField || "This field is required."), "error");
      return;
    }
    
    if (currentStepData.type !== "text" && (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0))) {
      addToast(interpolate(t?.onboarding?.errors?.selectOption || "Please select an option to continue."), "error");
      return;
    }

    if (currentStepData.type === "text") {
      setAnswers({ ...answers, [key]: textInput });
      // textInput is now cleared via the useEffect above when the step actually changes,
      // but we can also do it here for immediate feedback if needed.
    }

    if (currentStep < currentQuestion.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentSection < 6) {
      setCurrentSection(currentSection + 1);
      setCurrentStep(0);
    }
  };

  const router = useRouter();
  const { checkOnboardingStatus, submitOnboarding, isLoading } = useOnboardingStore();
  const { addToast } = useToastStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        const isCompleted = await checkOnboardingStatus();
        if (isCompleted) {
          router.replace('/dashboard');
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        setIsChecking(false);
      }
    };
    checkStatus();
  }, [checkOnboardingStatus, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-lemon border-t-transparent rounded-full mb-4"></div>
        <p className="text-foreground/60">{interpolate(t?.onboarding?.checkingStatus || "Checking onboarding status...")}</p>
      </div>
    );
  }

  const handleComplete = async () => {
    let finalAnswers = { ...answers };
    if (currentStepData.type === "text") {
      const key = `${currentSection}-${currentStep}`;
      finalAnswers = { ...finalAnswers, [key]: textInput };
    }

    // Language mapping helper
    const getOptionIndex = (section: number, step: number) => {
      const key = `${section}-${step}`;
      const val = finalAnswers[key];
      if (!val) return -1;
      
      const q = getQuestionnaire(t, interpolate)[section as keyof ReturnType<typeof getQuestionnaire>];
      const s = q.steps[step];
      return (s.options || []).indexOf(val);
    };

    // Validate service agreement acceptance
    const acceptText = t?.onboarding?.s2?.accept || 'Yes, I accept';
    if (finalAnswers['2-0'] !== interpolate(acceptText)) {
      addToast(interpolate(t?.onboarding?.errors?.acceptAgreement || 'Please go back to Section 2 and accept the Service Agreement to continue.'), 'error');
      setCurrentSection(2);
      setCurrentStep(0);
      return;
    }

    // Validate project description length
    const projectDescription = finalAnswers['4-4'] || '';
    if (projectDescription.trim().length < 10) {
      addToast(interpolate(t?.onboarding?.errors?.descriptionLength || 'Project description must be at least 10 characters long.'), 'error');
      setCurrentSection(4);
      setCurrentStep(4);
      return;
    }

    const onboardingData = {
      jurisdiction: finalAnswers['1-0'] === 'Malta' ? 'malta' : 'other',
      jurisdiction_other: finalAnswers['1-0'] === 'Malta' ? undefined : (finalAnswers['1-0'] || 'Not specified'),
      language: finalAnswers['1-1'] === 'Others' ? 'other' : 
                (getOptionIndex(1, 1) === 1 ? 'it' : 'en'),
      language_other: finalAnswers['1-1'] === 'Others' ? 'other language' : undefined,
      keyboard_layout: finalAnswers['1-2'] === 'Others' ? 'other' : 
                      finalAnswers['1-2']?.toLowerCase().replace('-', '_') || 'en_us',
      keyboard_other: finalAnswers['1-2'] === 'Others' ? 'other layout' : undefined,
      date_format: finalAnswers['1-3']?.includes('DD/MM') ? 'dd_mm_yyyy' : 'mm_dd_yyyy',
      time_format_24h: finalAnswers['1-3']?.includes('24-hour') || false,
      currency: finalAnswers['1-4']?.includes('EUR') ? 'EUR' : 'USD',
      accepted_service_agreement: finalAnswers['2-0']?.includes('accept') || finalAnswers['2-0']?.includes('accetto') || true,
      portal_interests: Array.isArray(finalAnswers['3-0']) ? finalAnswers['3-0'] : (finalAnswers['3-0'] ? [finalAnswers['3-0']] : []),
      portal_interests_other: finalAnswers['3-0']?.includes('Others') ? 'other interests' : undefined,
      user_type: (() => {
        const idx = getOptionIndex(4, 0);
        const types = ['founder', 'small_business', 'corporate', 'public_ngo', 'academic', 'professional', 'other'];
        return types[idx] || 'founder';
      })(),
      user_type_other: finalAnswers['4-0'] === 'Others' ? 'other user type' : undefined,
      project_stage: (() => {
        const idx = getOptionIndex(4, 1);
        const stages = ['exploration', 'pre_startup', 'operational', 'scaling', 'unsure'];
        return stages[idx] || 'exploration';
      })(),
      orr_pillars: Array.isArray(finalAnswers['4-2']) ? finalAnswers['4-2'] : (finalAnswers['4-2'] ? [finalAnswers['4-2']] : []),
      has_active_project: finalAnswers['4-3']?.toLowerCase().includes('yes') || finalAnswers['4-3']?.toLowerCase().includes('sì') ? 'yes' : 'no',
      project_description: finalAnswers['4-4'] || '',
      meeting_format: finalAnswers['5-0']?.toLowerCase().includes('video') ? 'video' : 'phone',
      communication_tone: (() => {
        const idx = getOptionIndex(5, 1);
        const toneMap: Record<number, string> = {
          0: 'concise',
          1: 'detailed',
          2: 'technical',
          3: 'non_technical',
          4: 'no_preference'
        };
        return toneMap[idx] || 'no_preference';
      })(),
      notification_preference: finalAnswers['5-2']?.toLowerCase().includes('email') ? 'email' : finalAnswers['5-2']?.toLowerCase().includes('both') ? 'both' : 'email',
      ai_specialist_domains: [],
      ai_specialist_other: undefined,
      additional_context: finalAnswers['6-0'] || '',
    };

    // Before submit, clean up translations from answers if necessary
    // However, the backend expects values. We should ideally map back or use the original keys.
    // For now, let's assume the backend handles these strings or we should have used stable keys for values.
    // This is a trade-off: localizing the OPTIONS themselves changes the value sent to backend.
    
    await submitOnboarding(onboardingData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('orr-currency-dismissed', 'true');
    }
  };

  const getCurrentAnswer = () => {
    const key = `${currentSection}-${currentStep}`;
    return answers[key] || (currentStepData.type === "multiple" ? [] : "");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <div className="w-20 flex justify-center py-10">
          <CustomStepper activeStep={currentSection - 1} />
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-screen px-6 py-10">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-3xl font-bold mb-8">{currentQuestion.title}</h2>
            <p className="text-lg mb-4">{currentStepData.question}</p>
            {(currentStepData as any).helpLink && (
              <a
                href={(currentStepData as any).helpLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#00D683] hover:text-[#00D683]/80 text-sm font-medium mb-12 underline underline-offset-4"
              >
                {(currentStepData as any).helpLink.text} ↗
              </a>
            )}
            {!(currentStepData as any).helpLink && <div className="mb-12" />}

            {currentStepData.type === "text" ? (
              <div className="mb-16">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={(currentStepData as any).placeholder || "Type your message here..."}
                  className="w-full bg-[#10253F] border border-[#1A3B56] rounded-xl p-6 text-foreground min-h-[200px] focus:border-[#00D683] focus:outline-none"
                />
              </div>
            ) : currentStepData.type === "dropdown" ? (
              <div className="mb-16 max-w-md">
                <SearchableDropdown
                  options={currentStepData.options || []}
                  value={getCurrentAnswer() || ""}
                  onChange={(val) => {
                    const key = `${currentSection}-${currentStep}`;
                    setAnswers({ ...answers, [key]: val });
                    
                    // Automatically switch language if this is the language selection step (Section 1, Step 1)
                    if (currentSection === 1 && currentStep === 1) {
                      const langCode = val.toLowerCase().startsWith('en') || val.toLowerCase().startsWith('ing') ? 'en' : 'it';
                      setLanguage(langCode as any);
                    }
                  }}
                  placeholder={(currentStepData as any).placeholder || interpolate(t?.onboarding?.selectOption || "Select an option")}
                />
              </div>
            ) : (
              <div className={`grid gap-6 mb-16 ${currentStepData.options && currentStepData.options.length > 6
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : currentStepData.options && currentStepData.options.length > 3
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}>
                {currentStepData.options?.map((option: string) => {
                  const currentAnswer = getCurrentAnswer();
                  const isActive = currentStepData.type === "multiple"
                    ? currentAnswer.includes(option)
                    : currentAnswer === option;

                  return (
                    <div
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className={`
                        relative cursor-pointer border rounded-xl px-6 py-8 text-center text-base 
                        flex items-center justify-center w-full
                        ${isActive
                          ? "border-[#00D683] bg-[#10253F]"
                          : "border-[#1A3B56] bg-transparent"
                        }
                      `}
                    >
                      <div
                        className={`absolute right-3 top-3 w-4 h-4 rounded-full border
                          ${isActive
                            ? "border-[#00D683] bg-[#00D683]"
                            : "border-[#1A3B56]"
                          }`}
                      ></div>
                      <span className="text-sm md:text-base">{option}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="my-16"></div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0">
              {currentSection > 1 || currentStep > 0 ? (
                <button
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(currentStep - 1);
                    } else if (currentSection > 1) {
                      setCurrentSection(currentSection - 1);
                      setCurrentStep(questionnaire[(currentSection - 1) as keyof typeof questionnaire].steps.length - 1);
                    }
                  }}
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white px-6 py-4 sm:px-8 sm:py-4 md:px-12 md:py-5 rounded-lg font-semibold text-base sm:text-lg tracking-wide"
                >
                  ← {interpolate(t?.onboarding?.back || "BACK")}
                </button>
              ) : <div className="hidden sm:block"></div>}

              <button
                onClick={currentSection === 6 && currentStep === currentQuestion.steps.length - 1 ? handleComplete : handleNext}
                disabled={isLoading}
                className="w-full sm:w-auto bg-lemon hover:bg-lemon/90 text-black px-6 py-4 sm:px-8 sm:py-4 md:px-12 md:py-5 rounded-lg font-semibold text-base sm:text-lg tracking-wide disabled:opacity-50"
              >
                {isLoading ? interpolate(t?.onboarding?.submitting || "SUBMITTING...") : currentSection === 6 && currentStep === currentQuestion.steps.length - 1 ? interpolate(t?.onboarding?.complete || "COMPLETE") : `${interpolate(t?.onboarding?.next || "NEXT")} →`}
              </button>
            </div>
            <div className="fixed top-6 right-6 flex items-center gap-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
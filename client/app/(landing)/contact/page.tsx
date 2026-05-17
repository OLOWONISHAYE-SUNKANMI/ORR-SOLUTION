"use client";

import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "@/lib/axios";
import Spinner from "../../../components/ui/Spinner";
import { useLanguage } from "../../../app/components/LanguageProvider";
import { getRichTextContent } from "@/lib/rich-text-utils";

gsap.registerPlugin(ScrollTrigger);

interface ContactPageData {
  id: number;
  hero_title: any;
  contact_info_title: any;
  contact_info_subtitle: any;
  phone_number: any;
  email_address: any;
  address: any;
  first_name_label: any;
  last_name_label: any;
  email_label: any;
  phone_label: any;
  subject_label: any;
  message_label: any;
  first_name_placeholder: any;
  last_name_placeholder: any;
  email_placeholder: any;
  phone_placeholder: any;
  message_placeholder: any;
  subject_option_1: any;
  subject_option_2: any;
  subject_option_3: any;
  subject_option_4: any;
  submit_button_text: any;
  meta_title?: any;
  meta_description?: any;
  is_active: boolean;
}

export default function Contact() {
  const titleRef = useRef(null);
  const infoCardRef = useRef(null);
  const formCardRef = useRef(null);
  const contactItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const formFieldsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [data, setData] = useState<ContactPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`🔄 Fetching Contact data for language: ${language}`);
        const response = await api.get(
          `/admin-portal/v1/cms/contact-content/?lang=${language}`,
          {
            headers: {
              'Accept-Language': language
            }
          }
        );
        console.log("✅ Contact API Response:", response.data);
        if (response.data.success) {
          console.log("📊 Contact Data Structure:", response.data.data);
          setData(response.data.data);
        }
      } catch (error) {
        console.error("❌ Error fetching Contact data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;

    const title = titleRef.current;
    if (title) {
      gsap.fromTo(
        title,
        { opacity: 0, y: -50, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        },
      );
    }

    gsap.fromTo(
      infoCardRef.current,
      { opacity: 0, x: -100, rotateY: -15 },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: infoCardRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );

    gsap.fromTo(
      formCardRef.current,
      { opacity: 0, x: 100, rotateY: 15 },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: formCardRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );

    contactItemsRef.current.forEach((item, i) => {
      if (item) {
        gsap.fromTo(
          item,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: 0.3 + i * 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: infoCardRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });

    formFieldsRef.current.forEach((field, i) => {
      if (field) {
        gsap.fromTo(
          field,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.2 + i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: formCardRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });
  }, [data]);

  if (loading) {
    return <Spinner />;
  }

  if (!data) {
    return <Spinner />;
  }

  const getHtml = (field: any) => {
    const text = getRichTextContent(field, language);
    return typeof text === 'string' ? text : '';
  };

  const getPlain = (field: any) => {
    const html = getHtml(field);
    return html ? html.replace(/<[^>]*>?/gm, '') : '';
  };

  const subjectOptions = [
    getPlain(data.subject_option_1) || t.contact.subjectGeneral,
    getPlain(data.subject_option_2) || t.contact.subjectGeneral,
    getPlain(data.subject_option_3) || t.contact.subjectGeneral,
    getPlain(data.subject_option_4) || t.contact.subjectGeneral,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 star">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-foreground"
          >
            <span
              dangerouslySetInnerHTML={{
                __html: getHtml(data.hero_title) || t.contact.heroTitle,
              }}
            />
          </h1>
        </div>
      </section>

      {/* Contact Form and Details Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 bg-card p-3 sm:p-4 rounded-2xl">
          {/* Contact Information Card - Left */}
          <div
            ref={infoCardRef}
            className="bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span
                dangerouslySetInnerHTML={{
                  __html: getHtml(data.contact_info_title) || t.contact.infoTitle,
                }}
              />
            </h2>
            <p className="text-white/90 mb-6 sm:mb-8 text-sm sm:text-base">
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    getHtml(data.contact_info_subtitle) ||
                    t.contact.infoSubtitle,
                }}
              />
            </p>

            {/* Phone */}
            <div
              ref={(el) => {
                contactItemsRef.current[0] = el;
              }}
              className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-base sm:text-lg">
                <span>{getPlain(data.phone_number) || t.contact.phoneDefault}</span>
              </p>
            </div>

            {/* Email */}
            <div
              ref={(el) => {
                contactItemsRef.current[1] = el;
              }}
              className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-base sm:text-lg">
                <span>{getPlain(data.email_address) || t.contact.emailDefault}</span>
              </p>
            </div>

            {/* Address */}
            <div
              ref={(el) => {
                contactItemsRef.current[2] = el;
              }}
              className="flex items-start gap-3 sm:gap-4"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-base sm:text-lg">
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      getHtml(data.address) ||
                      t.contact.addressDefault,
                  }}
                />
              </p>
            </div>
          </div>

          {/* Contact Form - Right */}
          <div
            ref={formCardRef}
            className="bg-card rounded-2xl p-4 sm:p-6 lg:p-8"
          >
            <form className="space-y-4 sm:space-y-6">
              {/* First Name and Last Name Row */}
              <div
                ref={(el) => {
                  formFieldsRef.current[0] = el;
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <div>
                  <label
                    htmlFor="firstName"
                    className="block opacity-80 text-sm mb-2"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: getHtml(data.first_name_label) || t.contact.firstName,
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder={
                      getPlain(data.first_name_placeholder) ||
                      t.contact.firstNamePlaceholder
                    }
                    className="w-full bg-transparent border-b border-border text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors pb-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block opacity-80 text-sm mb-2"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: getHtml(data.last_name_label) || t.contact.lastName,
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder={
                      getPlain(data.last_name_placeholder) ||
                      t.contact.lastNamePlaceholder
                    }
                    className="w-full bg-transparent border-b border-border text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors pb-2"
                  />
                </div>
              </div>

              {/* Email and Phone Row */}
              <div
                ref={(el) => {
                  formFieldsRef.current[1] = el;
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block opacity-80 text-sm mb-2"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: getHtml(data.email_label) || t.contact.email,
                      }}
                    />
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder={
                      getPlain(data.email_placeholder) ||
                      t.contact.emailPlaceholder
                    }
                    className="w-full bg-transparent border-b border-border text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors pb-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block opacity-80 text-sm mb-2"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: getHtml(data.phone_label) || t.contact.phone,
                      }}
                    />
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder={
                      getPlain(data.phone_placeholder) ||
                      t.contact.phonePlaceholder
                    }
                    className="w-full bg-transparent border-b border-border text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors pb-2"
                  />
                </div>
              </div>

              {/* Select Subject */}
              <div
                ref={(el) => {
                  formFieldsRef.current[2] = el;
                }}
              >
                <label className="block opacity-80 text-sm mb-4">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getHtml(data.subject_label) || t.contact.subject,
                    }}
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {subjectOptions.map((subject, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="subject"
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="opacity-80 text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div
                ref={(el) => {
                  formFieldsRef.current[3] = el;
                }}
              >
                <label
                  htmlFor="message"
                  className="block opacity-80 text-sm mb-2"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getHtml(data.message_label) || t.contact.message,
                    }}
                  />
                </label>
                <textarea
                  id="message"
                  placeholder={
                    getPlain(data.message_placeholder) ||
                    t.contact.messagePlaceholder
                  }
                  rows={1}
                  className="w-full bg-transparent border-b border-border text-white opacity-40 focus:outline-none focus:border-primary transition-colors pb-2 resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div
                ref={(el) => {
                  formFieldsRef.current[4] = el;
                }}
                className="pt-4 flex justify-center sm:justify-end"
              >
                <div className="relative inline-block">
                  <button
                    type="submit"
                    className="bg-gradient-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-all"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: getHtml(data.submit_button_text) || t.contact.submitButton,
                      }}
                    />
                  </button>
                  {/* Lucide-style send icon positioned overlapping the button */}
                  <Send className="absolute right-20 sm:right-28 -bottom-6 sm:-bottom-8 w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

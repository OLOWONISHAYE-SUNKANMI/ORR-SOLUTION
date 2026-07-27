const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}`;

export interface HomepageContent {
  homepage: {
    hero_title: string;
    hero_subtitle: string;
    hero_cta_text: string;
    hero_cta_link: string;
    about_title: string;
    about_content: string;
    services_title: string;
    services_subtitle: string;
    contact_title: string;
    contact_subtitle: string;
    contact_email: string;
    contact_phone: string;
  };
  services: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    pillar: string;
    link: string;
    order: number;
  }>;
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
    category: string;
    order: number;
  }>;
  contact_info: {
    company_name: string;
    email: string;
    phone: string;
    address_line1: string;
    linkedin_url: string;
    twitter_url: string;
  };
  site_settings: {
    site_name: string;
    primary_color: string;
    secondary_color: string;
    logo: string;
  };
  approach_section: {
    title: string;
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
  };
  business_system_section: {
    title: string;
    subtitle: string;
  };
  business_system_cards: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
    order: number;
  }>;
  orr_role_section: {
    title: string;
    description: string;
  };
  message_strip: {
    title: string;
    message: string;
  };
  process_section: {
    title: string;
    subtitle: string;
  };
  process_stages: Array<{
    id: number;
    title: string;
    description: string;
    order: number;
  }>;
  orr_report_section: {
    title: string;
    subtitle: string;
    feature_1: string;
    feature_2: string;
    feature_3: string;
    feature_4: string;
  };
}

export async function fetchHomepageContent(lang: string = 'en'): Promise<HomepageContent> {
  const endpoint = `${API_BASE_URL}/api/cms/homepage/?lang=${lang}`;
  console.log('🏠 Homepage fetching data from endpoint:', endpoint);
  const response = await fetch(endpoint, {
    headers: {
      'Accept-Language': lang,
    }
  });
  if (!response.ok) {
    console.error('❌ Homepage fetch failed:', response.status, response.statusText);
    throw new Error('Failed to fetch homepage content');
  }

  const result = await response.json();
  console.log('📊 Homepage data received:', result);

  // Extract data from the wrapped response
  const finalData = result.data || result;
  console.log('✅ Homepage final processed data:', finalData);

  return finalData;
}
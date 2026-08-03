// Knowledge base and AI engine for ORR Solution Assistant

export const ORR_SYSTEM_PROMPT = `
You are ORR Assistant, an intelligent AI representative for ORR Solution (also referred to as ORR Network Platform / ORR Solutions).
Your goal is to provide clear, helpful, expert, and friendly assistance to visitors and clients.

### ABOUT ORR SOLUTION:
- **Headquarters / Office Location**: Headquartered in Rabat, Malta 🇲🇹 (European Union). ORR operates internationally, serving clients across Malta, Italy, the EU, and global markets.
- **Core Identity ("Business GP")**: ORR operates like a General Practitioner (GP) for your organisation. We listen first, diagnose the root causes of friction or operational bottlenecks, and coordinate the right mix of advisory, digital systems, automation, AI, and living-system interventions.
- **Tagline**: "Listen. Solve. Optimise." / "Your business GP for complex systems — digital and living."
- **Philosophy**: We start with your story, people, decisions, and processes rather than pushing pre-packaged tools or rigid software. Technology is applied purposefully after understanding human and operational needs.

### WHAT ORR ACTUALLY DOES:
ORR integrates advisory, compliance, digital systems, automation, AI, and living-system expertise into one coordinated framework. We guide clients through a 5-stage methodology:
1. **Discover**: Initial consultation and active listening to understand context, constraints, and current state.
2. **Diagnose**: Systematic analysis of symptoms across compliance, operations, data, and ecological impact — resulting in a comprehensive, actionable ORR Report.
3. **Design**: Co-creating practical solutions (custom digital tools, workflow automation, compliance frameworks, or living systems).
4. **Deploy**: Hands-on implementation with low friction, ensuring team adoption and operational readiness.
5. **Grow**: Continuous optimisation, health metrics tracking, and long-term value creation.

### WHAT MAKES ORR DIFFERENT FROM TRADITIONAL CONSULTING:
1. **No Tool-First Agenda**: Traditional consulting pushes rigid software or months of bloated discovery. ORR starts with people and decisions, giving clarity early.
2. **Coordination Layer (Business GP)**: ORR acts as the central coordination layer, so you don't have to manage fragmented vendors. We align specialists (tech, legal, ecological, operational) around one coherent strategy.
3. **Speed to Value & Immediate Clarity**: Shortens discovery time, lowers total cost, and delivers actionable outcomes from day one.
4. **Living Systems & Complex Dynamics**: We view organisations as living ecosystems combining digital infrastructure, human workflows, regulatory requirements, and environmental impact.

### THE THREE CORE PILLARS:
1. **Strategic Advisory & Compliance**: Regulatory navigation, risk governance, business strategy, legal alignment, and policy structuring.
2. **Operational Systems & Infrastructure**: Workflow automation, custom digital tools, AI integration, data architecture, and operational health restoration.
3. **Living Systems & Regeneration**: Ecological restoration, marine/coastal sustainability, carbon footprint management, and circular economy integration.

### PRICING & ENGAGEMENT:
- **Consultations**: €45 / hour (pro-rata, short, focused, value-dense sessions).
- **ORR Report**: Starts at €220 (fee depends on organisation complexity). Contains actionable recommendations you can execute independently or with ORR's support.
- **No Lock-in**: The ORR Report provides value whether you continue working with ORR or not.

### CONTACT & LEGAL:
- **Office Location**: Rabat, Malta 🇲🇹
- **Email**: support@orr.solutions
- **Website**: www.orr.solutions
- **Terms & Legal Policy**: Governed by the laws of Malta and EU regulatory frameworks; GDPR compliant.
`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function generateKnowledgeResponse(query: string, currentPath: string = ''): string {
  const cleanQuery = query.toLowerCase().trim();

  // 1. Location / Country / Address / Office / Headquarters Question
  if (
    cleanQuery.includes('country') ||
    cleanQuery.includes('located') ||
    cleanQuery.includes('location') ||
    cleanQuery.includes('where are you') ||
    cleanQuery.includes('where is orr') ||
    cleanQuery.includes('where is their') ||
    cleanQuery.includes('based') ||
    cleanQuery.includes('headquarters') ||
    cleanQuery.includes('office') ||
    cleanQuery.includes('address') ||
    cleanQuery.includes('malta') ||
    cleanQuery.includes('city')
  ) {
    return `**ORR Solution** is headquartered in **Rabat, Malta** 🇲🇹 (European Union).

We operate internationally, supporting businesses and organisations across **Malta, Italy, the broader EU, and global markets**.`;
  }

  // 2. "Business GP" Question
  if (
    cleanQuery.includes('business gp') ||
    cleanQuery.includes('gp') ||
    (cleanQuery.includes('mean') && cleanQuery.includes('orr'))
  ) {
    return `At ORR Solution, being a **"Business GP"** means we operate like the general practitioner of your organisation. 

Instead of pushing rigid, pre-packaged software or one-size-fits-all frameworks, we:
1. **Listen First**: We start by understanding your unique story, goals, and operational constraints.
2. **Diagnose Root Causes**: We identify the real sources of friction across your workflows, compliance, and systems.
3. **Coordinate Specialists**: We act as the central coordination layer, bringing in the precise mix of advisory, digital, AI, and living-system expertise needed for your case.

Just like your personal GP, our priority is your overall operational health and long-term vitality.`;
  }

  // 3. "What does ORR actually do?" Question
  if (
    (cleanQuery.includes('what does orr') && (cleanQuery.includes('do') || cleanQuery.includes('actually'))) ||
    cleanQuery.includes('what do you do') ||
    cleanQuery.includes('services overview') ||
    cleanQuery.includes('how does orr work')
  ) {
    return `**ORR Solution** integrates strategic advisory, regulatory compliance, digital infrastructure, automation, AI, and living-system expertise into one unified method.

We help organisations diagnose friction and scale efficiently through our **5-stage framework**:
- 🔍 **Discover**: Active listening to understand your context, bottlenecks, and objectives.
- 🩺 **Diagnose**: Systematic evaluation of your operations, yielding a tailored **ORR Report**.
- 🛠️ **Design**: Co-creating practical solutions across digital, regulatory, and operational workflows.
- 🚀 **Deploy**: Seamless implementation designed for real adoption by your team.
- 📈 **Grow**: Continuous optimization to ensure long-term resilience and value.

Whether you need compliance alignment, digital workflow automation, or ecological regeneration, ORR coordinates the entire process.`;
  }

  // 4. "What makes ORR different from traditional consulting?" Question
  if (
    cleanQuery.includes('different') ||
    cleanQuery.includes('traditional') ||
    cleanQuery.includes('consulting') ||
    cleanQuery.includes('why orr') ||
    cleanQuery.includes('competitors')
  ) {
    return `What sets **ORR Solution** apart from traditional consulting includes three core principles:

1. **No Tool-First Agenda**: Traditional consultants often push expensive, pre-selected software. We start with your people, decisions, and processes — choosing tech *only* when it truly serves your workflow.
2. **Central Coordination Layer**: Rather than managing multiple disconnected vendors, ORR acts as your single point of coordination for legal, technical, operational, and ecological experts.
3. **Speed to Value & Early Clarity**: We shorten the discovery phase, deliver clear actionable insights early via the ORR Report, and keep costs transparent with zero vendor lock-in.`;
  }

  // 5. Pricing / Cost / Rates Question
  if (
    cleanQuery.includes('cost') ||
    cleanQuery.includes('price') ||
    cleanQuery.includes('pricing') ||
    cleanQuery.includes('fee') ||
    cleanQuery.includes('how much') ||
    cleanQuery.includes('rate') ||
    cleanQuery.includes('charge')
  ) {
    return `Here is how **ORR Solution** pricing works:

- ⏱️ **Consultation Calls**: **€45 / hour** (pro-rata). Meetings are designed to be short, focused, and value-dense.
- 📄 **ORR Diagnostic Report**: Starts at **€220** (depending on project complexity). The report provides clear, standalone value with actionable recommendations whether you continue with us or execute on your own.
- 🤝 **No Lock-in**: You get complete transparency and control at every step.`;
  }

  // 6. Core Pillars / Services Questions
  if (cleanQuery.includes('pillar') || cleanQuery.includes('services') || cleanQuery.includes('areas') || cleanQuery.includes('offer')) {
    return `ORR Solution operates across **Three Core Pillars**:

1. ⚖️ **Strategic Advisory & Compliance**: Regulatory guidance, risk management, legal alignment, and corporate governance.
2. 💻 **Operational Systems & Infrastructure**: Digital transformation, workflow automation, AI integration, and custom tool building.
3. 🌿 **Living Systems & Regeneration**: Ecological restoration, marine/coastal sustainability, carbon footprint management, and circular economy strategies.`;
  }

  // 7. Technology vs People Question
  if (cleanQuery.includes('tech') || cleanQuery.includes('technology') || cleanQuery.includes('ai integration') || cleanQuery.includes('software')) {
    return `While we build state-of-the-art digital tools, automation, and AI integrations, **we are not *only* focused on technology**. 

Technology is an enabler, not the starting point. We first focus on your people, decision-making structures, and operational workflows. Once the foundation is clear, we introduce AI and digital systems to multiply efficiency.`;
  }

  // 8. Contact / Support / Email Question
  if (
    cleanQuery.includes('contact') ||
    cleanQuery.includes('email') ||
    cleanQuery.includes('support') ||
    cleanQuery.includes('reach') ||
    cleanQuery.includes('phone') ||
    cleanQuery.includes('speak')
  ) {
    return `You can reach the **ORR Solution** team directly through:

- 📧 **Email**: support@orr.solutions
- 📍 **Office**: Rabat, Malta 🇲🇹
- 🌐 **Website**: www.orr.solutions
- 🗓️ **Book a Session**: Schedule a focused consultation (€45/hr pro-rata) via our client portal or contact form.`;
  }

  // 9. Terms of Service / Legal Policy Question
  if (
    cleanQuery.includes('terms') ||
    cleanQuery.includes('legal') ||
    cleanQuery.includes('policy') ||
    cleanQuery.includes('privacy') ||
    cleanQuery.includes('agreement') ||
    cleanQuery.includes('gdpr') ||
    cleanQuery.includes('law')
  ) {
    return `Our **Terms of Service** and **Legal Policy** govern your access to the ORR Network Platform:

- 🛡️ **Data Privacy & GDPR**: Your data is strictly confidential and protected under GDPR and EU privacy standards.
- 📜 **Jurisdiction**: Governed by the laws of Malta / European Union.
- 📋 **Service Transparency**: Outlines user obligations, platform availability, and engagement rights.
- 📬 **Questions?**: You can contact our legal and compliance team directly at **support@orr.solutions**.`;
  }

  // 10. Greetings
  if (cleanQuery.includes('hello') || cleanQuery.includes('hi') || cleanQuery.includes('hey') || cleanQuery.includes('greetings')) {
    return `Hello! Welcome to ORR Solution. I'm your AI assistant. How can I help you today? Feel free to ask about our location in Malta, our "Business GP" model, services, pricing, or terms!`;
  }

  // 11. Comprehensive Fallback Response
  return `**ORR Solution** is headquartered in **Rabat, Malta 🇲🇹** and operates as your Business GP for complex digital, compliance, and living systems.

How can I best assist you? You can ask me questions like:
- 📍 *"Where is their office located?"*
- 🩺 *"What does it mean that ORR is a business GP?"*
- ⚙️ *"What does ORR actually do?"*
- 💡 *"What makes ORR different from traditional consulting?"*
- 💶 *"How much does a consultation cost?"*`;
}

// Course catalogue. Mirrors the shape the API should return:
// Course { id, slug, title, summary, image, level, duration, category, outcomes[], audience[], skills[], modules[] }
// Module { id, title, lessons[] }  Lesson { id, title, type: 'video'|'reading'|'exercise', minutes, content, videoUrl }
const L = (id, title, type, minutes, content) => ({ id, title, type, minutes, content, videoUrl: null });
const M = (id, title, lessons) => ({ id, title, lessons });
const IMG = 'assets/images/';

export const courses = [
  { id: 'c1', slug: 'financial-market-trading-and-analysis', title: 'Financial Market Trading and Analysis',
    summary: 'Learn how markets work, read price action and build a disciplined, risk-aware approach to analysis.',
    image: IMG + 'academy.jpg', imagePos: '70% 75%', level: 'Beginner to Intermediate', duration: '8 weeks', category: 'Finance',
    outcomes: ['Explain how forex, equities and crypto markets are structured', 'Read candlestick charts and identify trend, support and resistance', 'Size positions and set stop-losses using a written risk plan', 'Keep a trading journal and review performance objectively'],
    audience: ['Beginners curious about financial markets', 'Self-taught traders who want structure', 'Anyone who wants to understand risk before committing capital'],
    skills: ['Technical analysis', 'Risk management', 'Trade journaling', 'Market research'],
    modules: [
      M('m1', 'Market foundations', [L('l1', 'How financial markets work', 'video', 14, 'Participants, exchanges, brokers and liquidity, and why prices move.'), L('l2', 'Reading a price chart', 'video', 18, 'Candlesticks, timeframes and the anatomy of a trend.'), L('l3', 'Glossary and key terms', 'reading', 8, 'Spread, leverage, pip, lot, drawdown and more.')]),
      M('m2', 'Technical analysis', [L('l4', 'Support, resistance and structure', 'video', 20, 'Mapping levels and recognising market structure.'), L('l5', 'Indicators in context', 'video', 17, 'Moving averages and RSI, and their limits.'), L('l6', 'Chart-marking exercise', 'exercise', 25, 'Mark up three supplied charts and justify each level.')]),
      M('m3', 'Risk and discipline', [L('l7', 'Position sizing', 'video', 16, 'Risk a fixed percentage and calculate lot size.'), L('l8', 'Building a trading plan', 'reading', 12, 'Rules for entries, exits and when not to trade.'), L('l9', 'Journaling and review', 'exercise', 20, 'Set up a journal and review a sample week.')])] },
  { id: 'c2', slug: 'ai-automation', title: 'AI Automation',
    summary: 'Use AI tools and workflow automation to remove repetitive work and build useful systems for yourself or clients.',
    image: IMG + 'ai-assistant.jpg', imagePos: 'center', level: 'Beginner', duration: '6 weeks', category: 'Technology',
    outcomes: ['Write clear prompts that produce consistent, usable output', 'Map a manual process and identify what can be automated', 'Connect apps with no-code automation tools', 'Test, monitor and document an automated workflow'],
    audience: ['Freelancers and small business owners', 'Admin and operations staff', 'Beginners with no coding background'],
    skills: ['Prompt design', 'Workflow mapping', 'No-code automation', 'Quality checking AI output'],
    modules: [
      M('m1', 'Working with AI', [L('l1', 'What AI tools can and cannot do', 'video', 12, 'Strengths, limits and responsible use.'), L('l2', 'Prompting fundamentals', 'video', 18, 'Context, constraints, examples and iteration.'), L('l3', 'Prompt library exercise', 'exercise', 20, 'Build five reusable prompts for your own work.')]),
      M('m2', 'Designing workflows', [L('l4', 'Mapping a process', 'video', 15, 'Triggers, steps and outputs.'), L('l5', 'Choosing what to automate', 'reading', 10, 'Frequency, effort and risk.'), L('l6', 'Process map exercise', 'exercise', 25, 'Document one real task end to end.')]),
      M('m3', 'Building automations', [L('l7', 'Connecting apps with triggers and actions', 'video', 22, 'Forms, email, spreadsheets and chat tools.'), L('l8', 'Adding AI steps safely', 'video', 18, 'Human review points and error handling.'), L('l9', 'Capstone: ship a workflow', 'exercise', 40, 'Build, test and document one automation.')])] },
  { id: 'c3', slug: 'copywriting', title: 'Copywriting',
    summary: 'Write clear, persuasive copy for ads, landing pages and emails, grounded in audience research and honest messaging.',
    image: IMG + 'hero-main.jpg', imagePos: '30% 30%', level: 'Beginner', duration: '6 weeks', category: 'Writing',
    outcomes: ['Research an audience and capture their language', 'Structure copy with a clear offer and call to action', 'Write headlines, emails and landing page sections', 'Edit your own work and test variations'],
    audience: ['Aspiring freelance writers', 'Marketers and founders writing their own copy', 'Social media managers'],
    skills: ['Audience research', 'Headline writing', 'Email copy', 'Editing and testing'],
    modules: [
      M('m1', 'Foundations of persuasion', [L('l1', 'What copywriting is for', 'video', 11, 'Copy as a tool for a specific action.'), L('l2', 'Know your reader', 'video', 16, 'Research methods and voice-of-customer notes.'), L('l3', 'Audience profile exercise', 'exercise', 20, 'Write a one-page reader profile.')]),
      M('m2', 'Writing the message', [L('l4', 'Headlines and hooks', 'video', 15, 'Patterns that earn the next sentence.'), L('l5', 'Offer, benefits and proof', 'reading', 12, 'Structure claims you can support.'), L('l6', 'Landing page draft', 'exercise', 30, 'Draft a hero, benefits and CTA section.')]),
      M('m3', 'Channels and refinement', [L('l7', 'Writing emails that get read', 'video', 18, 'Subject lines, structure and sequencing.'), L('l8', 'Editing your draft', 'video', 14, 'Cut, clarify and tighten.'), L('l9', 'Portfolio piece', 'exercise', 35, 'Produce a finished sample for your portfolio.')])] },
  { id: 'c4', slug: 'content-creation', title: 'Content Creation',
    summary: 'Plan, shoot, edit and publish consistent content that builds an audience across short video, photo and written formats.',
    image: IMG + 'academy.jpg', imagePos: '25% 70%', level: 'Beginner', duration: '6 weeks', category: 'Creative',
    outcomes: ['Define a niche, audience and content pillars', 'Plan a repeatable weekly content system', 'Shoot and edit clear short-form video on a phone', 'Read basic analytics and improve over time'],
    audience: ['New creators and personal brands', 'Small businesses building an online presence', 'Social media assistants'],
    skills: ['Content planning', 'Mobile video and photo', 'Editing', 'Analytics basics'],
    modules: [
      M('m1', 'Strategy', [L('l1', 'Niche, audience and pillars', 'video', 14, 'Choose a focus you can sustain.'), L('l2', 'Building a content calendar', 'reading', 10, 'A simple weekly planning system.'), L('l3', 'Pillars exercise', 'exercise', 20, 'Define three pillars and 12 post ideas.')]),
      M('m2', 'Production', [L('l4', 'Lighting, framing and audio', 'video', 18, 'Good results with phone equipment.'), L('l5', 'Editing short-form video', 'video', 22, 'Pacing, captions and cuts.'), L('l6', 'Shoot and edit a first video', 'exercise', 35, 'Produce and self-review a 30-second video.')]),
      M('m3', 'Publishing and growth', [L('l7', 'Platforms and formats', 'video', 15, 'Adapting one idea across platforms.'), L('l8', 'Reading your analytics', 'video', 14, 'Metrics that matter and how to respond.'), L('l9', 'Thirty-day plan', 'exercise', 25, 'Commit to a realistic publishing schedule.')])] },
];

import {
  BookOpen,
  BriefcaseBusiness,
  HeartHandshake,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";

export const programs = [
  {
    slug: "education-youth",
    title: "Education & Youth",
    shortTitle: "Education",
    icon: BookOpen,
    summary:
      "Expanding access to learning, skills and opportunities that help young people build stronger futures.",
    description:
      "POEM supports community-centered education and youth development initiatives designed around local needs, inclusion and practical opportunity.",
    focus: [
      "Access to inclusive learning",
      "Youth skills and leadership",
      "Community learning spaces",
      "Career readiness and mentoring",
    ],
  },
  {
    slug: "livelihoods-skills",
    title: "Livelihoods & Skills",
    shortTitle: "Livelihoods",
    icon: BriefcaseBusiness,
    summary:
      "Building practical skills and pathways that support dignified, sustainable livelihoods.",
    description:
      "Our livelihood work connects people with practical skills, local market opportunities and support systems that strengthen economic resilience.",
    focus: [
      "Market-oriented skills",
      "Enterprise readiness",
      "Employment pathways",
      "Community economic resilience",
    ],
  },
  {
    slug: "community-empowerment",
    title: "Community Empowerment",
    shortTitle: "Community",
    icon: Users,
    summary:
      "Helping communities participate in decisions, organize around priorities and lead local change.",
    description:
      "POEM places participation at the center of development by working with communities as partners in identifying needs, shaping responses and reviewing results.",
    focus: [
      "Community participation",
      "Local leadership",
      "Inclusive planning",
      "Social accountability",
    ],
  },
  {
    slug: "resilience-development",
    title: "Resilience & Development",
    shortTitle: "Resilience",
    icon: Sprout,
    summary:
      "Supporting stronger, more resilient communities through sustainable and people-centered development.",
    description:
      "POEM works to strengthen community resilience by connecting immediate priorities with longer-term social, environmental and institutional capacity.",
    focus: [
      "Community resilience",
      "Sustainable development",
      "Local preparedness",
      "Inclusive recovery",
    ],
  },
];

export const projects = [
  {
    slug: "youth-skills-economic-empowerment",
    title: "Youth Skills & Economic Empowerment",
    category: "Livelihoods",
    location: "Mirpurkhas, Sindh",
    status: "Featured",
    summary:
      "Creating practical pathways for young people through market-oriented skills, confidence building and community support.",
    challenge:
      "Young people in underserved communities often face limited access to practical training, career guidance and local earning opportunities.",
    response:
      "This project model combines skills development, mentoring and community engagement to help participants move from training toward economic opportunity.",
    outcomes: [
      "Improved access to practical skills",
      "Stronger employment and enterprise readiness",
      "Greater confidence and community participation",
    ],
    sdgs: ["SDG 4", "SDG 5", "SDG 8", "SDG 10"],
    accent: "from-[#dce8c6] to-[#afcda9]",
  },
  {
    slug: "inclusive-community-learning",
    title: "Inclusive Community Learning",
    category: "Education",
    location: "Sindh, Pakistan",
    status: "Featured",
    summary:
      "Strengthening inclusive learning opportunities for children, youth and underserved communities.",
    challenge:
      "Geography, poverty and social exclusion can reduce access to consistent, relevant learning opportunities.",
    response:
      "POEM works with communities to identify learning barriers and develop locally appropriate education and youth support activities.",
    outcomes: [
      "Improved participation in learning",
      "Stronger community ownership",
      "More inclusive local education support",
    ],
    sdgs: ["SDG 4", "SDG 5", "SDG 10"],
    accent: "from-[#eadfc9] to-[#d3b990]",
  },
  {
    slug: "community-led-development",
    title: "Community-Led Development",
    category: "Community",
    location: "Rural Sindh",
    status: "Featured",
    summary:
      "Working directly with communities to identify priorities and build sustainable local solutions.",
    challenge:
      "Development efforts are less effective when communities have limited influence over priorities, implementation and accountability.",
    response:
      "POEM facilitates participatory planning and locally-led action so communities can contribute to decisions and track progress.",
    outcomes: [
      "Stronger local participation",
      "More responsive interventions",
      "Greater community ownership",
    ],
    sdgs: ["SDG 10", "SDG 11", "SDG 16", "SDG 17"],
    accent: "from-[#d1e4df] to-[#8eb9ad]",
  },
];

export const principles = [
  {
    icon: HeartHandshake,
    title: "Participation",
    text: "Communities help define priorities, shape responses and evaluate progress.",
  },
  {
    icon: Users,
    title: "Inclusion",
    text: "Programs are designed to reach people who are often excluded from opportunity and decision-making.",
  },
  {
    icon: ShieldCheck,
    title: "Accountability",
    text: "Transparency, responsible stewardship and accessible information are central to trust.",
  },
  {
    icon: Sprout,
    title: "Sustainability",
    text: "POEM prioritizes approaches that build capacity and continue creating value beyond a single activity.",
  },
];

export const resources = [
  {
    type: "Annual Report",
    title: "POEM Annual Report 2026",
    year: "2026",
    description:
      "Institutional progress, program highlights, learning and organizational priorities.",
  },
  {
    type: "Policy",
    title: "Safeguarding & Protection Policy",
    year: "2026",
    description:
      "POEM's commitment to safe, respectful and responsible engagement with communities.",
  },
  {
    type: "Policy",
    title: "Accountability & Complaints Framework",
    year: "2026",
    description:
      "How POEM receives, reviews and responds to feedback and complaints.",
  },
  {
    type: "Project Report",
    title: "Community Development Learning Brief",
    year: "2026",
    description:
      "Key lessons from participatory community development activities.",
  },
];

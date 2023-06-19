const rolesHasuraToDiscord = {
  COMMUNITY: '685294284257362158',
  DESIGN: '685293940856979517',
  TREASURY: '685294025888104617',
  MARKETING: '715597728641581066',
  FRONTEND_DEV: '685292811360141332',
  OPERATIONS: '685312040767979520',
  BIZ_DEV: '685296065569751044',
  BACKEND_DEV: '685299203487957048',
  PROJECT_MANAGEMENT: '685295653509005313',
  SMART_CONTRACTS: '685296849057349701',
  LEGAL: '713430668163416065',
  ACCOUNT_MANAGER: '702992265919987782',
};

const PROJECT_TYPE_MAP = {
  NEW: 'New',
  EXISTING: 'Existing',
};

const BUDGET_RANGE_MAP = {
  LESS_THAN_FIVE_THOUSAND: '< $5k',
  FIVE_TO_TWENTY_THOUSAND: '$5k - $20k',
  TWENTY_TO_FIFTY_THOUSAND: '$20k - $50k',
  MORE_THAN_FIFTY_THOUSAND: '$50k +',
};

const SERVICES_MAP = {
  DAO: 'DAO (Design, Deployment)',
  DEVELOPMENT: 'Development (Frontend, Backend)',
  MARKETING: 'Marketing (Social Media, Copywriting, Memes/GIFs)',
  MOTION_DESIGN: 'Motion Design (Video, Explainers, Sticker Packs)',
  NFTS: 'NFTs (Contracts, Art, Tokenomics)',
  SMART_CONTRACTS: 'Smart Contracts (Solidity, Audits)',
  STRATEGY: 'Strategy (Product, Launch Planning, Agile)',
  TOKENOMICS: 'Tokenomics (Incentives, Distribution, Rewards)',
  UX: 'UX (Research, Testing, User Stories)',
  UI: 'UI (Interface Design, Interaction Design)',
  VISUAL_DESIGN: 'Visual Design (Branding, Illustration, Graphics)',
  HELP_ME: 'Help me figure out what I need',
};

const SKILL_MAP = {
  FRONTEND: 'Frontend Dev',
  BACKEND: 'Backend Dev',
  SOLIDITY: 'Solidity',
  BIZ_DEV: 'BizDev',
  COMMUNITY: 'Community',
  PROJECT_MANAGEMENT: 'Project Management',
  FINANCE: 'Finance',
  PRODUCT_DESIGN: 'Product Design',
  UX_RESEARCH: 'UX Research',
  GAME_THEORY: 'Game Theory',
  DEVOPS: 'DevOps',
  TOKENOMICS: 'Tokenomics',
  CONTENT: 'Content',
  MEMES: 'Memes',
  VISUAL_DESIGN: 'Visual Design',
  UI_DESIGN: 'UI Design',
  ILLUSTRATION: 'Illustration',
  LEGAL: 'Legal',
  ACCOUNTING: 'Accounting',
};

const SKILL_TYPE_MAP = {
  TECHNICAL: 'Technical',
  NON_TECHNICAL: 'Non - Technical',
  NOT_APPLICABLE: 'Not Applicable',
  OTHER: 'Other',
};

const AVAILABILITY_MAP = {
  LESS_THAN_FIVE_HOURS: '0-5 hours',
  SIX_TO_TWELVE_HOURS: '6-12 hours',
  THIRTEEN_TO_THIRTY_FIVE_HOURS: '13-35 hours',
  MORE_THAN_THIRTY_SIX_HOURS: '36+ hours',
  NOT_APPLICABLE: 'Not Applicable',
};

module.exports = {
  rolesHasuraToDiscord,
  PROJECT_TYPE_MAP,
  BUDGET_RANGE_MAP,
  SERVICES_MAP,
  SKILL_MAP,
  SKILL_TYPE_MAP,
  AVAILABILITY_MAP,
};

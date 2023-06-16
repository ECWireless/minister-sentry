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

module.exports = {
  rolesHasuraToDiscord,
  PROJECT_TYPE_MAP,
  BUDGET_RANGE_MAP,
  SERVICES_MAP,
};

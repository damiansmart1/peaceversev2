// Plain-language conflict-form vocabulary for the multi-form early warning framework.
// Reporters choose everyday descriptions — never technical terminology — and the
// platform (AI + reviewers) maps them onto analysis categories.

export interface ConflictFormOption {
  key: string;
  label: string;
  hint: string;
}

export const CONFLICT_FORMS: ConflictFormOption[] = [
  {
    key: 'physical_violence',
    label: 'Physical violence or a security incident',
    hint: 'Fighting, attacks, injuries or damage to people or property',
  },
  {
    key: 'threats_intimidation',
    label: 'Threats, intimidation or pressure',
    hint: 'Someone being warned, coerced or frightened into silence',
  },
  {
    key: 'community_distress',
    label: 'Fear, distress or rising tension',
    hint: 'People feel unsafe or anxious even without open violence',
  },
  {
    key: 'political_hostility',
    label: 'Political hostility or election tension',
    hint: 'Hostile campaign language, party confrontation, election-related threats',
  },
  {
    key: 'identity_tension',
    label: 'Tension between communities or groups',
    hint: 'Strain between ethnic, religious, clan or identity groups',
  },
  {
    key: 'online_harm',
    label: 'Online harassment or false information',
    hint: 'Abusive messages, inflammatory posts or rumours spreading',
  },
  {
    key: 'discrimination_exclusion',
    label: 'Discrimination, exclusion or service disputes',
    hint: 'People being shut out of services, resources or opportunities',
  },
  {
    key: 'institutional_trust',
    label: 'Worsening trust with institutions',
    hint: 'Communities losing confidence in authorities or public bodies',
  },
  {
    key: 'unsure',
    label: "I'm not sure what to call it",
    hint: 'Describe it in your own words — our team will assess it',
  },
];

export const CONFLICT_FORM_LABELS: Record<string, string> = Object.fromEntries(
  CONFLICT_FORMS.map((f) => [f.key, f.label]),
);

export const formatConflictForms = (forms?: string[] | null) =>
  (forms || []).map((f) => CONFLICT_FORM_LABELS[f] || f.replace(/_/g, ' '));

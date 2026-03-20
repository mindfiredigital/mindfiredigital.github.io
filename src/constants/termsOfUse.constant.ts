// ── Terms of Use Page ─────────────────────────────────────────────────────────

import { SectionData } from "@/types";

export const TERMS_INTRO_PARAGRAPHS = [
  'These "Terms" regulate your use of the website provided by the platform and the services it offers ("Services"). They constitute a legally binding agreement between you and the platform, so review them carefully.',
  "These Terms exclusively apply to this Website and do not extend to open source code on GitHub or other websites, each governed by their respective terms.",
  "The platform may modify these Terms and Website features at any time. Such changes become effective upon posting, and your continued use of the Website implies acceptance of these changes.",
] as const;

export const termsData: SectionData[] = [
  {
    title: "Third-Party Links",
    description:
      "The Website may include links to third-party content, but the platform has no control or responsibility over such platforms. Review their terms and policies before participation.",
  },
  {
    title: "Limitation of Liability",
    description: `The Website and Services are provided "as is" without guarantees of safety, security, or error-free use. The platform disclaims all warranties. The platform is not responsible for user conduct or content. Liability is limited to the fullest extent permitted by law, and the platform is not liable for lost profits, data, or indirect damages.`,
  },
  {
    title: "Dispute Resolution",
    description:
      "Disputes related to these Terms shall be resolved in specific courts, with applicable law governing. Users subject to European Union law may be subject to their country's laws and courts.",
  },
  {
    title: "Privacy",
    description:
      "Data protection details are outlined in the Privacy Policy. The Cookie Policy explains website cookie usage.",
  },
  {
    title: "Additional Terms",
    description:
      "These Terms constitute the entire agreement between you and the platform. Unenforceable portions do not affect the remainder. No transfer of rights or obligations is allowed without the platform's consent. These Terms do not create a partnership or agency relationship. No third-party beneficiary rights exist, and the platform's rights and obligations are freely assignable. All rights not explicitly granted are reserved by the platform.",
  },
];

import { StaticImageData } from "next/image";
import redirectIcon from "../../public/images/social-media/maximize.png";
interface Navigation {
  name: string;
  path: string[];
  target?: string;
  icon?: string | StaticImageData;
  iconAlt?: string;
}

interface SectionData {
  title: string;
  description: string;
}

const navigations: Navigation[] = [
  {
    name: "About",
    path: ["/about"],
  },
  {
    name: "Projects",
    path: ["/projects", "/current-projects", "/upcoming-projects"],
  },
  {
    name: "Contributors",
    path: ["/contributors"],
  },
  {
    name: "Package",
    path: ["/package"],
  },
  {
    name: "GitHub",
    path: ["https://github.com/mindfiredigital"],
    target: "_blank",
    icon: redirectIcon,
    iconAlt: "redirect_icon",
  },
];

const cookieData: SectionData[] = [
  {
    title: "Why Do We Use Cookies?",
    description: `Cookies serve several essential purposes for our website. First,
            they enhance security by identifying and mitigating potential
            threats, thus ensuring a safer user experience. Additionally,
            cookies optimize the website's performance by efficiently
            routing traffic between servers and adapting to individual
            preferences, resulting in faster loading times and a personalized
            feel. Furthermore, they enable seamless integration with third-party
            services, like GitHub, enhancing functionality and enriching the
            user experience. Finally, cookies gather valuable data through tools
            such as Google Analytics, providing insights into user behavior and
            preferences, which we use to continually improve and tailor our
            website to your needs.`,
  },
  {
    title: "How Can You Control Our Website's Use of Cookies?",
    description: `You may have the option to refuse or disable cookies by adjusting
            your web browser settings or by visiting a relevant website. The
            process for doing this can vary depending on your specific web
            browser, and instructions are typically available in the
            browser's "help" section. Please be aware that if you
            choose to refuse, disable, or delete these technologies, some
            functionality of the Website may not be available to you.`,
  },
  {
    title: "How Often Will We Update This Cookie Policy?",
    description: `We may periodically update this Cookie Policy to reflect changes in
            the cookies and related technologies we use, or for other
            operational, legal, or regulatory reasons. Each time you use our
            Website, the current version of the Cookie Policy will apply.
            Therefore, we recommend checking the date of this Cookie Policy at
            the top of the document and reviewing any changes since the last
            version.`,
  },
  {
    title: "",
    description: "",
  },
];

const missonSectionData: SectionData[] = [
  {
    title: "collaborative creativity",
    description:
      " Fostering a culture of collaboration and creativity where diverse minds come together to innovate.",
  },
  {
    title: "knowledge sharing",
    description:
      "Sharing knowledge openly and freely, enabling continuous learning and growth within our community.",
  },
  {
    title: "positive global impact",
    description:
      "Building open source solutions that address real-world challenges and bring about positive change on a global scale",
  },
];

const whyOpenSourceSectionData: SectionData[] = [
  {
    title: "Collaboration",
    description:
      "Embracing the power of collective effort to drive progress and create better solutions",
  },
  {
    title: "Transparency",
    description:
      "Promoting openness and clarity, ensuring trust and shared understanding in our work",
  },
  {
    title: "Innovation",
    description:
      "Sparking creativity and new ideas, pushing boundaries, and evolving through shared knowledge and learning",
  },
];

const termsData: SectionData[] = [
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

const joinUsGetStartSectionData: SectionData[] = [
  {
    title: "Create a GitHub account",
    description:
      "Projects are hosted on GitHub, requiring a GitHub account for contributions through issue submissions and pull requests.",
  },
  {
    title: "Find a project",
    description:
      "From web and mobile to AI and machine learning, we have diverse projects. Please visit our Projects page to explore.",
  },
  {
    title: "Read the docs",
    description:
      "GitHub repos include README with project info and optional website links. Some projects use Docusaurus for docs.",
  },
  {
    title: "Submit your first pull request",
    description:
      "You're all set to begin contributing! Explore this GitHub guide to understand pull requests, a way to notify others about your repository changes.",
  },
];

export {
  navigations,
  missonSectionData,
  whyOpenSourceSectionData,
  cookieData,
  termsData,
  joinUsGetStartSectionData,
};

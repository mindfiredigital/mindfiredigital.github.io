import { SectionData } from "@/types";

export const COOKIE_POLICY_INTRO =
  'Cookies are small pieces of text that are used to store information on web browsers. They help in storing and receiving identifiers and other data on computers, smartphones, and other devices. In this policy, we collectively refer to all such technologies as "cookies." We utilize cookies to enhance your experience on our open source websites, including all associated content, documentation, information,collectively known as the &quot;Website.&quot' as const;

export const cookieData: SectionData[] = [
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

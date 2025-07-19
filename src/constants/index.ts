import redirectIcon from "../../public/images/social-media/maximize.png";
import { Navigation } from "@/types";
import { SectionData } from "@/types";

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
    name: "Packages",
    path: ["/packages"],
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

const privacyPolicyContentData = [
  {
    title: "PERSONAL IDENTIFICATION INFORMATION",
    description: `We may collect personal identification information from Users in a
       variety of ways, including, but not limited to, when Users visit our
       site, register on the site, place a request, and in connection with
       other activities, services, features or resources we make available on
       our Site. Users may be asked for, as appropriate, name, email address,
       mailing address, phone number. Users may, however, visit our Site
       anonymously. We will collect personal identification information from
       Users only if they voluntarily submit such information to us. Users can
       always refuse to supply personal identification information, except that
       it may prevent them from engaging in certain Site related activities.`,
  },
  {
    title: "NON-PERSONAL IDENTIFICATION INFORMATION",
    description: `We may collect non-personal identification information about Users
        whenever they interact with our Site. Non-personal identification
        information may include the browser name, the type of computer and
        technical information about Users’ means of connection to our Site, such
        as the operating system, the Internet service provider utilised, and
        other similar information.`,
  },
  {
    title: "WEB BROWSER COOKIES",
    description: `Our Site may use “cookies” to enhance User experience. User’s web
        browser places cookies on their hard drive for record-keeping purposes
        and sometimes to track information about them. User may choose to set
        their web browser to refuse cookies, or to alert you when cookies are
        being sent. If they do so, note that some parts of the Site may not
        function properly.`,
  },
  //   {
  //     title: "HOW WE USE COLLECTED INFORMATION",
  //     description: `Mindfire Digital GitHub may collect and use the Users’ personal
  //         information for the following purposes: To improve customer service –
  //         Information you provide helps us respond to your service requests and
  //         support needs efficiently. To personalise user experience – We may use
  //         information in the aggregate to understand how our Users as a group use
  //         the services and resources provided on our Site. To improve our Site –
  //         We may use feedback you provide to improve our products and services. To
  //         process payments – We may use the information Users provide about
  //         themselves when placing a service request only to address it. We do not
  //         share this information with outside parties except to the extent
  //         necessary to provide the service. To send Users information they agreed
  //         to receive about topics we think will be of interest to them.`,
  //   },
  {
    title: "HOW WE PROTECT YOUR INFORMATION",
    description: `We adopt appropriate data collection, storage and processing practices
        and security measures to protect against reauthorized access,
        alteration, disclosure or destruction of your personal information
        stored on our site. Sensitive and private data exchange between the Site
        and its Users happens over a SSL secured communication channel.`,
  },
  {
    title: "SHARING YOUR PERSONAL INFORMATION",
    description: `We may share information if we think we have to in order to comply with
        the law or to protect ourselves. We will share information to respond to
        a court order or subpoena. We may also share it if a government agency
        or investigatory body requests. Or, we might also share information when
        we are investigating potential fraud.`,
  },
  //   {
  //     title: "GOOGLE ADSENSE",
  //     description: `Some of the ads may be served by Google. Google’s use of the DART cookie
  //         enables it to serve ads to Users based on their visit to our Site and
  //         other sites on the Internet. DART uses “non personally identifiable
  //         information” and does NOT track personal information about you, such as
  //         your name, email address, physical address, etc. You may opt out of the
  //         use of the DART cookie by visiting the Google ad and content network
  //         privacy policy at http://www.google.com/privacy_ads.html`,
  //   },
  {
    title: "CHANGES TO THIS PRIVACY POLICY",
    description: `Mindfire Digital GitHub has the discretion to update this privacy policy
        at any time. We encourage Users to frequently check this page for any
        changes to stay informed about how we are helping to protect the
        personal information we collect. You acknowledge and agree that it is
        your responsibility to review this privacy policy periodically and
        become aware of modifications.`,
  },
  {
    title: "JURISDICTION",
    description: `If you choose to visit the website, your visit and any dispute over
        privacy is subject to this Policy and the website’s terms of use. In
        addition to the foregoing, any disputes arising under this Policy shall
        be governed by the laws of India.`,
  },
];

export {
  navigations,
  missonSectionData,
  whyOpenSourceSectionData,
  cookieData,
  termsData,
  joinUsGetStartSectionData,
  privacyPolicyContentData,
};

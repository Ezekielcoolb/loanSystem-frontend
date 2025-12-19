import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { 
  Download, Mail, Phone, Github, MapPin, 
  Briefcase, ExternalLink 
} from "lucide-react";

export default function Frontend() {
  const cvRef = useRef(null);

  const handleDownload = () => {
    const element = cvRef.current;
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     'Ezekiel_Frontend_CV.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const experiences = [
    {
      company: "ErrandAfrica Limited",
      role: "Frontend Engineer (Contract)",
      duration: "May 2025 - Dec 2025",
      location: "Remote",
      description: [
        "Led the frontend development of a comprehensive loan application system, translating complex requirements into a seamless, user-friendly interface.",
        "Built a responsive and accessible UI using React.js and Tailwind CSS, ensuring a consistent experience across all devices and screen sizes.",
        "Optimized application performance by implementing code splitting, lazy loading, and efficient state management with Redux Toolkit.",
        "Collaborated with backend engineers to integrate RESTful APIs, ensuring real-time data synchronization and smooth user interactions."
      ],
      projects: []
    },
    {
      company: "Stark Limited",
      role: "Frontend Engineer",
      duration: "July 2023 - April 2025",
      location: "Lagos, Nigeria",
      description: [
        "Served as a core frontend engineer delivering high-fidelity web interfaces for government, real estate, and media sectors.",
        "Developed the client-side architecture for the National Road Agency (RUA) platform, implementing interactive features like real-time maps and dynamic forms.",
        "Created the immersive user experience for 'Sylvastar Residences', utilizing modern CSS techniques and animations to showcase properties effectively.",
        "Built the interactive player and chat interface for 'Pluglr', ensuring low-latency updates and a highly responsive media experience.",
        "Maintained a component library to ensure design consistency and speed up development cycles across multiple projects."
      ],
      projects: [] 
    },
    {
      company: "Foz-Engineering Ventures",
      role: "Frontend Developer (Contract)",
      duration: "Nov 2022 - April 2023",
      location: "Lagos, Nigeria",
      description: [
        "Developed and launched the corporate website for a major engineering construction firm, focusing on visual appeal and brand alignment.",
        "Engineered a high-performance, SEO-optimized user interface using React.js and Next.js, achieving top Lighthouse scores for performance and accessibility.",
        "Implemented responsive design principles to ensure the site looked and functioned perfectly on mobile, tablet, and desktop devices.",
        "Collaborated with designers to translate high-fidelity mockups into pixel-perfect, interactive web pages."
      ],
      projects: []
    },
    {
      company: "DivineBlossom",
      role: "Frontend Developer",
      duration: "Jan 2022 - Nov 2022",
      location: "Abeokuta, Nigeria",
      description: [
        "Designed and built the frontend for a comprehensive school management portal, focusing on usability for non-technical staff and parents.",
        "Created intuitive dashboards for student records, result processing, and fee payments using React.js.",
        "Developed a custom, easy-to-use content management interface allowing staff to update school news and events.",
        "Ensured cross-browser compatibility and resolved UI/UX issues based on user feedback."
      ],
      projects: []
    },
    {
      company: "100Devs Agency",
      role: "Frontend Intern",
      duration: "Jan 2021 - Dec 2021",
      location: "Los Angeles (Remote)",
      description: [
        "Participated in an intensive frontend engineering training program, mastering HTML5, CSS3, JavaScript, and React.",
        "Collaborated in an agile team to build semantic, accessible, and responsive web applications from scratch.",
        "Translated Figma designs into functional code, ensuring strict adherence to design specifications and accessibility standards.",
        "Gained hands-on experience with version control (Git) and collaborative development workflows."
      ],
      projects: []
    }
  ];

  const featuredProjects = [
    {
      name: "RUA (National Road Agency Project)",
      url: "https://rua.com.ng/",
      role: "Frontend Developer",
      description: "A comprehensive platform designed for the National Road Agency to enhance safety and accountability in transportation.",
      features: [
        "Implemented a responsive dashboard for drivers to log digital manifests.",
        "Built real-time tracking interfaces for commuters using map integrations.",
        "Designed intuitive forms for emergency reporting and item lodging.",
        "Optimized frontend performance for low-bandwidth environments."
      ]
    },
    {
      name: "Pluglr",
      url: "https://pluglr.com/",
      role: "Frontend Developer",
      description: "A dynamic online radio station platform fostering real-time interaction between broadcasters and listeners.",
      features: [
        "Developed a custom audio player with continuous streaming capabilities.",
        "Built a real-time chat interface using WebSockets for listener engagement.",
        "Created a responsive layout that adapts seamlessly to mobile and desktop screens.",
        "Implemented smooth transitions and animations for a polished user experience."
      ]
    }
  ];

  const allProjects = [
    { name: "Holybrooks Transportation", url: "https://holybrookstransportation.com/" },
    { name: "RUA", url: "https://rua.com.ng/" },
    { name: "Recdbase (Document Management)", url: "https://recdbase.org/" },
    { name: "Sylvastar Residences (Real Estate)", url: "https://sylvastarresidences.com/" },
    { name: "The Lux at JELB", url: "https://theluxatjelb.com/" },
    { name: "Abrigo LLC", url: "https://abrigo-llc.com/" },
    { name: "Foz Engineering", url: "https://fozengineeringventures.com/" },
    { name: "Divine Blossom Schools", url: "https://divineblossomschools.com/" },
    { name: "Firdaus Gate Schools", url: "https://firdausgateschools.com/" },
    { name: "Pluglr (Radio)", url: "https://pluglr.com/" },
    { name: "Casemack (Legal Case Mgmt)", url: "https://casemack.vercel.app/" },
    { name: "Bluecollar (Job Board)", url: "https://bluecollar-ten.vercel.app/" }
  ];

  const skills = [
    "JavaScript (ES6+)", "React.js", "Next.js", "TypeScript", 
    "Tailwind CSS", "HTML5 & CSS3", "Redux Toolkit", "Git/GitHub",
    "RESTful APIs", "Responsive Design", "Web Performance", "Accessibility (a11y)"
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      {/* Download Button - Hidden in Print */}
      <div className="mx-auto max-w-4xl px-6 mb-8 flex justify-end print:hidden">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl active:scale-95"
        >
          <Download className="h-5 w-5" />
          Download CV
        </button>
      </div>

      {/* CV Container */}
      <div 
        ref={cvRef}
        className="mx-auto max-w-4xl bg-white p-8 shadow-xl print:shadow-none print:p-0 print:max-w-none"
      >
        {/* Header */}
        <header className="border-b-2 border-slate-100 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Opaleye Boluwatife Ezekiel</h1>
          <p className="text-xl text-indigo-600 font-medium mb-6">Frontend Engineer</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> ezekielcoolb@gmail.com
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> 08077198333, 07012301293
            </div>
            <div className="flex items-center gap-1.5">
              <Github className="h-4 w-4" /> github.com/Ezekielcoolb
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Lagos, Nigeria
            </div>
          </div>
        </header>

        {/* Professional Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <span className="h-1 w-6 bg-indigo-600 rounded-full"></span>
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Creative and detail-oriented Frontend Engineer with extensive experience in building responsive, accessible, and high-performance web applications. Proficient in modern JavaScript frameworks like React.js and Next.js, with a strong eye for design and user experience. Proven ability to translate complex requirements into intuitive user interfaces and collaborate effectively within cross-functional teams.
          </p>
        </section>

        {/* Skills */}
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <span className="h-1 w-6 bg-indigo-600 rounded-full"></span>
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium print:border print:border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Featured Projects */}
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
            <span className="h-1 w-6 bg-indigo-600 rounded-full"></span>
            Featured Projects
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-5 print:border-slate-300">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                  <p className="text-xs font-medium text-indigo-600 mb-1">{project.role}</p>
                  <a href={project.url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-indigo-600 block mb-2">
                    {project.url}
                  </a>
                </div>
                <p className="mb-4 text-sm text-slate-600">{project.description}</p>
                <ul className="space-y-2">
                  {project.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
            <span className="h-1 w-6 bg-indigo-600 rounded-full"></span>
            Work Experience
          </h2>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="relative pl-4 border-l-2 border-slate-200">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-200 border-2 border-white"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">{exp.duration}</span>
                </div>
                
                <div className="mb-3 flex items-center gap-2 text-sm text-indigo-600 font-medium">
                  <Briefcase className="h-4 w-4" />
                  {exp.company}
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-normal">{exp.location}</span>
                </div>

                <ul className="list-disc list-outside ml-4 space-y-1">
                    {exp.description.map((desc, dIndex) => (
                        <li key={dIndex} className="text-slate-700 text-sm leading-relaxed pl-1">
                            {desc}
                        </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Project Links */}
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <span className="h-1 w-6 bg-indigo-600 rounded-full"></span>
            Project Portfolio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {allProjects.map((project, index) => (
              <div 
                key={index}
                className="flex flex-col py-2 border-b border-slate-100 px-2"
              >
                <span className="text-sm font-bold text-slate-800">{project.name}</span>
                <a href={project.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                    {project.url}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Footer for Print */}
        <footer className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>References available upon request.</p>
        </footer>
      </div>
    </div>
  );
}

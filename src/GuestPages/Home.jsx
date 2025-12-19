import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { 
  Download, Mail, Phone, Github, Globe, MapPin, 
  Briefcase, Calendar, ExternalLink, Award, Code2 
} from "lucide-react";

export default function Home() {
  const cvRef = useRef(null);

  const handleDownload = () => {
    const element = cvRef.current;
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     'Ezekiel_CV.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const experiences = [
    {
      company: "ErrandAfrica Limited",
      role: "Full Stack Engineer (Contract)",
      duration: "May 2025 - Dec 2025",
      location: "Remote",
      description: [
        "Spearheaded the end-to-end architecture and development of a comprehensive loan application system, transforming manual processes into a streamlined digital workflow.",
        "Designed and implemented secure, scalable RESTful APIs using Node.js and Express, ensuring robust data handling and seamless integration with third-party payment gateways.",
        "Built a responsive and intuitive user interface with React.js and Tailwind CSS, focusing on accessibility and user experience to facilitate easy loan requests and management.",
        "Implemented rigorous testing protocols and automated deployment pipelines, resulting in a 40% reduction in system downtime and faster feature release cycles."
      ],
      projects: []
    },
    {
      company: "Stark Limited",
      role: "Full Stack Engineer",
      duration: "July 2023 - April 2025",
      location: "Lagos, Nigeria",
      description: [
        "Served as a core engineer delivering diverse, high-impact web solutions across government, real estate, and media sectors, directly contributing to the company's portfolio expansion.",
        "Led the full-stack development of the National Road Agency (RUA) platform, implementing complex features like real-time ride tracking, digital manifesting, and emergency reporting systems.",
        "Developed 'Sylvastar Residences', a sophisticated real estate platform enabling installment payment tracking and property management, boosting sales engagement by 25%.",
        "Engineered 'Pluglr', an interactive online radio platform with live audio streaming and real-time chat, supporting thousands of concurrent listeners.",
        "Collaborated closely with cross-functional teams to gather requirements, design database schemas, and deliver scalable applications within tight deadlines."
      ],
      projects: [] 
    },
    {
      company: "Foz-Engineering Ventures",
      role: "Frontend Developer (Contract)",
      duration: "Nov 2022 - April 2023",
      location: "Lagos, Nigeria",
      description: [
        "Developed and launched the corporate website for a major engineering construction firm, significantly enhancing their digital presence and brand professionality.",
        "Focused on creating a high-performance, SEO-optimized user interface using React.js, ensuring fast load times and mobile responsiveness across all devices.",
        "Implemented modern UI/UX design principles to effectively showcase the company's extensive project portfolio and service offerings to potential clients.",
        "Managed the website's ongoing maintenance and updates, ensuring content accuracy and platform security."
      ],
      projects: []
    },
    {
      company: "DivineBlossom",
      role: "Full Stack Engineer",
      duration: "Jan 2022 - Nov 2022",
      location: "Abeokuta, Nigeria",
      description: [
        "Architected and administered a comprehensive school management portal, digitizing student records, result processing, and fee payments.",
        "Built a custom content management system (CMS) allowing staff to easily update school news, events, and academic calendars without technical assistance.",
        "Improved administrative efficiency by 60% through the automation of report card generation and attendance tracking.",
        "Provided technical training and support to school staff, ensuring smooth adoption of the new digital tools."
      ],
      projects: []
    },
    {
      company: "100Devs Agency",
      role: "Full Stack Intern",
      duration: "Jan 2021 - Dec 2021",
      location: "Los Angeles (Remote)",
      description: [
        "Participated in an intensive, immersive software engineering training program, gaining deep expertise in the MERN stack and modern web development practices.",
        "Collaborated within an agile team environment to build semantic, accessible, and responsive web applications, adhering to industry-standard coding conventions.",
        "Contributed to open-source projects and community-driven initiatives, refining skills in version control (Git) and collaborative development.",
        "Developed full-stack applications from scratch, translating Figma designs into pixel-perfect, functional code."
      ],
      projects: []
    }
  ];

  const featuredProjects = [
    {
      name: "RUA (National Road Agency Project)",
      url: "https://rua.com.ng/",
      role: "Full Stack Developer",
      description: "A comprehensive platform designed for the National Road Agency to enhance safety and accountability in transportation.",
      features: [
        "Digital manifest logging for drivers to record trip details.",
        "Real-time ride joining for commuters for tracking and safety.",
        "Emergency flagging system allowing users to report dangerous rides or locations directly to agencies like the Police and FRSC.",
        "Lost and found item lodging system."
      ]
    },
    {
      name: "Pluglr",
      url: "https://pluglr.com/",
      role: "Full Stack Developer",
      description: "A dynamic online radio station platform fostering real-time interaction between broadcasters and listeners.",
      features: [
        "Live audio streaming capabilities for continuous broadcast.",
        "Interactive call-in feature allowing listeners to join the conversation live.",
        "Real-time chat and engagement tools for community building.",
        "Seamless media management for scheduled programming."
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
    "JavaScript (ES6+)", "React.js", "Node.js", "Express.js", 
    "MongoDB", "Tailwind CSS", "Redux Toolkit", "Git/GitHub",
    "RESTful APIs", "Responsive Design", "Web Performance", "Next.js", "mySql"
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
          <p className="text-xl text-indigo-600 font-medium mb-6">Full Stack Engineer</p>
          
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
            Experienced Full Stack Engineer with a proven track record of delivering robust web applications across diverse industries including transportation, real estate, and education. Proficient in the MERN stack (MongoDB, Express, React, Node.js) and modern frontend technologies. Adept at managing projects from conception to deployment, ensuring scalability, performance, and user-centric design.
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

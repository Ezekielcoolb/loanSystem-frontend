import React, { useRef } from 'react';
import html2pdf from "html2pdf.js";
import { Mail, Phone, MapPin, Linkedin, Globe, Download, ExternalLink, Calendar, Plus } from 'lucide-react';
// import { useReactToPrint } from 'react-to-print'; // Optional: for PDF export later

export default function SocialMediaCV() {
  const componentRef = useRef();

  const handleDownload = () => {
    const element = componentRef.current;
    
    // Temporarily hide the download button to avoid it showing in the PDF
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) downloadBtn.style.display = 'none';

    const opt = {
      margin:       0,
      filename:     'Precious_Gift_Social_Media_CV.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Show button again
        if (downloadBtn) downloadBtn.style.display = 'flex';
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Download Button */}
      <div className="max-w-4xl mx-auto flex justify-end mb-6">
        <button
            id="download-btn"
            onClick={handleDownload}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition-all font-medium"
        >
            <Download className="w-4 h-4" />
            Download PDF
        </button>
      </div>

      <div ref={componentRef} className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Adimu Precious Titilola</h1>
              <p className="text-indigo-200 text-lg md:text-xl font-medium tracking-wide">Social Media Manager</p>
            </div>
            
            {/* Contact Info (Header Variant) */}
            {/* <div className="flex flex-col gap-2 text-sm md:text-right">
              <a href="#" className="flex items-center gap-2 hover:text-indigo-300 transition-colors md:justify-end">
                <span>portfolio-link.com</span>
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-indigo-300 transition-colors md:justify-end">
                <span>linkedin.com/in/yourprofile</span>
                <Linkedin className="w-4 h-4" />
              </a>
            </div> */}
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
           {/* Sidebar / Left Column (Contact & Skills) */}
           <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-200">
             
             {/* Profile Picture Placeholder */}
             <div className="mb-8 flex justify-center md:justify-start">
               <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                 {/* <span className="text-slate-400 text-4xl">photo</span> */}
                 <img src="/images/photo.jpeg" alt="Profile" className="w-full h-full object-cover" />
               </div>
             </div>

             {/* Contact Details */}
             <div className="mb-8">
               <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4 border-b pb-2">Contact</h3>
               <ul className="space-y-3 text-slate-700 text-sm">
                 <li className="flex items-start gap-3">
                   <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                   <span className="break-all">precioustitilolagift@gmail.com</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <Phone className="w-5 h-5 text-indigo-600 shrink-0" />
                   <span>08037434973</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                   <span>Lagos, Nigeria</span>
                 </li>
               </ul>
             </div>

             {/* Skills */}
             <div className="mb-8">
               <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4 border-b pb-2">Core Skills</h3>
               <div className="flex flex-wrap gap-2">
                 {['Content Strategy', 'Community Management', 'Copywriting', 'SEO Basics', 'Canva & Graphic Design', 'Data Analytics', 'Paid Advertising', 'Video Editing'].map(skill => (
                   <span key={skill} className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                     {skill}
                   </span>
                 ))}
               </div>
             </div>

             {/* Tools */}
             <div className="mb-8">
               <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4 border-b pb-2">Tools</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Meta Business Suite</li>
                  <li>• Google Analytics</li>
                  <li>• CapCut / InShot</li>
                  <li>• Hootsuite / Buffer</li>
                  <li>• Adobe Creative Suite</li>
                </ul>
             </div>
           </div>

           {/* Main Content Area */}
           <div className="w-full md:w-2/3 p-8 md:p-10">
             
             {/* Profile Summary */}
             <section className="mb-10">
               <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                 Professional Profile
               </h2>
               <p className="text-slate-600 leading-relaxed">
                 Dynamic and results-oriented Social Media Manager with a strong background in science and analytical thinking. 
                 Provenance in developing engaging content strategies and growing online communities. 
                 Combines creative storytelling with data-driven insights to maximize brand visibility and engagement. 
                 Passionate about leveraging digital trends to deliver impactful marketing campaigns.
               </p>
             </section>

             {/* Work Experience */}
             <section className="mb-10">
               <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                 Work Experience
               </h2>

               {/* Job 2: Adihans */}
               <div className="relative border-l-2 border-indigo-100 pl-8 pb-8 last:pb-0">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                   <h3 className="text-lg font-bold text-slate-800">Social Media Manager</h3>
                   <span className="text-sm text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded mt-1 sm:mt-0">
                     Dec 2023 – Dec 2025
                   </span>
                 </div>
                 <h4 className="text-indigo-900 font-medium mb-3">Adihans Global Services</h4>
                 <ul className="list-disc list-outside ml-4 text-slate-600 space-y-2 text-sm leading-relaxed">
                   <li>Developed and executed comprehensive social media strategies across Instagram, TikTok, and Twitter, resulting in increased brand awareness.</li>
                   <li>Managed the content calendar, creating high-quality posts, reels, and stories that consistently engaged the target audience.</li>
                   <li>Analyzed monthly performance metrics to optimize campaigns and report ROI to stakeholders.</li>
                   <li>Collaborated with design teams to ensure visual consistency and brand alignment across all digital channels.</li>
                 </ul>
               </div>

               {/* Job 1: Precious Gift */}
               <div className="relative border-l-2 border-indigo-100 pl-8 pb-8 last:pb-0">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                   <h3 className="text-lg font-bold text-slate-800">Social Media Specialist</h3>
                   <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded mt-1 sm:mt-0">
                     Feb 2023 – Nov 2023
                   </span>
                 </div>
                 <h4 className="text-slate-700 font-medium mb-3">Precious Gift Global Ventures</h4>
                 <ul className="list-disc list-outside ml-4 text-slate-600 space-y-2 text-sm leading-relaxed">
                   <li>Spearheaded daily community engagement initiatives, responding to inquiries and fostering a positive brand image.</li>
                   <li>Assisted in the launch of product campaigns that boosted online inquiries by significant margins.</li>
                   <li>Curated user-generated content and managed influencer partnerships to expand organic reach.</li> 

                 </ul>
               </div>
             </section>

             {/* Education */}
             <section>
               <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                 Education
               </h2>
               
               <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 flex items-start gap-4">
                 <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg hidden sm:block">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path d="M12 14l9-5-9-5-9 5 9 5z" />
                     <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v5" />
                   </svg>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Bachelor of Science in Industrial Chemistry</h3>
                    <p className="text-slate-600">Olabisi Onabanjo University</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-indigo-600 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Graduated: Nov 2025</span>
                    </div>
                 </div>
               </div>
             </section>

           </div>
        </div>
        
        {/* Footer / Credits */}
        {/* <div className="bg-slate-50 border-t border-slate-200 p-6 text-center text-slate-400 text-xs">
          &copy; 2025 Professional CV. Designed with React & Tailwind CSS.
        </div> */}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import GallerySection from "@/components/GallerySection";
import ResumeSection from "@/components/ResumeSection";
import LuckyWheel from "@/components/LuckyWheel";
import ContactSection from "@/components/ContactSection";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const [heroData, setHeroData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [wheelData, setWheelData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [projectsContent, setProjectsContent] = useState(null);
  const [galleryContent, setGalleryContent] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState(null);
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [hero, about, proj, gal, resume, wheel, contact, projContent, galContent, fbContent, footer] = await Promise.all([
          fetch(`${API}/content/hero`).then(r => r.json()),
          fetch(`${API}/content/about`).then(r => r.json()),
          fetch(`${API}/projects`).then(r => r.json()),
          fetch(`${API}/gallery`).then(r => r.json()),
          fetch(`${API}/content/resume`).then(r => r.json()),
          fetch(`${API}/content/wheel`).then(r => r.json()),
          fetch(`${API}/content/contact`).then(r => r.json()),
          fetch(`${API}/content/projects`).then(r => r.json()),
          fetch(`${API}/content/gallery`).then(r => r.json()),
          fetch(`${API}/content/feedback`).then(r => r.json()),
          fetch(`${API}/content/footer`).then(r => r.json()),
        ]);
        setHeroData(hero);
        setAboutData(about);
        setProjects(proj);
        setGallery(gal);
        setResumeData(resume);
        setWheelData(wheel);
        setContactData(contact);
        setProjectsContent(projContent);
        setGalleryContent(galContent);
        setFeedbackContent(fbContent);
        setFooterData(footer);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8]" data-testid="home-page">
      <Navbar />
      {heroData && <HeroSection data={heroData} />}
      {aboutData && <AboutSection data={aboutData} />}
      {projects.length > 0 && <ProjectsSection projects={projects} contentData={projectsContent} />}
      {gallery.length > 0 && <GallerySection items={gallery} contentData={galleryContent} />}
      {resumeData && <ResumeSection data={resumeData} aboutData={aboutData} />}
      {wheelData && <LuckyWheel data={wheelData} />}
      {contactData && <ContactSection data={contactData} />}
      <FeedbackSection contentData={feedbackContent} />
      <Footer contactData={contactData} footerData={footerData} />
    </div>
  );
}

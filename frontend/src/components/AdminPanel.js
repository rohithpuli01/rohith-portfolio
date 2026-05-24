import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOut, Save, Plus, Trash2, Upload, ArrowLeft,
  User, Briefcase, Image, FileText, Phone, Gift, Star, MessageSquare, Layout
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const tabs = [
  { id: "hero", label: "Hero", icon: User },
  { id: "about", label: "About", icon: Briefcase },
  { id: "projects", label: "Projects", icon: Image },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "resume", label: "Resume", icon: FileText },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "wheel", label: "Wheel", icon: Gift },
  { id: "feedback", label: "Reviews", icon: Star },
  { id: "footer", label: "Footer", icon: Layout },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [activeTab, setActiveTab] = useState("hero");
  const [data, setData] = useState({});
  const [projects, setProjects] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const checkAuth = useCallback(async () => {
    if (window.location.hash?.includes("session_id=")) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Not auth");
      setUser(await res.json());
    } catch { navigate("/"); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { if (!user) checkAuth(); }, [user, checkAuth]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const sections = ["hero", "about", "projects", "gallery", "resume", "contact", "wheel", "feedback", "footer"];
        const results = await Promise.all(sections.map(s => fetch(`${API}/content/${s}`, { credentials: "include" }).then(r => r.json())));
        const d = {};
        sections.forEach((s, i) => { d[s] = results[i]; });
        setData(d);
        const [proj, gal, fb] = await Promise.all([
          fetch(`${API}/projects`, { credentials: "include" }).then(r => r.json()),
          fetch(`${API}/gallery`, { credentials: "include" }).then(r => r.json()),
          fetch(`${API}/feedback`, { credentials: "include" }).then(r => r.json()),
        ]);
        setProjects(proj);
        setGallery(gal);
        setFeedbacks(fb);
      } catch (e) { console.error(e); }
    };
    fetchAll();
  }, [user]);

  const updateData = (section, field, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const saveContent = async (section) => {
    try {
      const res = await fetch(`${API}/content/${section}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(data[section]),
      });
      if (res.ok) toast.success(`${section} saved!`);
      else toast.error("Failed to save");
    } catch { toast.error("Failed to save"); }
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/");
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${API}/upload`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ file_data: reader.result, file_name: file.name, file_type: file.type.startsWith("video") ? "video" : "image" }),
        });
        const json = await res.json();
        callback(`${process.env.REACT_APP_BACKEND_URL}${json.url}`);
        toast.success("File uploaded!");
      } catch { toast.error("Upload failed"); }
    };
    reader.readAsDataURL(file);
  };

  const addProject = async () => {
    const newProj = { title: "New Project", description: "Project description", image: "https://images.unsplash.com/photo-1651611243377-2c15b94ad613", tags: ["Design"], link: "#", video_url: "" };
    try {
      const res = await fetch(`${API}/projects`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(newProj) });
      const json = await res.json();
      setProjects([...projects, { ...newProj, project_id: json.project_id }]);
      toast.success("Project added!");
    } catch { toast.error("Failed to add"); }
  };

  const deleteProject = async (id) => {
    await fetch(`${API}/projects/${id}`, { method: "DELETE", credentials: "include" });
    setProjects(projects.filter(p => p.project_id !== id));
    toast.success("Project deleted!");
  };

  const updateProject = async (id, projData) => {
    await fetch(`${API}/projects/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(projData) });
    toast.success("Project saved!");
  };

  const addGalleryItem = async () => {
    const newItem = { title: "New Item", type: "image", url: "https://images.unsplash.com/photo-1651611243377-2c15b94ad613", thumbnail: "" };
    try {
      const res = await fetch(`${API}/gallery`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(newItem) });
      const json = await res.json();
      setGallery([...gallery, { ...newItem, item_id: json.item_id }]);
      toast.success("Gallery item added!");
    } catch { toast.error("Failed to add"); }
  };

  const deleteGalleryItem = async (id) => {
    await fetch(`${API}/gallery/${id}`, { method: "DELETE", credentials: "include" });
    setGallery(gallery.filter(g => g.item_id !== id));
    toast.success("Item deleted!");
  };

  if (loading) return <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center"><div className="text-[#4A7A12] font-mono-label text-sm animate-pulse">LOADING...</div></div>;

  const inputCls = "w-full bg-[#F5F0E8] border border-[#D4CBB8] text-[#1A1A1A] px-3 py-2 text-sm focus:border-[#4A7A12] focus:outline-none";
  const labelCls = "font-mono-label text-[9px] text-[#6B7280] block mb-1";
  const btnCls = "bg-[#4A7A12] text-white font-mono-label text-[10px] px-4 py-2 hover:bg-[#3D6B0F] transition-colors flex items-center gap-2";
  const h = data.hero || {};
  const a = data.about || {};
  const pc = data.projects || {};
  const gc = data.gallery || {};
  const r = data.resume || {};
  const c = data.contact || {};
  const w = data.wheel || {};
  const fb = data.feedback || {};
  const ft = data.footer || {};

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1A1A]" data-testid="admin-panel">
      <div className="border-b border-[#D4CBB8] px-6 py-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-[#6B7280] hover:text-[#4A7A12]" data-testid="admin-back-btn"><ArrowLeft size={18} /></button>
          <span className="font-mono-label text-[10px] text-[#4A7A12]">ADMIN PANEL</span>
          {user && <span className="text-xs text-[#6B7280]">({user.email})</span>}
        </div>
        <button onClick={handleLogout} className="text-[#6B7280] hover:text-[#4A7A12] flex items-center gap-2 text-xs" data-testid="admin-logout-btn"><LogOut size={14} /> Logout</button>
      </div>

      <div className="flex">
        <div className="w-48 border-r border-[#D4CBB8] min-h-[calc(100vh-49px)] p-4 hidden md:block bg-white">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 mb-1 text-xs transition-colors ${activeTab === tab.id ? "bg-[#4A7A12]/10 text-[#4A7A12] border-l-2 border-[#4A7A12]" : "text-[#6B7280] hover:text-[#1A1A1A]"}`}
              data-testid={`admin-tab-${tab.id}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="md:hidden w-full border-b border-[#D4CBB8] overflow-x-auto flex bg-white">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs whitespace-nowrap ${activeTab === tab.id ? "text-[#4A7A12] border-b-2 border-[#4A7A12]" : "text-[#6B7280]"}`}>{tab.label}</button>
          ))}
        </div>

        <div className="flex-1 p-6 md:p-8 max-w-4xl">
          {/* HERO EDITOR */}
          {activeTab === "hero" && (
            <div className="space-y-4" data-testid="admin-hero-editor">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Unbounded' }}>Edit Hero Section</h3>
              <div><label className={labelCls}>NAME</label><input className={inputCls} value={h.name || ""} onChange={e => updateData("hero", "name", e.target.value)} data-testid="admin-hero-name" /></div>
              <div><label className={labelCls}>TITLE LABEL (above name)</label><input className={inputCls} value={h.title || ""} onChange={e => updateData("hero", "title", e.target.value)} data-testid="admin-hero-title" /></div>
              <div><label className={labelCls}>SUBTITLE</label><input className={inputCls} value={h.subtitle || ""} onChange={e => updateData("hero", "subtitle", e.target.value)} data-testid="admin-hero-subtitle" /></div>
              <div><label className={labelCls}>MARQUEE TEXT (scrolling background)</label><input className={inputCls} value={h.marquee_text || ""} onChange={e => updateData("hero", "marquee_text", e.target.value)} /></div>
              <div><label className={labelCls}>PRIMARY CTA BUTTON</label><input className={inputCls} value={h.cta_primary || ""} onChange={e => updateData("hero", "cta_primary", e.target.value)} /></div>
              <div><label className={labelCls}>SECONDARY CTA BUTTON</label><input className={inputCls} value={h.cta_secondary || ""} onChange={e => updateData("hero", "cta_secondary", e.target.value)} /></div>
              <div><label className={labelCls}>BADGE TEXT</label><input className={inputCls} value={h.badge_text || ""} onChange={e => updateData("hero", "badge_text", e.target.value)} /></div>
              <div>
                <label className={labelCls}>PROFILE IMAGE</label>
                <div className="flex gap-2">
                  <input className={inputCls} value={h.profile_image || ""} onChange={e => updateData("hero", "profile_image", e.target.value)} />
                  <label className={`${btnCls} cursor-pointer`}><Upload size={14} /> Upload<input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, url => updateData("hero", "profile_image", url))} /></label>
                </div>
                {h.profile_image && <img src={h.profile_image} alt="" className="w-24 h-24 object-cover mt-2 border border-[#D4CBB8]" />}
              </div>
              <button onClick={() => saveContent("hero")} className={btnCls} data-testid="admin-hero-save"><Save size={14} /> SAVE HERO</button>
            </div>
          )}

          {/* ABOUT EDITOR */}
          {activeTab === "about" && (
            <div className="space-y-4" data-testid="admin-about-editor">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Unbounded' }}>Edit About Section</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>HEADING</label><input className={inputCls} value={a.heading || ""} onChange={e => updateData("about", "heading", e.target.value)} /></div>
                <div><label className={labelCls}>HEADING ACCENT (colored)</label><input className={inputCls} value={a.heading_accent || ""} onChange={e => updateData("about", "heading_accent", e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>BIO</label><textarea className={`${inputCls} resize-none`} rows={4} value={a.bio || ""} onChange={e => updateData("about", "bio", e.target.value)} data-testid="admin-about-bio" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>YEARS OF EXPERIENCE</label><input className={inputCls} value={a.years_exp || ""} onChange={e => updateData("about", "years_exp", e.target.value)} /></div>
                <div><label className={labelCls}>PROJECTS COUNT</label><input className={inputCls} value={a.projects_count || ""} onChange={e => updateData("about", "projects_count", e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>TOOLS (comma separated)</label><input className={inputCls} value={(a.tools || []).join(", ")} onChange={e => updateData("about", "tools", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} data-testid="admin-about-tools" /></div>
              <div>
                <label className={labelCls}>SKILLS</label>
                {(a.skills || []).map((skill, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className={inputCls} placeholder="Skill" value={skill.name} onChange={e => { const u = [...a.skills]; u[i] = { ...u[i], name: e.target.value }; updateData("about", "skills", u); }} />
                    <input className={`${inputCls} w-20`} type="number" min="0" max="100" value={skill.level} onChange={e => { const u = [...a.skills]; u[i] = { ...u[i], level: parseInt(e.target.value) || 0 }; updateData("about", "skills", u); }} />
                    <button onClick={() => updateData("about", "skills", a.skills.filter((_, j) => j !== i))} className="text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={() => updateData("about", "skills", [...(a.skills || []), { name: "", level: 50 }])} className="text-[#4A7A12] text-xs flex items-center gap-1"><Plus size={12} /> Add Skill</button>
              </div>
              <div>
                <label className={labelCls}>EXPERIENCE</label>
                {(a.experience || []).map((exp, i) => (
                  <div key={i} className="bg-white border border-[#D4CBB8] p-4 mb-3 space-y-2">
                    <input className={inputCls} placeholder="Role" value={exp.role} onChange={e => { const u = [...a.experience]; u[i] = { ...u[i], role: e.target.value }; updateData("about", "experience", u); }} />
                    <input className={inputCls} placeholder="Company" value={exp.company} onChange={e => { const u = [...a.experience]; u[i] = { ...u[i], company: e.target.value }; updateData("about", "experience", u); }} />
                    <input className={inputCls} placeholder="Period" value={exp.period} onChange={e => { const u = [...a.experience]; u[i] = { ...u[i], period: e.target.value }; updateData("about", "experience", u); }} />
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Description" value={exp.description} onChange={e => { const u = [...a.experience]; u[i] = { ...u[i], description: e.target.value }; updateData("about", "experience", u); }} />
                    <button onClick={() => updateData("about", "experience", a.experience.filter((_, j) => j !== i))} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={12} /> Remove</button>
                  </div>
                ))}
                <button onClick={() => updateData("about", "experience", [...(a.experience || []), { role: "", company: "", period: "", description: "" }])} className="text-[#4A7A12] text-xs flex items-center gap-1"><Plus size={12} /> Add Experience</button>
              </div>
              <button onClick={() => saveContent("about")} className={btnCls} data-testid="admin-about-save"><Save size={14} /> SAVE ABOUT</button>
            </div>
          )}

          {/* PROJECTS EDITOR */}
          {activeTab === "projects" && (
            <div className="space-y-4" data-testid="admin-projects-editor">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Unbounded' }}>Edit Projects</h3>
              <div className="bg-white border border-[#D4CBB8] p-4 mb-4 space-y-3">
                <p className="font-mono-label text-[9px] text-[#6B7280]">SECTION HEADING & LABEL</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>HEADING</label><input className={inputCls} value={pc.heading || ""} onChange={e => updateData("projects", "heading", e.target.value)} /></div>
                  <div><label className={labelCls}>LABEL</label><input className={inputCls} value={pc.label || ""} onChange={e => updateData("projects", "label", e.target.value)} /></div>
                </div>
                <button onClick={() => saveContent("projects")} className="text-[#4A7A12] text-xs flex items-center gap-1"><Save size={12} /> Save Section Text</button>
              </div>
              <div className="flex justify-end"><button onClick={addProject} className={btnCls} data-testid="admin-add-project"><Plus size={14} /> ADD PROJECT</button></div>
              {projects.map((proj, i) => (
                <div key={proj.project_id || i} className="bg-white border border-[#D4CBB8] p-4 space-y-3">
                  <div className="flex justify-between"><span className="font-mono-label text-[9px] text-[#4A7A12]">PROJECT #{i + 1}</span><button onClick={() => deleteProject(proj.project_id)} className="text-red-500" data-testid={`admin-delete-project-${i}`}><Trash2 size={14} /></button></div>
                  <input className={inputCls} placeholder="Title" value={proj.title || ""} onChange={e => { const u = [...projects]; u[i] = { ...u[i], title: e.target.value }; setProjects(u); }} />
                  <input className={inputCls} placeholder="Description" value={proj.description || ""} onChange={e => { const u = [...projects]; u[i] = { ...u[i], description: e.target.value }; setProjects(u); }} />
                  <div className="flex gap-2">
                    <input className={inputCls} placeholder="Image URL" value={proj.image || ""} onChange={e => { const u = [...projects]; u[i] = { ...u[i], image: e.target.value }; setProjects(u); }} />
                    <label className={`${btnCls} cursor-pointer whitespace-nowrap`}><Upload size={14} /><input type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFileUpload(e, url => { const u = [...projects]; u[i] = { ...u[i], image: url }; setProjects(u); })} /></label>
                  </div>
                  <input className={inputCls} placeholder="Tags (comma separated)" value={(proj.tags || []).join(", ")} onChange={e => { const u = [...projects]; u[i] = { ...u[i], tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }; setProjects(u); }} />
                  <div>
                    <label className={labelCls}>DETAIL PAGE TEXT</label>
                    <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Detailed description shown on project page..." value={proj.detail_text || ""} onChange={e => { const u = [...projects]; u[i] = { ...u[i], detail_text: e.target.value }; setProjects(u); }} />
                  </div>
                  <div>
                    <label className={labelCls}>DETAIL PAGE IMAGES (one URL per line, or upload)</label>
                    <textarea className={`${inputCls} resize-none text-xs`} rows={3} placeholder="One image URL per line" value={(proj.detail_images || []).join("\n")} onChange={e => { const u = [...projects]; u[i] = { ...u[i], detail_images: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }; setProjects(u); }} />
                    <label className={`${btnCls} cursor-pointer mt-2 inline-flex`}><Upload size={12} /> Add Image<input type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFileUpload(e, url => { const u = [...projects]; u[i] = { ...u[i], detail_images: [...(u[i].detail_images || []), url] }; setProjects(u); })} /></label>
                  </div>
                  <div>
                    <label className={labelCls}>VIDEO URL (optional)</label>
                    <div className="flex gap-2">
                      <input className={inputCls} placeholder="Video URL" value={proj.video_url || ""} onChange={e => { const u = [...projects]; u[i] = { ...u[i], video_url: e.target.value }; setProjects(u); }} />
                      <label className={`${btnCls} cursor-pointer whitespace-nowrap`}><Upload size={14} /><input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, url => { const u = [...projects]; u[i] = { ...u[i], video_url: url }; setProjects(u); })} /></label>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>EXTERNAL LINK (optional)</label>
                    <input className={inputCls} placeholder="https://..." value={proj.link || ""} onChange={e => { const u = [...projects]; u[i] = { ...u[i], link: e.target.value }; setProjects(u); }} />
                  </div>
                  <button onClick={() => updateProject(proj.project_id, projects[i])} className="text-[#4A7A12] text-xs flex items-center gap-1"><Save size={12} /> Save Project</button>
                </div>
              ))}
            </div>
          )}

          {/* GALLERY EDITOR */}
          {activeTab === "gallery" && (
            <div className="space-y-4" data-testid="admin-gallery-editor">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Unbounded' }}>Edit Gallery</h3>
              <div className="bg-white border border-[#D4CBB8] p-4 mb-4 space-y-3">
                <p className="font-mono-label text-[9px] text-[#6B7280]">SECTION HEADING</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>HEADING</label><input className={inputCls} value={gc.heading || ""} onChange={e => updateData("gallery", "heading", e.target.value)} /></div>
                  <div><label className={labelCls}>ACCENT</label><input className={inputCls} value={gc.heading_accent || ""} onChange={e => updateData("gallery", "heading_accent", e.target.value)} /></div>
                  <div><label className={labelCls}>LABEL</label><input className={inputCls} value={gc.label || ""} onChange={e => updateData("gallery", "label", e.target.value)} /></div>
                </div>
                <button onClick={() => saveContent("gallery")} className="text-[#4A7A12] text-xs flex items-center gap-1"><Save size={12} /> Save Section Text</button>
              </div>
              <div className="flex justify-end"><button onClick={addGalleryItem} className={btnCls} data-testid="admin-add-gallery"><Plus size={14} /> ADD ITEM</button></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((item, i) => (
                  <div key={item.item_id || i} className="bg-white border border-[#D4CBB8] overflow-hidden">
                    <div className="aspect-square relative">
                      {item.type === "video" ? <video src={item.url} className="w-full h-full object-cover" muted /> : <img src={item.url} alt={item.title} className="w-full h-full object-cover" />}
                      <button onClick={() => deleteGalleryItem(item.item_id)} className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500" data-testid={`admin-delete-gallery-${i}`}><Trash2 size={14} /></button>
                    </div>
                    <div className="p-2 space-y-1">
                      <input className={`${inputCls} text-xs`} placeholder="Title" value={item.title || ""} onChange={e => { const u = [...gallery]; u[i] = { ...u[i], title: e.target.value }; setGallery(u); }} />
                      <select className={`${inputCls} text-xs`} value={item.type || "image"} onChange={e => { const u = [...gallery]; u[i] = { ...u[i], type: e.target.value }; setGallery(u); }}>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <div className="flex gap-1">
                        <input className={`${inputCls} text-xs`} placeholder="URL" value={item.url || ""} onChange={e => { const u = [...gallery]; u[i] = { ...u[i], url: e.target.value }; setGallery(u); }} />
                        <label className="bg-[#4A7A12] text-white px-2 py-1 text-xs cursor-pointer flex items-center"><Upload size={12} /><input type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFileUpload(e, url => { const u = [...gallery]; u[i] = { ...u[i], url }; setGallery(u); })} /></label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESUME EDITOR */}
          {activeTab === "resume" && (
            <div className="space-y-4" data-testid="admin-resume-editor">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Unbounded' }}>Edit Resume</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>HEADING</label><input className={inputCls} value={r.heading || ""} onChange={e => updateData("resume", "heading", e.target.value)} /></div>
                <div><label className={labelCls}>HEADING ACCENT</label><input className={inputCls} value={r.heading_accent || ""} onChange={e => updateData("resume", "heading_accent", e.target.value)} /></div>
              </div>
              <div>
                <label className={labelCls}>RESUME PDF</label>
                <div className="flex gap-2 items-center">
                  <input className={inputCls} value={r.resume_url || ""} readOnly placeholder="Upload PDF below" data-testid="admin-resume-url" />
                  <label className={`${btnCls} cursor-pointer whitespace-nowrap`}><Upload size={14} /> Upload PDF
                    <input type="file" accept=".pdf" className="hidden" onChange={async e => {
                      const file = e.target.files[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const res = await fetch(`${API}/resume/upload`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ file_data: reader.result, file_name: file.name }) });
                          const json = await res.json();
                          updateData("resume", "resume_url", `${process.env.REACT_APP_BACKEND_URL}${json.url}`);
                          toast.success("Resume uploaded!");
                        } catch { toast.error("Upload failed"); }
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
                {r.resume_url && <a href={r.resume_url} target="_blank" rel="noopener noreferrer" className="text-[#4A7A12] text-xs mt-2 inline-block hover:underline">View current resume</a>}
              </div>
              <div>
                <label className={labelCls}>EDUCATION</label>
                {(r.education || []).map((edu, i) => (
                  <div key={i} className="bg-white border border-[#D4CBB8] p-4 mb-3 space-y-2">
                    <input className={inputCls} placeholder="Degree" value={edu.degree} onChange={e => { const u = [...r.education]; u[i] = { ...u[i], degree: e.target.value }; updateData("resume", "education", u); }} />
                    <input className={inputCls} placeholder="School" value={edu.school} onChange={e => { const u = [...r.education]; u[i] = { ...u[i], school: e.target.value }; updateData("resume", "education", u); }} />
                    <input className={inputCls} placeholder="Year" value={edu.year} onChange={e => { const u = [...r.education]; u[i] = { ...u[i], year: e.target.value }; updateData("resume", "education", u); }} />
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Description" value={edu.description || ""} onChange={e => { const u = [...r.education]; u[i] = { ...u[i], description: e.target.value }; updateData("resume", "education", u); }} />
                    <button onClick={() => updateData("resume", "education", r.education.filter((_, j) => j !== i))} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={12} /> Remove</button>
                  </div>
                ))}
                <button onClick={() => updateData("resume", "education", [...(r.education || []), { degree: "", school: "", year: "", description: "" }])} className="text-[#4A7A12] text-xs flex items-center gap-1"><Plus size={12} /> Add Education</button>
              </div>
              <div><label className={labelCls}>CERTIFICATIONS (comma separated)</label><input className={inputCls} value={(r.certifications || []).join(", ")} onChange={e => updateData("resume", "certifications", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} data-testid="admin-resume-certs" /></div>
              <button onClick={() => saveContent("resume")} className={btnCls} data-testid="admin-resume-save"><Save size={14} /> SAVE RESUME</button>
            </div>
          )}

          {/* CONTACT EDITOR */}
          {activeTab === "contact" && (
            <div className="space-y-4" data-testid="admin-contact-editor">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Unbounded' }}>Edit Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>HEADING</label><input className={inputCls} value={c.heading || ""} onChange={e => updateData("contact", "heading", e.target.value)} /></div>
                <div><label className={labelCls}>HEADING ACCENT</label><input className={inputCls} value={c.heading_accent || ""} onChange={e => updateData("contact", "heading_accent", e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>SUBTITLE</label><textarea className={`${inputCls} resize-none`} rows={2} value={c.subtitle || ""} onChange={e => updateData("contact", "subtitle", e.target.value)} /></div>
              <div><label className={labelCls}>EMAIL</label><input className={inputCls} value={c.email || ""} onChange={e => updateData("contact", "email", e.target.value)} data-testid="admin-contact-email" /></div>
              <div><label className={labelCls}>PHONE</label><input className={inputCls} value={c.phone || ""} onChange={e => updateData("contact", "phone", e.target.value)} data-testid="admin-contact-phone" /></div>
              <div><label className={labelCls}>LOCATION</label><input className={inputCls} value={c.location || ""} onChange={e => updateData("contact", "location", e.target.value)} data-testid="admin-contact-location" /></div>
              <div>
                <label className={labelCls}>SOCIAL LINKS</label>
                {Object.entries(c.socials || {}).map(([key, val]) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <span className="font-mono-label text-[9px] text-[#6B7280] w-20 flex items-center">{key.toUpperCase()}</span>
                    <input className={inputCls} value={val} onChange={e => updateData("contact", "socials", { ...c.socials, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <button onClick={() => saveContent("contact")} className={btnCls} data-testid="admin-contact-save"><Save size={14} /> SAVE CONTACT</button>
            </div>
          )}

          {/* WHEEL EDITOR */}
          {activeTab === "wheel" && (
            <div className="space-y-4" data-testid="admin-wheel-editor">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Unbounded' }}>Edit Lucky Wheel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>HEADING</label><input className={inputCls} value={w.heading || ""} onChange={e => updateData("wheel", "heading", e.target.value)} /></div>
                <div><label className={labelCls}>HEADING ACCENT</label><input className={inputCls} value={w.heading_accent || ""} onChange={e => updateData("wheel", "heading_accent", e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>SUBTITLE</label><textarea className={`${inputCls} resize-none`} rows={2} value={w.subtitle || ""} onChange={e => updateData("wheel", "subtitle", e.target.value)} /></div>
              <div>
                <label className={labelCls}>SEGMENTS</label>
                {(w.segments || []).map((seg, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <input className={inputCls} placeholder="Label" value={seg.label} onChange={e => { const u = [...w.segments]; u[i] = { ...u[i], label: e.target.value }; updateData("wheel", "segments", u); }} />
                    <input className={`${inputCls} w-24`} type="color" value={seg.color} onChange={e => { const u = [...w.segments]; u[i] = { ...u[i], color: e.target.value }; updateData("wheel", "segments", u); }} />
                    <button onClick={() => updateData("wheel", "segments", w.segments.filter((_, j) => j !== i))} className="text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={() => updateData("wheel", "segments", [...(w.segments || []), { label: "NEW", color: "#4A7A12" }])} className="text-[#4A7A12] text-xs flex items-center gap-1"><Plus size={12} /> Add Segment</button>
              </div>
              <button onClick={() => saveContent("wheel")} className={btnCls} data-testid="admin-wheel-save"><Save size={14} /> SAVE WHEEL</button>
            </div>
          )}

          {/* FEEDBACK MANAGEMENT */}
          {activeTab === "feedback" && (
            <div className="space-y-4" data-testid="admin-feedback-editor">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Unbounded' }}>Manage Reviews</h3>
              <div className="bg-white border border-[#D4CBB8] p-4 mb-4 space-y-3">
                <p className="font-mono-label text-[9px] text-[#6B7280]">SECTION HEADING</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>HEADING</label><input className={inputCls} value={fb.heading || ""} onChange={e => updateData("feedback", "heading", e.target.value)} /></div>
                  <div><label className={labelCls}>ACCENT</label><input className={inputCls} value={fb.heading_accent || ""} onChange={e => updateData("feedback", "heading_accent", e.target.value)} /></div>
                  <div><label className={labelCls}>CTA TEXT</label><input className={inputCls} value={fb.cta_text || ""} onChange={e => updateData("feedback", "cta_text", e.target.value)} /></div>
                </div>
                <button onClick={() => saveContent("feedback")} className="text-[#4A7A12] text-xs flex items-center gap-1"><Save size={12} /> Save Section Text</button>
              </div>
              <p className="text-xs text-[#6B7280]">{feedbacks.length} reviews total</p>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#D4CBB8] bg-white/50"><MessageSquare size={32} className="text-[#D4CBB8] mx-auto mb-3" /><p className="text-sm text-[#6B7280]">No reviews yet</p></div>
              ) : (
                feedbacks.map((fbItem, i) => (
                  <div key={fbItem.feedback_id || i} className="bg-white border border-[#D4CBB8] p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold">{fbItem.name}</span>{fbItem.company && <span className="text-xs text-[#6B7280]">- {fbItem.company}</span>}</div>
                      <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => (<Star key={s} size={12} className={s <= fbItem.rating ? "text-[#4A7A12] fill-[#4A7A12]" : "text-[#D4CBB8]"} />))}</div>
                      <p className="text-xs text-[#6B7280]">"{fbItem.comment}"</p>
                    </div>
                    <button onClick={async () => { await fetch(`${API}/feedback/${fbItem.feedback_id}`, { method: "DELETE", credentials: "include" }); setFeedbacks(feedbacks.filter(f => f.feedback_id !== fbItem.feedback_id)); toast.success("Deleted"); }}
                      className="text-red-500 flex-shrink-0" data-testid={`admin-delete-feedback-${i}`}><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FOOTER EDITOR */}
          {activeTab === "footer" && (
            <div className="space-y-4" data-testid="admin-footer-editor">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Unbounded' }}>Edit Footer</h3>
              <div><label className={labelCls}>TAGLINE</label><input className={inputCls} value={ft.tagline || ""} onChange={e => updateData("footer", "tagline", e.target.value)} /></div>
              <div><label className={labelCls}>COPYRIGHT TEXT</label><input className={inputCls} value={ft.copyright || ""} onChange={e => updateData("footer", "copyright", e.target.value)} /></div>
              <button onClick={() => saveContent("footer")} className={btnCls} data-testid="admin-footer-save"><Save size={14} /> SAVE FOOTER</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

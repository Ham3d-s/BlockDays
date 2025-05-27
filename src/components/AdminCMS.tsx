import React, { useState, useEffect } from 'react';
import { fetchContent, updateContentFile } from '../utils/api';
// @ts-ignore
import JSZip from 'jszip';
import { Info, User, HelpCircle, LogOut, Home, Image as ImageIcon, Calendar, BarChart2, Star, Video, Settings, LayoutHeader, LayoutDashboard, LayoutPanelBottom, MessageSquare } from 'lucide-react';
import { showToast } from '../utils/helpers';

const CONTENT_SECTIONS = [
  { key: 'global-settings', label: 'Global Settings' },
  { key: 'header-config', label: 'Header Configuration' },
  { key: 'hero-config', label: 'Hero Section' },
  { key: 'footer-config', label: 'Footer Configuration' },
  { key: 'contact-form-config', label: 'Contact Form Config' },
  { key: 'faq', label: 'FAQ' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'past-events', label: 'Past Events' },
  { key: 'sponsors', label: 'Sponsors' },
  { key: 'stats', label: 'Stats' },
  { key: 'upcoming-event', label: 'Upcoming Event' },
];

const ADMIN_PASSWORD_KEY = 'blockdays_admin_password';

// The admin password is now read from an environment variable:
// import.meta.env.VITE_ADMIN_PASSWORD
// Refer to ADMIN_AUTH_SETUP.md for setup instructions.

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  active?: boolean;
  tags?: string[];
}

interface GlobalSettingsType {
  siteName: string;
  siteLogoUrl: string;
  contactEmail: string;
}

function GlobalSettingsEditor({ imported }: { imported: GlobalSettingsType | null}) {
  const [settings, setSettings] = useState<GlobalSettingsType>(imported || { siteName: '', siteLogoUrl: '', contactEmail: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [error, setError] = useState(''); // For fetch errors
  const [emailError, setEmailError] = useState('');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (imported) {
      setSettings(imported);
      setIsLoading(false);
      return;
    }
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchContent<GlobalSettingsType>('global.json');
        setSettings(data);
      } catch (err) {
        setError('خطا در بارگذاری تنظیمات عمومی. از مقادیر پیش‌فرض استفاده می‌شود.');
        // Use default if fetch fails
        setSettings({ siteName: 'BlockDays Default', siteLogoUrl: '/images/logo-default.png', contactEmail: 'contact@example.com' });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [imported]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    if (name === 'contactEmail') {
      validateEmail(value);
    }
    // If user types into siteLogoUrl, clear any selected file
    if (name === 'siteLogoUrl') {
      setSelectedLogoFile(null);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogoFile(file);
      // Optionally, update the text input to reflect a pending upload or clear it
      setSettings(prev => ({ ...prev, siteLogoUrl: `/images/uploads/${file.name}` })); // Placeholder path
    }
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('');
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('فرمت ایمیل نامعتبر است.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSaveToServer = async () => {
    if (!validateEmail(settings.contactEmail)) {
      showToast('لطفاً خطای ایمیل را برطرف کنید.', 'error');
      return;
    }
    if (!settings.siteName.trim()) {
      showToast('نام سایت نمی‌تواند خالی باشد.', 'error');
      return;
    }

    setIsSavingToServer(true);
    
    // Placeholder for file upload logic
    if (selectedLogoFile) {
      console.log(`Site logo "${selectedLogoFile.name}" would be uploaded here. For now, using placeholder URL in JSON.`);
      // In a real scenario:
      // 1. Upload selectedLogoFile to server, get its new URL.
      // 2. const newLogoUrl = await uploadFileApi(selectedLogoFile);
      // 3. setSettings(prev => ({...prev, siteLogoUrl: newLogoUrl})); // Update settings with the actual URL
      // 4. Then proceed to save the JSON with this new URL.
      // For this task, we'll just log and use the (potentially placeholder) siteLogoUrl already in settings.
    }

    try {
      // Create a settings object to save, excluding the file object itself
      const settingsToSave = { ...settings };
      await updateContentFile('global', settingsToSave);
      showToast('تنظیمات عمومی با موفقیت در سرور ذخیره شد.', 'success');
      if (selectedLogoFile) {
          // Clear the file input after successful save to prevent re-uploading if not intended
          // This depends on how you want the UX to be.
          // setSelectedLogoFile(null); 
          // const fileInput = document.getElementById('siteLogoFile') as HTMLInputElement;
          // if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره تنظیمات عمومی: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره تنظیمات عمومی: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };
  
  if (isLoading) return <div>در حال بارگذاری تنظیمات عمومی...</div>;
  // Do not show fetch error if we are using default values after a failed fetch.
  // if (error && !settings.siteName) return <div className="text-error">{error}</div>;


  return (
    <div className="space-y-4">
      {error && <div className="alert alert-warning text-sm p-2 mb-4">{error}</div>}
      <div>
        <label htmlFor="siteName" className="label">نام سایت:</label>
        <input
          id="siteName"
          name="siteName"
          type="text"
          className="input input-bordered w-full"
          value={settings.siteName}
          onChange={handleChange}
          disabled={isSavingToServer}
        />
      </div>
      <div>
        <label htmlFor="siteLogoUrl" className="label">آدرس لوگوی سایت:</label>
        <input
          id="siteLogoUrl"
          name="siteLogoUrl"
          type="text"
          className="input input-bordered w-full"
          value={settings.siteLogoUrl}
          onChange={handleChange}
          disabled={isSavingToServer || !!selectedLogoFile} // Disable if a file is selected
        />
        <label htmlFor="siteLogoFile" className="label text-xs">یا آپلود لوگوی جدید:</label>
        <input
          id="siteLogoFile"
          name="siteLogoFile"
          type="file"
          accept="image/*"
          className="file-input file-input-bordered file-input-sm w-full"
          onChange={handleFileChange}
          disabled={isSavingToServer}
        />
        {selectedLogoFile && <p className="text-xs text-info mt-1">فایل انتخاب شده: {selectedLogoFile.name} (پس از ذخیره، URL به‌روز خواهد شد)</p>}
      </div>
      <div>
        <label htmlFor="contactEmail" className="label">ایمیل تماس پیش‌فرض:</label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          className={`input input-bordered w-full ${emailError ? 'input-error' : ''}`}
          value={settings.contactEmail}
          onChange={handleChange}
          onBlur={(e) => validateEmail(e.target.value)}
          disabled={isSavingToServer}
        />
        {emailError && <p className="text-error text-xs mt-1">{emailError}</p>}
      </div>
      <button
        className="btn btn-primary btn-sm"
        onClick={handleSaveToServer}
        disabled={isSavingToServer || isLoading || !!emailError || !settings.siteName.trim()}
      >
        {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
        ذخیره تنظیمات عمومی
      </button>
    </div>
  );
}

interface AltContactLink {
  id: string;
  text: string;
  url: string;
  icon?: string;
}

interface ContactFormConfigType {
  sectionTitle: string;
  sectionSubtitle: string;
  labels: { name: string; email: string; message: string };
  placeholders: { name: string; email: string; message: string };
  buttonText: string;
  buttonTextSubmitting: string;
  successMessage: string;
  errorMessage: string;
  alternativeContactTitle: string;
  alternativeContactLinks: AltContactLink[];
}

function ContactFormConfigEditor({ imported }: { imported: ContactFormConfigType | null }) {
  const defaultConfig: ContactFormConfigType = {
    sectionTitle: '',
    sectionSubtitle: '',
    labels: { name: '', email: '', message: '' },
    placeholders: { name: '', email: '', message: '' },
    buttonText: '',
    buttonTextSubmitting: '',
    successMessage: '',
    errorMessage: '',
    alternativeContactTitle: '',
    alternativeContactLinks: [],
  };

  const [config, setConfig] = useState<ContactFormConfigType>(imported || defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [error, setError] = useState('');

  const [editingAltLink, setEditingAltLink] = useState<AltContactLink | null>(null);
  const [newAltLink, setNewAltLink] = useState<Omit<AltContactLink, 'id'>>({ text: '', url: '', icon: '' });
  
  useEffect(() => {
    if (imported) {
      setConfig(prev => ({ ...defaultConfig, ...imported, labels: {...defaultConfig.labels, ...imported.labels}, placeholders: {...defaultConfig.placeholders, ...imported.placeholders}, alternativeContactLinks: imported.alternativeContactLinks || [] }));
      setIsLoading(false);
      return;
    }
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchContent<ContactFormConfigType>('contact-form.json');
        setConfig(prev => ({ ...defaultConfig, ...data, labels: {...defaultConfig.labels, ...data.labels}, placeholders: {...defaultConfig.placeholders, ...data.placeholders}, alternativeContactLinks: data.alternativeContactLinks || [] }));
      } catch (err) {
        setError('خطا در بارگذاری تنظیمات فرم تماس. از مقادیر پیش‌فرض استفاده می‌شود.');
        setConfig(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [imported]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('labels.')) {
      const field = name.split('.')[1] as keyof ContactFormConfigType['labels'];
      setConfig(prev => ({ ...prev, labels: { ...prev.labels, [field]: value } }));
    } else if (name.startsWith('placeholders.')) {
      const field = name.split('.')[1] as keyof ContactFormConfigType['placeholders'];
      setConfig(prev => ({ ...prev, placeholders: { ...prev.placeholders, [field]: value } }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAltLinkChange = (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const { name, value } = e.target;
     if (id && editingAltLink && editingAltLink.id === id) {
      setEditingAltLink(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewAltLink(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleEditAltLink = (link: AltContactLink) => {
    setEditingAltLink({...link});
  };

  const handleSaveAltLinkEdit = () => {
    if (!editingAltLink || !editingAltLink.text.trim() || !editingAltLink.url.trim()) {
      showToast("متن و URL برای لینک جایگزین الزامی است.", 'error');
      return;
    }
    setConfig(prev => ({
      ...prev,
      alternativeContactLinks: prev.alternativeContactLinks.map(al => al.id === editingAltLink.id ? editingAltLink : al)
    }));
    setEditingAltLink(null);
  };
  
  const handleCancelAltLinkEdit = () => {
    setEditingAltLink(null);
  };

  const handleAddAltLink = () => {
    if (!newAltLink.text.trim() || !newAltLink.url.trim()) {
      showToast("متن و URL برای لینک جدید جایگزین الزامی است.", 'error');
      return;
    }
    setConfig(prev => ({
      ...prev,
      alternativeContactLinks: [...prev.alternativeContactLinks, { ...newAltLink, id: Date.now().toString() }]
    }));
    setNewAltLink({ text: '', url: '', icon: '' });
  };

  const handleDeleteAltLink = (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این لینک جایگزین را حذف کنید؟')) {
      setConfig(prev => ({
        ...prev,
        alternativeContactLinks: prev.alternativeContactLinks.filter(al => al.id !== id)
      }));
    }
  };

  const validateFormConfig = (): boolean => {
    // Basic validation: check if required top-level fields are filled
    if (!config.sectionTitle.trim() || !config.buttonText.trim() || !config.successMessage.trim() || !config.errorMessage.trim()) return false;
    // Check labels
    if (Object.values(config.labels).some(label => !label.trim())) return false;
    // Check placeholders (optional, but if one is there, maybe all should be?) - for now, let's not enforce this strictly.
    // Check alternative links: if a link exists, text and url must be filled
    if (config.alternativeContactLinks.some(link => !link.text.trim() || !link.url.trim())) return false;
    return true;
  };
  const hasValidationError = !validateFormConfig();

  const handleSaveToServer = async () => {
     if (hasValidationError) {
        showToast('لطفاً تمام فیلدهای الزامی (عنوان بخش، متون دکمه‌ها، پیام‌ها و برچسب‌ها) را پر کنید. همچنین لینک‌های جایگزین باید متن و URL داشته باشند.', 'error', 4000);
        return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('contact-form', config);
      showToast('تنظیمات فرم تماس با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره تنظیمات فرم تماس: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره تنظیمات فرم تماس: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading) return <div>در حال بارگذاری تنظیمات فرم تماس...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="alert alert-warning text-sm p-2 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="sectionTitle" className="label">عنوان بخش (الزامی):</label><input id="sectionTitle" name="sectionTitle" type="text" className="input input-bordered w-full" value={config.sectionTitle} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="sectionSubtitle" className="label">زیرعنوان بخش:</label><input id="sectionSubtitle" name="sectionSubtitle" type="text" className="input input-bordered w-full" value={config.sectionSubtitle} onChange={handleChange} disabled={isSavingToServer} /></div>
      </div>

      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold text-lg">برچسب‌های فرم (الزامی):</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label htmlFor="labels.name" className="label text-xs">برچسب نام:</label><input id="labels.name" name="labels.name" type="text" className="input input-bordered input-sm w-full" value={config.labels.name} onChange={handleChange} disabled={isSavingToServer} /></div>
          <div><label htmlFor="labels.email" className="label text-xs">برچسب ایمیل:</label><input id="labels.email" name="labels.email" type="text" className="input input-bordered input-sm w-full" value={config.labels.email} onChange={handleChange} disabled={isSavingToServer} /></div>
          <div><label htmlFor="labels.message" className="label text-xs">برچسب پیام:</label><input id="labels.message" name="labels.message" type="text" className="input input-bordered input-sm w-full" value={config.labels.message} onChange={handleChange} disabled={isSavingToServer} /></div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold text-lg">متن‌های پیش‌فرض فرم:</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label htmlFor="placeholders.name" className="label text-xs">پیش‌فرض نام:</label><input id="placeholders.name" name="placeholders.name" type="text" className="input input-bordered input-sm w-full" value={config.placeholders.name} onChange={handleChange} disabled={isSavingToServer} /></div>
          <div><label htmlFor="placeholders.email" className="label text-xs">پیش‌فرض ایمیل:</label><input id="placeholders.email" name="placeholders.email" type="text" className="input input-bordered input-sm w-full" value={config.placeholders.email} onChange={handleChange} disabled={isSavingToServer} /></div>
          <div><label htmlFor="placeholders.message" className="label text-xs">پیش‌فرض پیام:</label><input id="placeholders.message" name="placeholders.message" type="text" className="input input-bordered input-sm w-full" value={config.placeholders.message} onChange={handleChange} disabled={isSavingToServer} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="buttonText" className="label">متن دکمه ارسال (الزامی):</label><input id="buttonText" name="buttonText" type="text" className="input input-bordered w-full" value={config.buttonText} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="buttonTextSubmitting" className="label">متن دکمه هنگام ارسال:</label><input id="buttonTextSubmitting" name="buttonTextSubmitting" type="text" className="input input-bordered w-full" value={config.buttonTextSubmitting} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="successMessage" className="label">پیام موفقیت (الزامی):</label><input id="successMessage" name="successMessage" type="text" className="input input-bordered w-full" value={config.successMessage} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="errorMessage" className="label">پیام خطا (الزامی):</label><input id="errorMessage" name="errorMessage" type="text" className="input input-bordered w-full" value={config.errorMessage} onChange={handleChange} disabled={isSavingToServer} /></div>
      </div>
      
      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold text-lg">بخش تماس جایگزین:</h3>
        <div><label htmlFor="alternativeContactTitle" className="label">عنوان بخش تماس جایگزین:</label><input id="alternativeContactTitle" name="alternativeContactTitle" type="text" className="input input-bordered w-full" value={config.alternativeContactTitle} onChange={handleChange} disabled={isSavingToServer} /></div>
        
        <h4 className="font-medium text-sm pt-2">لینک‌های تماس جایگزین:</h4>
        {config.alternativeContactLinks.map(link => (
          <div key={link.id} className="p-3 border rounded-md bg-base-100">
            {editingAltLink && editingAltLink.id === link.id ? (
              <div className="space-y-2">
                <input type="text" name="text" value={editingAltLink.text} onChange={(e) => handleAltLinkChange(e, link.id)} className="input input-bordered input-xs w-full" placeholder="متن لینک" />
                <input type="text" name="url" value={editingAltLink.url} onChange={(e) => handleAltLinkChange(e, link.id)} className="input input-bordered input-xs w-full" placeholder="آدرس URL" />
                <input type="text" name="icon" value={editingAltLink.icon || ''} onChange={(e) => handleAltLinkChange(e, link.id)} className="input input-bordered input-xs w-full" placeholder="آیکون (اختیاری)" />
                <div className="flex gap-2"><button onClick={handleSaveAltLinkEdit} className="btn btn-success btn-xs" disabled={isSavingToServer}>ذخیره</button><button onClick={handleCancelAltLinkEdit} className="btn btn-ghost btn-xs" disabled={isSavingToServer}>انصراف</button></div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div><span className="font-medium">{link.text}</span> <a href={link.url} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs">({link.url})</a> {link.icon && <span className="text-xs text-gray-400">[{link.icon}]</span>}</div>
                <div className="flex gap-2"><button onClick={() => handleEditAltLink(link)} className="btn btn-outline btn-xs" disabled={isSavingToServer}>ویرایش</button><button onClick={() => handleDeleteAltLink(link.id)} className="btn btn-error btn-xs" disabled={isSavingToServer}>حذف</button></div>
              </div>
            )}
          </div>
        ))}
        <div className="pt-2">
          <h5 className="font-medium text-xs mb-1">افزودن لینک جدید جایگزین:</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" name="text" placeholder="متن لینک" className="input input-bordered input-sm" value={newAltLink.text} onChange={handleAltLinkChange} />
            <input type="text" name="url" placeholder="آدرس URL" className="input input-bordered input-sm" value={newAltLink.url} onChange={handleAltLinkChange} />
            <input type="text" name="icon" placeholder="آیکون (اختیاری)" className="input input-bordered input-sm" value={newAltLink.icon} onChange={handleAltLinkChange} />
          </div>
          <button onClick={handleAddAltLink} className="btn btn-secondary btn-xs mt-2" disabled={isSavingToServer}>افزودن لینک جایگزین</button>
        </div>
      </div>

      <button className="btn btn-primary btn-sm" onClick={handleSaveToServer} disabled={isSavingToServer || isLoading || hasValidationError}>
        {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
        ذخیره تنظیمات فرم تماس
      </button>
    </div>
  );
}

interface SocialMediaLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface FooterConfigType {
  brandName: string;
  description: string;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    privacyNote: string;
  };
  copyrightText: string;
  socialMediaLinks: SocialMediaLink[];
}

function FooterConfigEditor({ imported }: { imported: FooterConfigType | null }) {
  const defaultConfig: FooterConfigType = {
    brandName: '',
    description: '',
    newsletter: { title: '', description: '', placeholder: '', buttonText: '', privacyNote: '' },
    copyrightText: '© {year} Your Company. All rights reserved.',
    socialMediaLinks: [],
  };
  const [config, setConfig] = useState<FooterConfigType>(imported || defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [error, setError] = useState('');

  const [editingSocialLink, setEditingSocialLink] = useState<SocialMediaLink | null>(null);
  const [newSocialLink, setNewSocialLink] = useState<Omit<SocialMediaLink, 'id'>>({ name: '', url: '', icon: '' });

  useEffect(() => {
    if (imported) {
      setConfig(prev => ({ ...defaultConfig, ...imported, newsletter: {...defaultConfig.newsletter, ...imported.newsletter}, socialMediaLinks: imported.socialMediaLinks || [] }));
      setIsLoading(false);
      return;
    }
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchContent<FooterConfigType>('footer.json');
        setConfig(prev => ({ ...defaultConfig, ...data, newsletter: {...defaultConfig.newsletter, ...data.newsletter}, socialMediaLinks: data.socialMediaLinks || [] }));
      } catch (err) {
        setError('خطا در بارگذاری تنظیمات فوتر. از مقادیر پیش‌فرض استفاده می‌شود.');
        setConfig(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [imported]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('newsletter.')) {
      const field = name.split('.')[1] as keyof FooterConfigType['newsletter'];
      setConfig(prev => ({ ...prev, newsletter: { ...prev.newsletter, [field]: value } }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const { name, value } = e.target;
     if (id && editingSocialLink && editingSocialLink.id === id) { // Editing existing social link
      setEditingSocialLink(prev => prev ? { ...prev, [name]: value } : null);
    } else { // Adding new social link
      setNewSocialLink(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleEditSocialLink = (link: SocialMediaLink) => {
    setEditingSocialLink({...link});
  };

  const handleSaveSocialLinkEdit = () => {
    if (!editingSocialLink || !editingSocialLink.name.trim() || !editingSocialLink.url.trim()) {
      showToast("نام و URL برای لینک شبکه اجتماعی الزامی است.", 'error');
      return;
    }
    setConfig(prev => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.map(sl => sl.id === editingSocialLink.id ? editingSocialLink : sl)
    }));
    setEditingSocialLink(null);
  };
  
  const handleCancelSocialLinkEdit = () => {
    setEditingSocialLink(null);
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink.name.trim() || !newSocialLink.url.trim()) {
      showToast("نام و URL برای لینک جدید شبکه اجتماعی الزامی است.", 'error');
      return;
    }
    setConfig(prev => ({
      ...prev,
      socialMediaLinks: [...prev.socialMediaLinks, { ...newSocialLink, id: Date.now().toString() }]
    }));
    setNewSocialLink({ name: '', url: '', icon: '' });
  };

  const handleDeleteSocialLink = (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این لینک شبکه اجتماعی را حذف کنید؟')) {
      setConfig(prev => ({
        ...prev,
        socialMediaLinks: prev.socialMediaLinks.filter(sl => sl.id !== id)
      }));
    }
  };

  const validateConfig = (): boolean => {
    if (!config.brandName.trim() || !config.copyrightText.trim()) return false;
    if (config.socialMediaLinks.some(sl => !sl.name.trim() || !sl.url.trim())) return false;
    // Basic newsletter validation (if any field is filled, others should be too, or all empty)
    const nl = config.newsletter;
    const nlFields = [nl.title, nl.description, nl.placeholder, nl.buttonText, nl.privacyNote];
    const filledNlFields = nlFields.filter(f => f.trim() !== '').length;
    if (filledNlFields > 0 && filledNlFields < nlFields.length) return false; // Incomplete newsletter section
    return true;
  };
  const hasValidationError = !validateConfig();

  const handleSaveToServer = async () => {
    if (hasValidationError) {
        showToast('لطفاً تمام فیلدهای الزامی را پر کنید و مطمئن شوید اطلاعات خبرنامه و لینک‌های شبکه‌های اجتماعی کامل هستند.', 'error', 4000);
        return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('footer', config);
      showToast('تنظیمات فوتر با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره تنظیمات فوتر: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره تنظیمات فوتر: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading) return <div>در حال بارگذاری تنظیمات فوتر...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="alert alert-warning text-sm p-2 mb-4">{error}</div>}

      <div><label htmlFor="brandName" className="label">نام برند (الزامی):</label><input id="brandName" name="brandName" type="text" className="input input-bordered w-full" value={config.brandName} onChange={handleChange} disabled={isSavingToServer} /></div>
      <div><label htmlFor="description" className="label">توضیحات فوتر:</label><textarea id="description" name="description" className="textarea textarea-bordered w-full" value={config.description} onChange={handleChange} disabled={isSavingToServer} /></div>
      
      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold text-lg">بخش خبرنامه (اختیاری):</h3>
        <p className="text-xs text-base-content/70">اگر نمی‌خواهید بخش خبرنامه نمایش داده شود، تمام فیلدهای آن را خالی بگذارید.</p>
        <div><label htmlFor="newsletter.title" className="label">عنوان خبرنامه:</label><input id="newsletter.title" name="newsletter.title" type="text" className="input input-bordered input-sm w-full" value={config.newsletter.title} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="newsletter.description" className="label">توضیحات خبرنامه:</label><input id="newsletter.description" name="newsletter.description" type="text" className="input input-bordered input-sm w-full" value={config.newsletter.description} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="newsletter.placeholder" className="label">متن پیش‌فرض ورودی ایمیل:</label><input id="newsletter.placeholder" name="newsletter.placeholder" type="text" className="input input-bordered input-sm w-full" value={config.newsletter.placeholder} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="newsletter.buttonText" className="label">متن دکمه خبرنامه:</label><input id="newsletter.buttonText" name="newsletter.buttonText" type="text" className="input input-bordered input-sm w-full" value={config.newsletter.buttonText} onChange={handleChange} disabled={isSavingToServer} /></div>
        <div><label htmlFor="newsletter.privacyNote" className="label">یادداشت حریم خصوصی خبرنامه:</label><input id="newsletter.privacyNote" name="newsletter.privacyNote" type="text" className="input input-bordered input-sm w-full" value={config.newsletter.privacyNote} onChange={handleChange} disabled={isSavingToServer} /></div>
      </div>

      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold text-lg mb-2">لینک‌های شبکه‌های اجتماعی:</h3>
        {config.socialMediaLinks.map(link => (
          <div key={link.id} className="p-3 border rounded-md bg-base-100">
            {editingSocialLink && editingSocialLink.id === link.id ? (
              <div className="space-y-2">
                <input type="text" name="name" value={editingSocialLink.name} onChange={(e) => handleSocialLinkChange(e, link.id)} className="input input-bordered input-xs w-full" placeholder="نام (مثلا Twitter)" />
                <input type="text" name="url" value={editingSocialLink.url} onChange={(e) => handleSocialLinkChange(e, link.id)} className="input input-bordered input-xs w-full" placeholder="آدرس URL" />
                <input type="text" name="icon" value={editingSocialLink.icon || ''} onChange={(e) => handleSocialLinkChange(e, link.id)} className="input input-bordered input-xs w-full" placeholder="آیکون (اختیاری - از Lucide)" />
                <div className="flex gap-2"><button onClick={handleSaveSocialLinkEdit} className="btn btn-success btn-xs" disabled={isSavingToServer}>ذخیره</button><button onClick={handleCancelSocialLinkEdit} className="btn btn-ghost btn-xs" disabled={isSavingToServer}>انصراف</button></div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div><span className="font-medium">{link.name}</span> <a href={link.url} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs">({link.url})</a> {link.icon && <span className="text-xs text-gray-400">[{link.icon}]</span>}</div>
                <div className="flex gap-2"><button onClick={() => handleEditSocialLink(link)} className="btn btn-outline btn-xs" disabled={isSavingToServer}>ویرایش</button><button onClick={() => handleDeleteSocialLink(link.id)} className="btn btn-error btn-xs" disabled={isSavingToServer}>حذف</button></div>
              </div>
            )}
          </div>
        ))}
        <div className="pt-2">
          <h4 className="font-medium text-sm mb-1">افزودن لینک جدید شبکه اجتماعی:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" name="name" placeholder="نام (مثلا Twitter)" className="input input-bordered input-sm" value={newSocialLink.name} onChange={handleSocialLinkChange} />
            <input type="text" name="url" placeholder="آدرس URL" className="input input-bordered input-sm" value={newSocialLink.url} onChange={handleSocialLinkChange} />
            <input type="text" name="icon" placeholder="آیکون (اختیاری)" className="input input-bordered input-sm" value={newSocialLink.icon} onChange={handleSocialLinkChange} />
          </div>
          <button onClick={handleAddSocialLink} className="btn btn-secondary btn-xs mt-2" disabled={isSavingToServer}>افزودن لینک شبکه اجتماعی</button>
        </div>
      </div>
      
      <div><label htmlFor="copyrightText" className="label">متن کپی‌رایت (الزامی، از {year} برای سال جاری استفاده کنید):</label><input id="copyrightText" name="copyrightText" type="text" className="input input-bordered w-full" value={config.copyrightText} onChange={handleChange} disabled={isSavingToServer} /></div>
      
      <button className="btn btn-primary btn-sm" onClick={handleSaveToServer} disabled={isSavingToServer || isLoading || hasValidationError}>
        {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
        ذخیره تنظیمات فوتر
      </button>
    </div>
  );
}

interface HeroConfigType {
  title: string;
  subtitle: string;
  ctaButton1: {
    text: string;
    targetSectionId: string;
  };
  ctaButton2: {
    text: string;
    targetSectionId: string;
  };
}

function HeroConfigEditor({ imported }: { imported: HeroConfigType | null }) {
  const [config, setConfig] = useState<HeroConfigType>(
    imported || {
      title: '',
      subtitle: '',
      ctaButton1: { text: '', targetSectionId: '' },
      ctaButton2: { text: '', targetSectionId: '' },
    }
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (imported) {
      setConfig(imported);
      setIsLoading(false);
      return;
    }
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchContent<HeroConfigType>('hero.json');
        setConfig(data);
      } catch (err) {
        setError('خطا در بارگذاری تنظیمات هیرو. از مقادیر پیش‌فرض یا خالی استفاده می‌شود.');
        setConfig({
          title: 'Default Hero Title',
          subtitle: 'Default Hero Subtitle.',
          ctaButton1: { text: 'Explore', targetSectionId: '#events' },
          ctaButton2: { text: 'About Us', targetSectionId: '#about' },
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [imported]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('ctaButton1.')) {
      const field = name.split('.')[1] as keyof HeroConfigType['ctaButton1'];
      setConfig(prev => ({ ...prev, ctaButton1: { ...prev.ctaButton1, [field]: value } }));
    } else if (name.startsWith('ctaButton2.')) {
      const field = name.split('.')[1] as keyof HeroConfigType['ctaButton2'];
      setConfig(prev => ({ ...prev, ctaButton2: { ...prev.ctaButton2, [field]: value } }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const validateConfig = (): boolean => {
    if (!config.title.trim()) return false;
    if (!config.ctaButton1.text.trim() || !config.ctaButton1.targetSectionId.trim()) return false;
    // ctaButton2 is optional, but if text is present, target must also be present, and vice-versa
    if (config.ctaButton2.text.trim() && !config.ctaButton2.targetSectionId.trim()) return false;
    if (!config.ctaButton2.text.trim() && config.ctaButton2.targetSectionId.trim()) return false;
    return true;
  };
  const hasValidationError = !validateConfig();


  const handleSaveToServer = async () => {
    if (hasValidationError) {
        showToast('لطفاً تمام فیلدهای الزامی را پر کنید و اطمینان حاصل کنید که دکمه‌های CTA به درستی تنظیم شده‌اند.', 'error', 4000);
        return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('hero', config);
      showToast('تنظیمات بخش هیرو با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره تنظیمات هیرو: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره تنظیمات هیرو: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading) return <div>در حال بارگذاری تنظیمات بخش هیرو...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="alert alert-warning text-sm p-2 mb-4">{error}</div>}
      
      <div>
        <label htmlFor="title" className="label">عنوان اصلی (الزامی):</label>
        <input id="title" name="title" type="text" className="input input-bordered w-full" value={config.title} onChange={handleChange} disabled={isSavingToServer} />
      </div>
      
      <div>
        <label htmlFor="subtitle" className="label">زیرعنوان:</label>
        <textarea id="subtitle" name="subtitle" className="textarea textarea-bordered w-full" value={config.subtitle} onChange={handleChange} disabled={isSavingToServer} />
      </div>

      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold">دکمه فراخوان اول (الزامی):</h3>
        <div>
          <label htmlFor="ctaButton1.text" className="label">متن دکمه:</label>
          <input id="ctaButton1.text" name="ctaButton1.text" type="text" className="input input-bordered input-sm w-full" value={config.ctaButton1.text} onChange={handleChange} disabled={isSavingToServer} />
        </div>
        <div>
          <label htmlFor="ctaButton1.targetSectionId" className="label">شناسه بخش هدف (مثلا #about):</label>
          <input id="ctaButton1.targetSectionId" name="ctaButton1.targetSectionId" type="text" className="input input-bordered input-sm w-full" value={config.ctaButton1.targetSectionId} onChange={handleChange} disabled={isSavingToServer} />
        </div>
      </div>

      <div className="p-4 border rounded-lg space-y-3 bg-base-200/50">
        <h3 className="font-semibold">دکمه فراخوان دوم (اختیاری):</h3>
        <div>
          <label htmlFor="ctaButton2.text" className="label">متن دکمه:</label>
          <input id="ctaButton2.text" name="ctaButton2.text" type="text" className="input input-bordered input-sm w-full" value={config.ctaButton2.text} onChange={handleChange} disabled={isSavingToServer} />
        </div>
        <div>
          <label htmlFor="ctaButton2.targetSectionId" className="label">شناسه بخش هدف:</label>
          <input id="ctaButton2.targetSectionId" name="ctaButton2.targetSectionId" type="text" className="input input-bordered input-sm w-full" value={config.ctaButton2.targetSectionId} onChange={handleChange} disabled={isSavingToServer} />
        </div>
         {(config.ctaButton2.text.trim() && !config.ctaButton2.targetSectionId.trim()) || (!config.ctaButton2.text.trim() && config.ctaButton2.targetSectionId.trim()) ? (
          <p className="text-error text-xs">برای دکمه دوم، هم متن و هم هدف باید پر شوند یا هر دو خالی باشند.</p>
        ) : null}
      </div>
      
      <button
        className="btn btn-primary btn-sm"
        onClick={handleSaveToServer}
        disabled={isSavingToServer || isLoading || hasValidationError}
      >
        {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
        ذخیره تنظیمات هیرو
      </button>
    </div>
  );
}

interface NavLinkItem {
  id: string;
  label: string;
  target: string;
  icon?: string;
}

interface HeaderConfigType {
  navLinks: NavLinkItem[];
}

function HeaderConfigEditor({ imported }: { imported: HeaderConfigType | null }) {
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(imported?.navLinks || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [error, setError] = useState(''); // For fetch errors

  const [editingLink, setEditingLink] = useState<NavLinkItem | null>(null);
  const [newLink, setNewLink] = useState<Omit<NavLinkItem, 'id'>>({ label: '', target: '', icon: '' });

  useEffect(() => {
    if (imported) {
      setNavLinks(imported.navLinks || []);
      setIsLoading(false);
      return;
    }
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchContent<HeaderConfigType>('header.json');
        setNavLinks(data.navLinks || []);
      } catch (err) {
        setError('خطا در بارگذاری تنظیمات هدر. از مقادیر پیش‌فرض یا خالی استفاده می‌شود.');
        setNavLinks([{ id: '1', label: 'Home (Default)', target: '#hero', icon: 'Home' }]);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [imported]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const { name, value } = e.target;
    if (id) { // Editing existing link
      setNavLinks(links => links.map(link => link.id === id ? { ...link, [name]: value } : link));
      if (editingLink && editingLink.id === id) {
        setEditingLink(prev => prev ? { ...prev, [name]: value } : null);
      }
    } else { // Adding new link
      setNewLink(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleEditLink = (link: NavLinkItem) => {
    setEditingLink({ ...link});
  };

  const handleSaveEdit = () => {
     if (!editingLink || !editingLink.label.trim() || !editingLink.target.trim()) {
      showToast("برچسب و هدف برای لینک الزامی است.", 'error');
      return;
    }
    setNavLinks(links => links.map(link => link.id === editingLink.id ? editingLink : link));
    setEditingLink(null);
  };
  
  const handleCancelEdit = () => {
    setEditingLink(null);
  };

  const handleAddLink = () => {
    if (!newLink.label.trim() || !newLink.target.trim()) {
      showToast("برچسب و هدف برای لینک جدید الزامی است.", 'error');
      return;
    }
    setNavLinks(links => [...links, { ...newLink, id: Date.now().toString() }]);
    setNewLink({ label: '', target: '', icon: '' });
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این لینک را حذف کنید؟')) {
      setNavLinks(links => links.filter(link => link.id !== id));
    }
  };

  const handleSaveToServer = async () => {
    const hasEmptyFields = navLinks.some(link => !link.label.trim() || !link.target.trim());
    if (hasEmptyFields) {
      showToast('برچسب و هدف برای تمام لینک‌ها الزامی است.', 'error');
      return;
    }

    setIsSavingToServer(true);
    try {
      await updateContentFile('header', { navLinks });
      showToast('تنظیمات هدر با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره تنظیمات هدر: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره تنظیمات هدر: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading) return <div>در حال بارگذاری تنظیمات هدر...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="alert alert-warning text-sm p-2 mb-4">{error}</div>}
      
      {/* Form for adding a new link */}
      <div className="p-4 border rounded-lg bg-base-200">
        <h3 className="font-semibold text-lg mb-2">افزودن لینک جدید</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            name="label"
            placeholder="برچسب (مثلا خانه)"
            className="input input-bordered input-sm"
            value={newLink.label}
            onChange={(e) => handleInputChange(e)}
          />
          <input
            type="text"
            name="target"
            placeholder="هدف (مثلا / یا #about)"
            className="input input-bordered input-sm"
            value={newLink.target}
            onChange={(e) => handleInputChange(e)}
          />
          <input
            type="text"
            name="icon"
            placeholder="آیکون (اختیاری - از Lucide)"
            className="input input-bordered input-sm"
            value={newLink.icon}
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <button onClick={handleAddLink} className="btn btn-primary btn-sm mt-3" disabled={isSavingToServer}>افزودن لینک</button>
      </div>

      {/* List of existing links */}
      <div className="space-y-3">
        {navLinks.map(link => (
          <div key={link.id} className="p-3 border rounded-lg bg-base-100 shadow">
            {editingLink && editingLink.id === link.id ? (
              <div className="space-y-2">
                <input type="text" name="label" value={editingLink.label} onChange={(e) => handleInputChange(e, link.id)} className="input input-bordered input-sm w-full" placeholder="برچسب" />
                <input type="text" name="target" value={editingLink.target} onChange={(e) => handleInputChange(e, link.id)} className="input input-bordered input-sm w-full" placeholder="هدف" />
                <input type="text" name="icon" value={editingLink.icon || ''} onChange={(e) => handleInputChange(e, link.id)} className="input input-bordered input-sm w-full" placeholder="آیکون (اختیاری)" />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="btn btn-success btn-xs" disabled={isSavingToServer}>ذخیره</button>
                  <button onClick={handleCancelEdit} className="btn btn-ghost btn-xs" disabled={isSavingToServer}>انصراف</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{link.label}</span>
                  <span className="text-xs text-gray-500 ml-2">({link.target})</span>
                  {link.icon && <span className="text-xs text-gray-400 ml-2">[{link.icon}]</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditLink(link)} className="btn btn-outline btn-xs" disabled={isSavingToServer}>ویرایش</button>
                  <button onClick={() => handleDeleteLink(link.id)} className="btn btn-error btn-xs" disabled={isSavingToServer}>حذف</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button
        className="btn btn-primary btn-sm"
        onClick={handleSaveToServer}
        disabled={isSavingToServer || isLoading || navLinks.some(l => !l.label.trim() || !l.target.trim())}
      >
        {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
        ذخیره تنظیمات هدر
      </button>
    </div>
  );
}


// --- DRAFT/PREVIEW & HISTORY HOOK ---
function useDraftHistory<T>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const [history, setHistory] = useState<T[]>([initial]);
  const [pointer, setPointer] = useState(0);

  const updateDraft = (next: T) => {
    const newHistory = history.slice(0, pointer + 1);
    setHistory([...newHistory, next]);
    setPointer(newHistory.length);
    setDraft(next);
  };
  const undo = () => {
    if (pointer > 0) {
      setPointer(pointer - 1);
      setDraft(history[pointer - 1]);
    }
  };
  const redo = () => {
    if (pointer < history.length - 1) {
      setPointer(pointer + 1);
      setDraft(history[pointer + 1]);
    }
  };
  const reset = (val: T) => {
    setDraft(val);
    setHistory([val]);
    setPointer(0);
  };
  return { draft, setDraft: updateDraft, undo, redo, canUndo: pointer > 0, canRedo: pointer < history.length - 1, reset };
}

function FAQEditor({ imported }: { imported: FAQItem[] | null }) {
  const [initial, setInitial] = useState<FAQItem[]>(imported || []);
  const { draft, setDraft, undo, redo, canUndo, canRedo, reset } = useDraftHistory<FAQItem[]>(initial);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<FAQItem | null>(null);
  const [newItem, setNewItem] = useState<FAQItem>({ id: '', question: '', answer: '' });
  const [loading, setLoading] = useState(false); // For initial load and reload
  const [isSavingToServer, setIsSavingToServer] = useState(false); // For server save operation

  // Always load latest faq.json on mount (unless imported)
  useEffect(() => {
    if (imported) {
      setInitial(imported);
      reset(imported);
      return;
    }
    setLoading(true);
    fetch('/content/faq.json')
      .then(res => res.json())
      .then(data => {
        setInitial(data);
        reset(data);
      })
      .finally(() => setLoading(false));
  }, [imported, reset]);

  // Validation
  useEffect(() => {
    const hasError = draft.some(item => !item.question.trim() || !item.answer.trim());
    setError(hasError ? 'همه سوالات باید سوال و پاسخ داشته باشند.' : '');
  }, [draft]);

  const handleReload = () => {
    setLoading(true);
    fetch('/content/faq.json')
      .then(res => res.json())
      .then(data => {
        setInitial(data);
        reset(data);
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditItem({ ...draft[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editItem) return;
    const { name, value } = e.target;
    if (name === 'active' && e.target instanceof HTMLInputElement) {
      setEditItem({ ...editItem, active: e.target.checked });
    } else if (name === 'tags') {
      setEditItem({ ...editItem, tags: value.split(',').map(t => t.trim()).filter(Boolean) });
    } else {
      setEditItem({ ...editItem, [name]: value });
    }
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    const updated = [...draft];
    updated[editIndex] = editItem;
    setDraft(updated);
    setEditIndex(null);
    setEditItem(null);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟')) return;
    setDraft(draft.filter((_, i) => i !== index));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'active' && e.target instanceof HTMLInputElement) {
      setNewItem({ ...newItem, active: e.target.checked });
    } else if (name === 'tags') {
      setNewItem({ ...newItem, tags: value.split(',').map(t => t.trim()).filter(Boolean) });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleAdd = () => {
    if (!newItem.question.trim() || !newItem.answer.trim()) return;
    setDraft([...draft, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ id: '', question: '', answer: '' });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faq.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    if (error) {
      showToast('لطفاً قبل از ذخیره، خطاهای موجود را برطرف کنید.', 'error');
      return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('faq', draft);
      showToast('سوالات متداول با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره سوالات متداول: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره سوالات متداول: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button 
          className="btn btn-outline btn-sm btn-success" 
          onClick={handleSaveToServer} 
          disabled={!!error || isSavingToServer || loading}
        >
          {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
          ذخیره در سرور
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleExport} disabled={!!error || isSavingToServer}>خروجی JSON</button>
        <button className={`btn btn-sm ${isPreview ? 'btn-info' : 'btn-ghost'}`} onClick={() => setIsPreview(p => !p)}>{isPreview ? 'بازگشت به ویرایش' : 'پیش‌نمایش'}</button>
        <button className="btn btn-sm btn-warning" onClick={undo} disabled={!canUndo || isSavingToServer}>برگشت</button>
        <button className="btn btn-sm btn-warning" onClick={redo} disabled={!canRedo || isSavingToServer}>جلو</button>
        <button className="btn btn-sm btn-secondary" onClick={handleReload} disabled={loading || isSavingToServer}>بارگذاری مجدد از سایت</button>
        {loading && !isSavingToServer && <span className="loading loading-spinner loading-xs ml-2"></span>}
        {error && <span className="text-error text-sm ml-4">{error}</span>}
      </div>
      {isPreview ? (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-4">پیش‌نمایش سوالات متداول</h3>
          <ul className="space-y-2">
            {draft.map((item, i) => (
              <li key={item.id} className="border-b pb-2">
                <div className="font-bold">{item.question}</div>
                <div>{item.answer}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <ul className="space-y-4 mb-8">
            {draft.map((item, i) => (
              <li key={item.id} className="bg-base-200 p-4 rounded-lg">
                {editIndex === i ? (
                  <div className="space-y-2">
                    <input
                      className="input input-bordered w-full mb-2"
                      name="question"
                      value={editItem?.question || ''}
                      onChange={handleEditChange}
                      placeholder="سوال"
                    />
                    <textarea
                      className="textarea textarea-bordered w-full mb-2"
                      name="answer"
                      value={editItem?.answer || ''}
                      onChange={handleEditChange}
                      placeholder="پاسخ"
                    />
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={handleEditSave}>ذخیره</button>
                      <button className="btn btn-ghost btn-sm" onClick={handleEditCancel}>انصراف</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold mb-1">{item.question}</div>
                    <div className="mb-2">{item.answer}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)}>ویرایش</button>
                      <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)}>حذف</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">افزودن سوال جدید</h3>
            <input
              className="input input-bordered w-full mb-2"
              name="question"
              value={newItem.question}
              onChange={handleAddChange}
              placeholder="سوال"
            />
            <textarea
              className="textarea textarea-bordered w-full mb-2"
              name="answer"
              value={newItem.answer}
              onChange={handleAddChange}
              placeholder="پاسخ"
            />
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>افزودن</button>
          </div>
        </>
      )}
    </div>
  );
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  imageFile?: File | null; // For new image upload
  thumbnailFile?: File | null; // For new thumbnail upload
}

function GalleryEditor({ imported }: { imported: GalleryItem[] | null }) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isSavingToServer, setIsSavingToServer] = useState(false); // For server save
  const [error, setError] = useState(''); // For fetch errors
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null); // Includes File objects
  const [newItem, setNewItem] = useState<GalleryItem>({ id: '', title: '', description: '', date: '', category: '', type: 'image', url: '', thumbnail: '', imageFile: null, thumbnailFile: null });

  // Basic validation for new/edited items - can be expanded
  const validateItem = (item: GalleryItem | null): boolean => {
    if (!item) return false;
    return !!(item.title?.trim() && item.url?.trim() && item.type?.trim());
  };
  
  const hasValidationErrors = galleryItems.some(item => !validateItem(item));


  useEffect(() => {
    const loadGallery = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<GalleryItem[]>('gallery.json');
        setGalleryItems(data);
      } catch (err) {
        setError('خطا در بارگذاری گالری');
      } finally {
        setIsLoading(false);
      }
    };
    if (!imported) loadGallery();
  }, [imported]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditItem({ ...galleryItems[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editItem) return;
    const { name, value } = e.target;
    setEditItem(prev => prev ? { ...prev, [name]: value } : null);
    if (name === 'url') setEditItem(prev => prev ? { ...prev, imageFile: null } : null);
    if (name === 'thumbnail') setEditItem(prev => prev ? { ...prev, thumbnailFile: null } : null);
  };
  
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editItem) return;
    const { name, files } = e.target;
    const file = files?.[0];
    if (file) {
      if (name === 'editImageFile') {
        setEditItem(prev => prev ? { ...prev, imageFile: file, url: `/images/uploads/gallery/${file.name}` } : null);
      } else if (name === 'editThumbnailFile') {
        setEditItem(prev => prev ? { ...prev, thumbnailFile: file, thumbnail: `/images/uploads/gallery/thumbnails/${file.name}` } : null);
      }
    }
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    
    if (editItem.imageFile) {
        console.log(`Gallery image for item [${editItem.id}] "${editItem.title}" (${editItem.imageFile.name}) would be uploaded here.`);
    }
    if (editItem.thumbnailFile) {
        console.log(`Gallery thumbnail for item [${editItem.id}] "${editItem.title}" (${editItem.thumbnailFile.name}) would be uploaded here.`);
    }
    
    const updated = [...galleryItems];
    // Create a version of editItem without file objects for saving to JSON
    const { imageFile, thumbnailFile, ...itemToSave } = editItem;
    updated[editIndex] = itemToSave;

    setGalleryItems(updated);
    setEditIndex(null);
    setEditItem(null); // Clears editItem including its File objects
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟')) return;
    setGalleryItems(galleryItems.filter((_, i) => i !== index));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
    if (name === 'url') setNewItem(prev => ({ ...prev, imageFile: null }));
    if (name === 'thumbnail') setNewItem(prev => ({ ...prev, thumbnailFile: null }));
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (file) {
      if (name === 'newImageFile') {
        setNewItem(prev => ({ ...prev, imageFile: file, url: `/images/uploads/gallery/${file.name}` }));
      } else if (name === 'newThumbnailFile') {
        setNewItem(prev => ({ ...prev, thumbnailFile: file, thumbnail: `/images/uploads/gallery/thumbnails/${file.name}` }));
      }
    }
  };

  const handleAdd = () => {
    if (!validateItem(newItem)) {
      showToast("عنوان و آدرس URL برای مورد جدید گالری الزامی است.", 'error');
      return;
    }

    if (newItem.imageFile) {
        console.log(`New gallery image "${newItem.title}" (${newItem.imageFile.name}) would be uploaded here.`);
    }
    if (newItem.thumbnailFile) {
        console.log(`New gallery thumbnail "${newItem.title}" (${newItem.thumbnailFile.name}) would be uploaded here.`);
    }

    // Create a version of newItem without file objects for saving to JSON
    const { imageFile, thumbnailFile, ...itemToSave } = newItem;
    setGalleryItems([...galleryItems, { ...itemToSave, id: Date.now().toString() }]);
    setNewItem({ id: '', title: '', description: '', date: '', category: '', type: 'image', url: '', thumbnail: '', imageFile: null, thumbnailFile: null });
  };

  const handleExport = () => {
    if (hasValidationErrors) {
      showToast('برخی از موارد گالری دارای خطای اعتبارسنجی هستند. لطفاً قبل از خروجی گرفتن، آنها را اصلاح کنید.', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(galleryItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gallery.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    if (hasValidationErrors) {
      showToast('برخی از موارد گالری دارای خطای اعتبارسنجی هستند. لطفاً قبل از ذخیره در سرور، آنها را اصلاح کنید.', 'error');
      return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('gallery', galleryItems);
      showToast('گالری با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره گالری: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره گالری: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading && !isSavingToServer) return <div>در حال بارگذاری گالری...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h2 className="text-xl font-bold mr-auto">گالری تصاویر و ویدیوها</h2>
        <button
          className="btn btn-outline btn-sm btn-success"
          onClick={handleSaveToServer}
          disabled={isSavingToServer || isLoading || hasValidationErrors}
        >
          {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
          ذخیره در سرور
        </button>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={handleExport}
          disabled={isSavingToServer || isLoading || hasValidationErrors}
        >
          خروجی JSON
        </button>
      </div>
      {hasValidationErrors && <div className="alert alert-warning text-sm p-2 mb-4">برخی موارد عنوان یا URL معتبر ندارند.</div>}
      <ul className="space-y-4 mb-8">
        {galleryItems.map((item, i) => (
          <li key={item.id} className={`bg-base-200 p-4 rounded-lg ${!validateItem(item) ? 'border border-error' : ''}`}>
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-1" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان (الزامی)" />
                <textarea className="textarea textarea-bordered w-full mb-1" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="توضیحات" />
                <input className="input input-bordered w-full mb-1" name="date" value={editItem?.date || ''} onChange={handleEditChange} placeholder="تاریخ" />
                <input className="input input-bordered w-full mb-1" name="category" value={editItem?.category || ''} onChange={handleEditChange} placeholder="دسته‌بندی" />
                <select className="select select-bordered w-full mb-1" name="type" value={editItem?.type || 'image'} onChange={handleEditChange}>
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                </select>
                
                <label className="label text-xs pb-0">آدرس فایل (URL) (الزامی):</label>
                <input className="input input-bordered input-sm w-full mb-0.5" name="url" value={editItem?.url || ''} onChange={handleEditChange} placeholder="آدرس فایل (URL)" disabled={!!editItem?.imageFile} />
                <input type="file" name="editImageFile" accept="image/*,video/*" className="file-input file-input-xs w-full" onChange={handleEditFileChange} />
                {editItem?.imageFile && <p className="text-xs text-info">فایل انتخاب شده: {editItem.imageFile.name}</p>}

                <label className="label text-xs pb-0 pt-2">آدرس بندانگشتی (اختیاری):</label>
                <input className="input input-bordered input-sm w-full mb-0.5" name="thumbnail" value={editItem?.thumbnail || ''} onChange={handleEditChange} placeholder="آدرس بندانگشتی (thumbnail)" disabled={!!editItem?.thumbnailFile} />
                <input type="file" name="editThumbnailFile" accept="image/*" className="file-input file-input-xs w-full" onChange={handleEditFileChange} />
                {editItem?.thumbnailFile && <p className="text-xs text-info">فایل بندانگشتی انتخاب شده: {editItem.thumbnailFile.name}</p>}

                <div className="flex gap-2 pt-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={!validateItem(editItem) || isSavingToServer}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel} disabled={isSavingToServer}>انصراف</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{item.title}</div>
                <div className="mb-2">{item.description}</div>
                <div className="mb-2 text-xs opacity-70">{item.date} | {item.category} | {item.type}</div>
                <div className="mb-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="link link-primary">مشاهده فایل</a>
                  {item.thumbnail && <span className="ml-2">| <a href={item.thumbnail} target="_blank" rel="noopener noreferrer" className="link link-secondary">بندانگشتی</a></span>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)} disabled={isSavingToServer || isLoading}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)} disabled={isSavingToServer || isLoading}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن مورد جدید</h3>
        <input className="input input-bordered w-full mb-1" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان (الزامی)" />
        <textarea className="textarea textarea-bordered w-full mb-1" name="description" value={newItem.description} onChange={handleAddChange} placeholder="توضیحات" />
        <input className="input input-bordered w-full mb-1" name="date" value={newItem.date} onChange={handleAddChange} placeholder="تاریخ" />
        <input className="input input-bordered w-full mb-1" name="category" value={newItem.category} onChange={handleAddChange} placeholder="دسته‌بندی" />
        <select className="select select-bordered w-full mb-1" name="type" value={newItem.type} onChange={handleAddChange}>
          <option value="image">تصویر</option>
          <option value="video">ویدیو</option>
        </select>
        
        <label className="label text-xs pb-0">آدرس فایل (URL) (الزامی):</label>
        <input className="input input-bordered input-sm w-full mb-0.5" name="url" value={newItem.url} onChange={handleAddChange} placeholder="آدرس فایل (URL)" disabled={!!newItem.imageFile} />
        <input type="file" name="newImageFile" accept="image/*,video/*" className="file-input file-input-xs w-full" onChange={handleAddFileChange} />
        {newItem.imageFile && <p className="text-xs text-info">فایل انتخاب شده: {newItem.imageFile.name}</p>}
        
        <label className="label text-xs pb-0 pt-2">آدرس بندانگشتی (اختیاری):</label>
        <input className="input input-bordered input-sm w-full mb-0.5" name="thumbnail" value={newItem.thumbnail} onChange={handleAddChange} placeholder="آدرس بندانگشتی (thumbnail)" disabled={!!newItem.thumbnailFile}/>
        <input type="file" name="newThumbnailFile" accept="image/*" className="file-input file-input-xs w-full" onChange={handleAddFileChange} />
        {newItem.thumbnailFile && <p className="text-xs text-info">فایل بندانگشتی انتخاب شده: {newItem.thumbnailFile.name}</p>}

        <button className="btn btn-primary btn-sm mt-3" onClick={handleAdd} disabled={isSavingToServer || isLoading || !validateItem(newItem)}>افزودن</button>
      </div>
    </div>
  );
}

interface PastEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'meetup' | 'conference' | 'videocast';
  image: string;
  youtubeLink: string;
}

function PastEventsEditor({ imported }: { imported: PastEvent[] | null }) {
  const [events, setEvents] = useState<PastEvent[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isSavingToServer, setIsSavingToServer] = useState(false); // For server save
  const [error, setError] = useState(''); // For fetch errors
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<PastEvent | null>(null);
  const [newItem, setNewItem] = useState<PastEvent>({ id: '', title: '', description: '', date: '', category: 'meetup', image: '', youtubeLink: '' });

  const validateEventItem = (item: PastEvent | null): boolean => {
    if (!item) return false;
    return !!(item.title?.trim() && item.date?.trim() && item.category?.trim());
  };

  const hasEventValidationErrors = events.some(item => !validateEventItem(item));

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<PastEvent[]>('past-events.json');
        setEvents(data);
      } catch (err) {
        setError('خطا در بارگذاری رویدادها');
      } finally {
        setIsLoading(false);
      }
    };
    if (!imported) loadEvents();
  }, [imported]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditItem({ ...events[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editItem) return;
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    const updated = [...events];
    updated[editIndex] = editItem;
    setEvents(updated);
    setEditIndex(null);
    setEditItem(null);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این رویداد را حذف کنید؟')) return;
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!validateEventItem(newItem)) {
       showToast("عنوان، تاریخ و دسته‌بندی برای رویداد جدید الزامی است.", 'error');
      return;
    }
    setEvents([...events, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ id: '', title: '', description: '', date: '', category: 'meetup', image: '', youtubeLink: '' });
  };

  const handleExport = () => {
    if (hasEventValidationErrors) {
      showToast('برخی از رویدادها دارای خطای اعتبارسنجی هستند. لطفاً قبل از خروجی گرفتن، آنها را اصلاح کنید.', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'past-events.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    if (hasEventValidationErrors) {
      showToast('برخی از رویدادها دارای خطای اعتبارسنجی هستند. لطفاً قبل از ذخیره در سرور، آنها را اصلاح کنید.', 'error');
      return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('past-events', events);
      showToast('رویدادهای گذشته با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره رویدادهای گذشته: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره رویدادهای گذشته: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading && !isSavingToServer) return <div>در حال بارگذاری رویدادهای گذشته...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h2 className="text-xl font-bold mr-auto">رویدادهای گذشته</h2>
        <button
          className="btn btn-outline btn-sm btn-success"
          onClick={handleSaveToServer}
          disabled={isSavingToServer || isLoading || hasEventValidationErrors}
        >
          {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
          ذخیره در سرور
        </button>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={handleExport}
          disabled={isSavingToServer || isLoading || hasEventValidationErrors}
        >
          خروجی JSON
        </button>
      </div>
      {hasEventValidationErrors && <div className="alert alert-warning text-sm p-2 mb-4">برخی رویدادها عنوان، تاریخ یا دسته‌بندی معتبر ندارند.</div>}
      <ul className="space-y-4 mb-8">
        {events.map((item, i) => (
          <li key={item.id} className={`bg-base-200 p-4 rounded-lg ${!validateEventItem(item) ? 'border border-error' : ''}`}>
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان (الزامی)" />
                <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="توضیحات" />
                <input className="input input-bordered w-full mb-2" name="date" value={editItem?.date || ''} onChange={handleEditChange} placeholder="تاریخ (الزامی)" />
                <select className="select select-bordered w-full mb-2" name="category" value={editItem?.category || 'meetup'} onChange={handleEditChange}>
                  <option value="meetup">میتاپ</option>
                  <option value="conference">کنفرانس</option>
                  <option value="videocast">ویدیوکست</option>
                </select>
                <input className="input input-bordered w-full mb-2" name="image" value={editItem?.image || ''} onChange={handleEditChange} placeholder="آدرس تصویر (URL)" />
                <input className="input input-bordered w-full mb-2" name="youtubeLink" value={editItem?.youtubeLink || ''} onChange={handleEditChange} placeholder="لینک یوتیوب" />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={!validateEventItem(editItem) || isSavingToServer}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel} disabled={isSavingToServer}>انصراف</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{item.title}</div>
                <div className="mb-2">{item.description}</div>
                <div className="mb-2 text-xs opacity-70">{item.date} | {item.category}</div>
                <div className="mb-2">
                  <a href={item.image} target="_blank" rel="noopener noreferrer" className="link link-primary">مشاهده تصویر</a>
                  {item.youtubeLink && <span className="ml-2">| <a href={item.youtubeLink} target="_blank" rel="noopener noreferrer" className="link link-secondary">یوتیوب</a></span>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)} disabled={isSavingToServer || isLoading}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)} disabled={isSavingToServer || isLoading}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن رویداد جدید</h3>
        <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان (الزامی)" />
        <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={newItem.description} onChange={handleAddChange} placeholder="توضیحات" />
        <input className="input input-bordered w-full mb-2" name="date" value={newItem.date} onChange={handleAddChange} placeholder="تاریخ (الزامی)" />
        <select className="select select-bordered w-full mb-2" name="category" value={newItem.category} onChange={handleAddChange}>
          <option value="meetup">میتاپ</option>
          <option value="conference">کنفرانس</option>
          <option value="videocast">ویدیوکست</option>
        </select>
        <input className="input input-bordered w-full mb-2" name="image" value={newItem.image} onChange={handleAddChange} placeholder="آدرس تصویر (URL)" />
        <input className="input input-bordered w-full mb-2" name="youtubeLink" value={newItem.youtubeLink} onChange={handleAddChange} placeholder="لینک یوتیوب" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={isSavingToServer || isLoading || !validateEventItem(newItem)}>افزودن</button>
      </div>
    </div>
  );
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'financial' | 'moral' | 'media';
  website: string;
  logoFile?: File | null;
}

function SponsorsEditor({ imported }: { imported: Sponsor[] | null }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isSavingToServer, setIsSavingToServer] = useState(false); // For server save
  const [error, setError] = useState(''); // For fetch errors
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Sponsor | null>(null); // Includes File object
  const [newItem, setNewItem] = useState<Sponsor>({ id: '', name: '', logo: '', type: 'financial', website: '', logoFile: null });

  const validateSponsorItem = (item: Sponsor | null): boolean => {
    if (!item) return false;
    return !!(item.name?.trim() && item.logo?.trim() && item.type?.trim());
  };

  const hasSponsorValidationErrors = sponsors.some(item => !validateSponsorItem(item));

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<Sponsor[]>('sponsors.json');
        setSponsors(data);
      } catch (err) {
        setError('خطا در بارگذاری حامیان');
      } finally {
        setIsLoading(false);
      }
    };
    if (!imported) loadSponsors();
  }, [imported]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditItem({ ...sponsors[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editItem) return;
    const { name, value } = e.target;
    setEditItem(prev => prev ? { ...prev, [name]: value } : null);
    if (name === 'logo') setEditItem(prev => prev ? { ...prev, logoFile: null } : null);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editItem) return;
    const file = e.target.files?.[0];
    if (file) {
      setEditItem(prev => prev ? { ...prev, logoFile: file, logo: `/images/uploads/sponsors/${file.name}` } : null);
    }
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;

    if (editItem.logoFile) {
      console.log(`Sponsor logo for item [${editItem.id}] "${editItem.name}" (${editItem.logoFile.name}) would be uploaded here.`);
    }

    const updated = [...sponsors];
    const { logoFile, ...itemToSave } = editItem;
    updated[editIndex] = itemToSave;
    setSponsors(updated);
    setEditIndex(null);
    setEditItem(null); // Clears editItem including its File object
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این حامی را حذف کنید؟')) return;
    setSponsors(sponsors.filter((_, i) => i !== index));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
    if (name === 'logo') setNewItem(prev => ({ ...prev, logoFile: null }));
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItem(prev => ({ ...prev, logoFile: file, logo: `/images/uploads/sponsors/${file.name}` }));
    }
  };

  const handleAdd = () => {
    if (!validateSponsorItem(newItem)) {
      showToast("نام، لوگو و نوع حامی برای مورد جدید الزامی است.", 'error');
      return;
    }
    
    if (newItem.logoFile) {
      console.log(`New sponsor logo "${newItem.name}" (${newItem.logoFile.name}) would be uploaded here.`);
    }
    
    const { logoFile, ...itemToSave } = newItem;
    setSponsors([...sponsors, { ...itemToSave, id: Date.now().toString() }]);
    setNewItem({ id: '', name: '', logo: '', type: 'financial', website: '', logoFile: null });
  };

  const handleExport = () => {
    if (hasSponsorValidationErrors) {
      showToast('برخی از حامیان دارای خطای اعتبارسنجی هستند. لطفاً قبل از خروجی گرفتن، آنها را اصلاح کنید.', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(sponsors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sponsors.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    if (hasSponsorValidationErrors) {
      showToast('برخی از حامیان دارای خطای اعتبارسنجی هستند. لطفاً قبل از ذخیره در سرور، آنها را اصلاح کنید.', 'error');
      return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('sponsors', sponsors);
      showToast('حامیان با موفقیت در سرور ذخیره شدند.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره حامیان: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره حامیان: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading && !isSavingToServer) return <div>در حال بارگذاری حامیان...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h2 className="text-xl font-bold mr-auto">حامیان</h2>
        <button
          className="btn btn-outline btn-sm btn-success"
          onClick={handleSaveToServer}
          disabled={isSavingToServer || isLoading || hasSponsorValidationErrors}
        >
          {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
          ذخیره در سرور
        </button>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={handleExport}
          disabled={isSavingToServer || isLoading || hasSponsorValidationErrors}
        >
          خروجی JSON
        </button>
      </div>
      {hasSponsorValidationErrors && <div className="alert alert-warning text-sm p-2 mb-4">برخی حامیان نام، لوگو یا نوع معتبر ندارند.</div>}
      <ul className="space-y-4 mb-8">
        {sponsors.map((item, i) => (
          <li key={item.id} className={`bg-base-200 p-4 rounded-lg ${!validateSponsorItem(item) ? 'border border-error' : ''}`}>
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-1" name="name" value={editItem?.name || ''} onChange={handleEditChange} placeholder="نام (الزامی)" />
                
                <label className="label text-xs pb-0">آدرس لوگو (URL) (الزامی):</label>
                <input className="input input-bordered input-sm w-full mb-0.5" name="logo" value={editItem?.logo || ''} onChange={handleEditChange} placeholder="آدرس لوگو (URL)" disabled={!!editItem?.logoFile} />
                <input type="file" name="editLogoFile" accept="image/*" className="file-input file-input-xs w-full" onChange={handleEditFileChange} />
                {editItem?.logoFile && <p className="text-xs text-info">فایل انتخاب شده: {editItem.logoFile.name}</p>}

                <select className="select select-bordered w-full mt-1 mb-1" name="type" value={editItem?.type || 'financial'} onChange={handleEditChange}>
                  <option value="financial">مالی</option>
                  <option value="moral">معنوی</option>
                  <option value="media">رسانه‌ای</option>
                </select>
                <input className="input input-bordered w-full mb-1" name="website" value={editItem?.website || ''} onChange={handleEditChange} placeholder="وبسایت" />
                <div className="flex gap-2 pt-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={!validateSponsorItem(editItem) || isSavingToServer}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel} disabled={isSavingToServer}>انصراف</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{item.name}</div>
                <div className="mb-2 text-xs opacity-70">{item.type}</div>
                <div className="mb-2">
                  <a href={item.logo} target="_blank" rel="noopener noreferrer" className="link link-primary">مشاهده لوگو</a>
                  {item.website && <span className="ml-2">| <a href={item.website} target="_blank" rel="noopener noreferrer" className="link link-secondary">وبسایت</a></span>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)} disabled={isSavingToServer || isLoading}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)} disabled={isSavingToServer || isLoading}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن حامی جدید</h3>
        <input className="input input-bordered w-full mb-1" name="name" value={newItem.name} onChange={handleAddChange} placeholder="نام (الزامی)" />
        
        <label className="label text-xs pb-0">آدرس لوگو (URL) (الزامی):</label>
        <input className="input input-bordered input-sm w-full mb-0.5" name="logo" value={newItem.logo} onChange={handleAddChange} placeholder="آدرس لوگو (URL)" disabled={!!newItem.logoFile} />
        <input type="file" name="newLogoFile" accept="image/*" className="file-input file-input-xs w-full" onChange={handleAddFileChange} />
        {newItem.logoFile && <p className="text-xs text-info">فایل انتخاب شده: {newItem.logoFile.name}</p>}

        <select className="select select-bordered w-full mt-2 mb-1" name="type" value={newItem.type} onChange={handleAddChange}>
          <option value="financial">مالی</option>
          <option value="moral">معنوی</option>
          <option value="media">رسانه‌ای</option>
        </select>
        <input className="input input-bordered w-full mb-1" name="website" value={newItem.website} onChange={handleAddChange} placeholder="وبسایت" />
        <button className="btn btn-primary btn-sm mt-2" onClick={handleAdd} disabled={isSavingToServer || isLoading || !validateSponsorItem(newItem)}>افزودن</button>
      </div>
    </div>
  );
}

interface Stat {
  icon: string;
  title: string;
  value: number;
  tooltip: string;
}

function StatsEditor({ imported }: { imported: Stat[] | null }) {
  const [stats, setStats] = useState<Stat[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isSavingToServer, setIsSavingToServer] = useState(false); // For server save
  const [error, setError] = useState(''); // For fetch errors
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Stat | null>(null);
  const [newItem, setNewItem] = useState<Stat>({ icon: '', title: '', value: 0, tooltip: '' });

  const validateStatItem = (item: Stat | null): boolean => {
    if (!item) return false;
    return !!(item.title?.trim() && item.icon?.trim()); // Value can be 0, tooltip is optional
  };

  const hasStatValidationErrors = stats.some(item => !validateStatItem(item));

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<Stat[]>('stats.json');
        setStats(data);
      } catch (err) {
        setError('خطا در بارگذاری آمار');
      } finally {
        setIsLoading(false);
      }
    };
    if (!imported) loadStats();
  }, [imported]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditItem({ ...stats[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editItem) return;
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: name === 'value' ? Number(value) : value });
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    const updated = [...stats];
    updated[editIndex] = editItem;
    setStats(updated);
    setEditIndex(null);
    setEditItem(null);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این آمار را حذف کنید؟')) return;
    setStats(stats.filter((_, i) => i !== index));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: name === 'value' ? Number(value) : value });
  };

  const handleAdd = () => {
    if (!validateStatItem(newItem)) {
      showToast("عنوان و آیکون برای آمار جدید الزامی است.", 'error');
      return;
    }
    setStats([...stats, { ...newItem }]);
    setNewItem({ icon: '', title: '', value: 0, tooltip: '' });
  };

  const handleExport = () => {
    if (hasStatValidationErrors) {
      showToast('برخی از آمارها دارای خطای اعتبارسنجی هستند. لطفاً قبل از خروجی گرفتن، آنها را اصلاح کنید.', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stats.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    if (hasStatValidationErrors) {
      showToast('برخی از آمارها دارای خطای اعتبارسنجی هستند. لطفاً قبل از ذخیره در سرور، آنها را اصلاح کنید.', 'error');
      return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('stats', stats);
      showToast('آمار با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره آمار: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره آمار: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading && !isSavingToServer) return <div>در حال بارگذاری آمار...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h2 className="text-xl font-bold mr-auto">آمار</h2>
        <button
          className="btn btn-outline btn-sm btn-success"
          onClick={handleSaveToServer}
          disabled={isSavingToServer || isLoading || hasStatValidationErrors}
        >
          {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
          ذخیره در سرور
        </button>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={handleExport}
          disabled={isSavingToServer || isLoading || hasStatValidationErrors}
        >
          خروجی JSON
        </button>
      </div>
      {hasStatValidationErrors && <div className="alert alert-warning text-sm p-2 mb-4">برخی آمارها عنوان یا آیکون معتبر ندارند.</div>}
      <ul className="space-y-4 mb-8">
        {stats.map((item, i) => (
          <li key={i} className={`bg-base-200 p-4 rounded-lg ${!validateStatItem(item) ? 'border border-error' : ''}`}>
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="icon" value={editItem?.icon || ''} onChange={handleEditChange} placeholder="آیکون (الزامی)" />
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان (الزامی)" />
                <input className="input input-bordered w-full mb-2" name="value" type="number" value={editItem?.value || 0} onChange={handleEditChange} placeholder="مقدار" />
                <input className="input input-bordered w-full mb-2" name="tooltip" value={editItem?.tooltip || ''} onChange={handleEditChange} placeholder="توضیح (Tooltip)" />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={!validateStatItem(editItem) || isSavingToServer}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel} disabled={isSavingToServer}>انصراف</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{item.title}</div>
                <div className="mb-2">مقدار: {item.value}</div>
                <div className="mb-2 text-xs opacity-70">آیکون: {item.icon}</div>
                <div className="mb-2 text-xs opacity-70">{item.tooltip}</div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)} disabled={isSavingToServer || isLoading}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)} disabled={isSavingToServer || isLoading}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن آمار جدید</h3>
        <input className="input input-bordered w-full mb-2" name="icon" value={newItem.icon} onChange={handleAddChange} placeholder="آیکون (الزامی)" />
        <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان (الزامی)" />
        <input className="input input-bordered w-full mb-2" name="value" type="number" value={newItem.value} onChange={handleAddChange} placeholder="مقدار" />
        <input className="input input-bordered w-full mb-2" name="tooltip" value={newItem.tooltip} onChange={handleAddChange} placeholder="توضیح (Tooltip)" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={isSavingToServer || isLoading || !validateStatItem(newItem)}>افزودن</button>
      </div>
    </div>
  );
}

interface UpcomingEvent {
  title: string;
  date: string;
  registerLink: string;
  detailsLink: string;
  youtubeLink?: string;
  aparatLink?: string;
  instagramLink?: string;
  infoLink?: string;
  tags?: string[];
  description?: string;
  active?: boolean;
}

function UpcomingEventEditor({ imported }: { imported: UpcomingEvent[] | null }) {
  const [events, setEvents] = useState<UpcomingEvent[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isSavingToServer, setIsSavingToServer] = useState(false); // For server save
  const [error, setError] = useState(''); // For fetch errors
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<UpcomingEvent | null>(null);
  const [newItem, setNewItem] = useState<UpcomingEvent>({
    title: '',
    date: '',
    registerLink: '',
    detailsLink: '',
    youtubeLink: '',
    aparatLink: '',
    instagramLink: '',
    infoLink: '',
    tags: [],
    description: '',
    active: true
  });

  const validateUpcomingEventItem = (item: UpcomingEvent | null): boolean => {
    if (!item) return false;
    return !!(item.title?.trim() && item.date?.trim() && item.registerLink?.trim() && item.detailsLink?.trim());
  };

  const hasUpcomingEventValidationErrors = events.some(item => !validateUpcomingEventItem(item));

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<UpcomingEvent[] | UpcomingEvent>('upcoming-event.json');
        let arr: UpcomingEvent[] = Array.isArray(data) ? data : [data];
        setEvents(arr);
      } catch (err) {
        setError('خطا در بارگذاری رویدادهای آینده');
      } finally {
        setIsLoading(false);
      }
    };
    if (!imported) loadEvents();
  }, [imported]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditItem({ ...events[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editItem) return;
    const { name, value } = e.target;
    if (name === 'active' && e.target instanceof HTMLInputElement) {
      setEditItem({ ...editItem, active: e.target.checked });
    } else if (name === 'tags') {
      setEditItem({ ...editItem, tags: value.split(',').map(t => t.trim()).filter(Boolean) });
    } else {
      setEditItem({ ...editItem, [name]: value });
    }
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    const updated = [...events];
    updated[editIndex] = editItem;
    setEvents(updated);
    setEditIndex(null);
    setEditItem(null);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این رویداد را حذف کنید؟')) return;
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'active' && e.target instanceof HTMLInputElement) {
      setNewItem({ ...newItem, active: e.target.checked });
    } else if (name === 'tags') {
      setNewItem({ ...newItem, tags: value.split(',').map(t => t.trim()).filter(Boolean) });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleAdd = () => {
    if (!validateUpcomingEventItem(newItem)) {
      showToast("عنوان، تاریخ، لینک ثبت‌نام و لینک جزئیات برای رویداد جدید الزامی است.", 'error');
      return;
    }
    if (events.length >= 3) {
      showToast("حداکثر ۳ رویداد آینده می‌توانید اضافه کنید.", 'warning');
      return;
    }
    setEvents([...events, { ...newItem }]);
    setNewItem({
      title: '',
      date: '',
      registerLink: '',
      detailsLink: '',
      youtubeLink: '',
      aparatLink: '',
      instagramLink: '',
      infoLink: '',
      tags: [],
      description: '',
      active: true
    });
  };

  const handleExport = () => {
    if (hasUpcomingEventValidationErrors) {
      showToast('برخی از رویدادهای آینده دارای خطای اعتبارسنجی هستند. لطفاً قبل از خروجی گرفتن، آنها را اصلاح کنید.', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upcoming-event.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    if (hasUpcomingEventValidationErrors) {
      showToast('برخی از رویدادهای آینده دارای خطای اعتبارسنجی هستند. لطفاً قبل از ذخیره در سرور، آنها را اصلاح کنید.', 'error');
      return;
    }
    setIsSavingToServer(true);
    try {
      await updateContentFile('upcoming-event', events);
      showToast('رویدادهای آینده با موفقیت در سرور ذخیره شد.', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(`خطا در ذخیره رویدادهای آینده: ${err.message}`, 'error');
      } else {
        showToast('خطا در ذخیره رویدادهای آینده: یک خطای ناشناخته رخ داد.', 'error');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  if (isLoading && !isSavingToServer) return <div>در حال بارگذاری رویدادهای آینده...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h2 className="text-xl font-bold mr-auto">رویدادهای آینده (حداکثر ۳ رویداد)</h2>
        <button
          className="btn btn-outline btn-sm btn-success"
          onClick={handleSaveToServer}
          disabled={isSavingToServer || isLoading || hasUpcomingEventValidationErrors}
        >
          {isSavingToServer && <span className="loading loading-spinner loading-xs mr-2"></span>}
          ذخیره در سرور
        </button>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={handleExport}
          disabled={isSavingToServer || isLoading || hasUpcomingEventValidationErrors}
        >
          خروجی JSON
        </button>
      </div>
      {hasUpcomingEventValidationErrors && <div className="alert alert-warning text-sm p-2 mb-4">برخی رویدادها عنوان، تاریخ، لینک ثبت‌نام یا لینک جزئیات معتبر ندارند.</div>}
      <ul className="space-y-4 mb-8">
        {events.map((item, i) => (
          <li key={i} className={`bg-base-200 p-4 rounded-lg ${!validateUpcomingEventItem(item) ? 'border border-error' : ''}`}>
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان (الزامی)" />
                <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="توضیحات" />
                <input className="input input-bordered w-full mb-2" name="date" value={editItem?.date || ''} onChange={handleEditChange} placeholder="تاریخ (الزامی)" />
                <input className="input input-bordered w-full mb-2" name="registerLink" value={editItem?.registerLink || ''} onChange={handleEditChange} placeholder="لینک ثبت‌نام (الزامی)" />
                <input className="input input-bordered w-full mb-2" name="detailsLink" value={editItem?.detailsLink || ''} onChange={handleEditChange} placeholder="لینک جزئیات (الزامی)" />
                <input className="input input-bordered w-full mb-2" name="youtubeLink" value={editItem?.youtubeLink || ''} onChange={handleEditChange} placeholder="لینک یوتیوب (اختیاری)" />
                <input className="input input-bordered w-full mb-2" name="aparatLink" value={editItem?.aparatLink || ''} onChange={handleEditChange} placeholder="لینک آپارات (اختیاری)" />
                <input className="input input-bordered w-full mb-2" name="instagramLink" value={editItem?.instagramLink || ''} onChange={handleEditChange} placeholder="لینک اینستاگرام (اختیاری)" />
                <input className="input input-bordered w-full mb-2" name="infoLink" value={editItem?.infoLink || ''} onChange={handleEditChange} placeholder="لینک اطلاعات (اختیاری)" />
                <input className="input input-bordered w-full mb-2" name="tags" value={editItem?.tags?.join(', ') || ''} onChange={handleEditChange} placeholder="برچسب‌ها (با ویرگول جدا کنید)" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" checked={!!editItem?.active} onChange={handleEditChange} />
                  <span>فعال باشد</span>
                </label>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={!validateUpcomingEventItem(editItem) || isSavingToServer}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel} disabled={isSavingToServer}>انصراف</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{item.title}</div>
                <div className="mb-2">{item.description}</div>
                <div className="mb-2 text-xs opacity-70">{item.date}</div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {item.tags && item.tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-outline badge-primary">{tag}</span>
                  ))}
                </div>
                <div className="mb-2">
                  <span className="badge badge-{item.active ? 'success' : 'neutral'}">{item.active ? 'فعال' : 'غیرفعال'}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)} disabled={isSavingToServer || isLoading}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)} disabled={isSavingToServer || isLoading}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {events.length < 3 && (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">افزودن رویداد جدید</h3>
          <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان (الزامی)" />
          <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={newItem.description} onChange={handleAddChange} placeholder="توضیحات" />
          <input className="input input-bordered w-full mb-2" name="date" value={newItem.date} onChange={handleAddChange} placeholder="تاریخ (الزامی)" />
          <input className="input input-bordered w-full mb-2" name="registerLink" value={newItem.registerLink} onChange={handleAddChange} placeholder="لینک ثبت‌نام (الزامی)" />
          <input className="input input-bordered w-full mb-2" name="detailsLink" value={newItem.detailsLink} onChange={handleAddChange} placeholder="لینک جزئیات (الزامی)" />
          <input className="input input-bordered w-full mb-2" name="youtubeLink" value={newItem.youtubeLink} onChange={handleAddChange} placeholder="لینک یوتیوب (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="aparatLink" value={newItem.aparatLink} onChange={handleAddChange} placeholder="لینک آپارات (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="instagramLink" value={newItem.instagramLink} onChange={handleAddChange} placeholder="لینک اینستاگرام (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="infoLink" value={newItem.infoLink} onChange={handleAddChange} placeholder="لینک اطلاعات (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="tags" value={newItem.tags?.join(', ') || ''} onChange={handleAddChange} placeholder="برچسب‌ها (با ویرگول جدا کنید)" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" checked={!!newItem.active} onChange={handleAddChange} />
            <span>فعال باشد</span>
          </label>
          <button className="btn btn-primary btn-sm mt-2" onClick={handleAdd} disabled={isSavingToServer || isLoading || !validateUpcomingEventItem(newItem)}>افزودن</button>
        </div>
      )}
    </div>
  );
}

function GlobalImportExportBar({ onImport }: { onImport: (data: Record<string, any>) => void }) {
  // Export all content as ZIP
  const handleExportAll = async () => {
    const zip = new JSZip();
    const files = [
      'faq.json',
      'gallery.json',
      'past-events.json',
      'sponsors.json',
      'stats.json',
      'upcoming-event.json',
    ];
    for (const file of files) {
      try {
        const res = await fetch(`/content/${file}`);
        if (res.ok) {
          const text = await res.text();
          zip.file(file, text);
        }
      } catch {}
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockdays-content.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import ZIP and parse all content
  const handleImportAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    const data: Record<string, any> = {};
    for (const filename of Object.keys(loaded.files)) {
      if (filename.endsWith('.json')) {
        const text = await loaded.files[filename].async('string');
        try {
          data[filename] = JSON.parse(text);
        } catch {
          data[filename] = null;
        }
      }
    }
    onImport(data);
  };

  return (
    <div className="flex gap-4 mb-6 items-center">
      <button className="btn btn-outline btn-sm" onClick={handleExportAll}>خروجی همه (ZIP)</button>
      <label className="btn btn-outline btn-sm cursor-pointer">
        بازیابی همه (ZIP)
        <input type="file" accept=".zip" className="hidden" onChange={handleImportAll} />
      </label>
    </div>
  );
}

function useCMSTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('cms_theme') || 'night');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cms_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'night' ? 'light' : 'night'));
  return { theme, toggleTheme };
}

function Sidebar({ activeSection, setActiveSection }: { activeSection: string, setActiveSection: (key: string) => void }) {
  const icons: Record<string, JSX.Element> = {
    'global-settings': <Settings size={20} />,
    'header-config': <LayoutHeader size={20} />,
    'hero-config': <LayoutDashboard size={20} />,
    'footer-config': <LayoutPanelBottom size={20} />,
    'contact-form-config': <MessageSquare size={20} />,
    faq: <HelpCircle size={20} />, 
    gallery: <ImageIcon size={20} />, 
    'past-events': <Calendar size={20} />, 
    sponsors: <Star size={20} />, 
    stats: <BarChart2 size={20} />, 
    'upcoming-event': <Video size={20} />,
  };
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-gradient-to-b from-primary to-secondary text-base-100 shadow-lg z-40">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-base-200">
        <Home size={28} className="text-accent" />
        <span className="font-bold text-xl tracking-tight">BlockDays CMS</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {CONTENT_SECTIONS.map(section => (
          <button
            key={section.key}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all ${activeSection === section.key ? 'bg-base-100 text-primary font-bold shadow' : 'hover:bg-base-200/40'}`}
            onClick={() => setActiveSection(section.key)}
          >
            {icons[section.key]}
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-base-200 flex items-center gap-2">
        <User size={20} />
        <span className="text-sm">Admin</span>
      </div>
    </aside>
  );
}

function TopBar({ onHelp, theme, toggleTheme, onLogout }: { onHelp: () => void, theme: string, toggleTheme: () => void, onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-base-100/80 backdrop-blur px-6 py-3 shadow-sm border-b border-base-200">
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg text-primary">Admin Panel</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="btn btn-ghost btn-circle" onClick={toggleTheme} title="تغییر تم">
          {theme === 'night' ? '🌙' : '☀️'}
        </button>
        <button className="btn btn-ghost btn-circle" onClick={onHelp} title="راهنما">
          <Info size={20} />
        </button>
        <button className="btn btn-ghost btn-circle" title="خروج" onClick={onLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

function FloatingQuickNav({ activeSection, setActiveSection }: { activeSection: string, setActiveSection: (key: string) => void }) {
  const icons: Record<string, JSX.Element> = {
    'global-settings': <Settings size={18} />,
    'header-config': <LayoutHeader size={18} />,
    'hero-config': <LayoutDashboard size={18} />,
    'footer-config': <LayoutPanelBottom size={18} />,
    'contact-form-config': <MessageSquare size={18} />,
    faq: <HelpCircle size={18} />, 
    gallery: <ImageIcon size={18} />, 
    'past-events': <Calendar size={18} />, 
    sponsors: <Star size={18} />, 
    stats: <BarChart2 size={18} />, 
    'upcoming-event': <Video size={18} />
  };
  return (
    <div className="fixed top-1/2 left-4 -translate-y-1/2 z-50 flex flex-col gap-2">
      {CONTENT_SECTIONS.map(section => (
        <button
          key={section.key}
          className={`btn btn-xs btn-circle ${activeSection === section.key ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveSection(section.key)}
          title={section.label}
        >
          {icons[section.key]}
        </button>
      ))}
    </div>
  );
}

// --- ENHANCED HELP MODAL ---
function HelpModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-lg shadow-lg p-8 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
        <button className="btn btn-sm btn-circle absolute left-4 top-4" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-extrabold mb-6 text-primary">راهنمای پنل مدیریت محتوا</h2>
        <ol className="list-decimal list-inside space-y-6 text-right text-base">
          <li>
            <b>ورود به پنل:</b> 
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>آدرس سایت را با <span className="badge badge-outline badge-primary">/admin</span> در مرورگر باز کنید.</li>
              <li>رمز عبور توسط مدیر سایت از طریق تنظیمات محیطی (environment configuration) تعیین شده است. آن را برای ورود استفاده کنید.</li>
            </ul>
          </li>
          <li>
            <b>آشنایی با محیط پنل:</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li><b>منوی کناری (Sidebar):</b> برای انتخاب بخش‌های مختلف سایت جهت ویرایش محتوا مانند:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>تنظیمات عمومی (نام سایت، لوگو کلی، ایمیل تماس)</li>
                  <li>تنظیمات هدر (لینک‌های ناوبری)</li>
                  <li>بخش هیرو (عنوان اصلی، زیرنویس، دکمه‌های فراخوان)</li>
                  <li>تنظیمات فوتر (نام برند، توضیحات، خبرنامه، کپی‌رایت، لینک‌های اجتماعی)</li>
                  <li>تنظیمات فرم تماس (عناوین، برچسب‌ها، پیام‌ها)</li>
                  <li>سوالات متداول (FAQ)</li>
                  <li>گالری تصاویر</li>
                  <li>رویدادهای گذشته</li>
                  <li>حامیان</li>
                  <li>آمارها</li>
                  <li>رویداد آینده</li>
                </ul>
              </li>
              <li><b>نوار بالا (Top Bar):</b> شامل دکمه‌های تغییر تم (تاریک/روشن)، همین راهنما، و خروج از پنل.</li>
              <li><b>دکمه‌های ناوبری سریع (Floating Quick Nav):</b> آیکون‌های شناور برای دسترسی سریع به بخش‌های مختلف.</li>
            </ul>
          </li>
          <li>
            <b>ویرایش و ذخیره محتوا:</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>پس از انتخاب هر بخش، می‌توانید محتوای آن را ویرایش، حذف یا موارد جدید اضافه کنید.</li>
              <li>تغییرات شما به صورت پیش‌نویس در فرم‌ها نمایش داده می‌شود.</li>
              <li>برای اعمال نهایی تغییرات روی سایت، دکمه <span className="badge badge-success">ذخیره در سرور</span> را در هر بخش کلیک کنید. این کار محتوای سایت را مستقیماً به‌روزرسانی می‌کند.</li>
              <li>برخی بخش‌ها مانند "سوالات متداول" قابلیت <span className="badge badge-warning">برگشت (Undo)</span> و <span className="badge badge-warning">جلو (Redo)</span> برای تغییرات پیش‌نویس دارند.</li>
            </ul>
          </li>
           <li>
            <b>مدیریت تصاویر و فایل‌ها:</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>در بخش‌هایی مانند "تنظیمات عمومی" (برای لوگوی سایت)، "گالری" و "حامیان"، می‌توانید برای فیلدهای تصویر، آدرس URL یک تصویر موجود را وارد کنید.</li>
              <li>یا با استفاده از دکمه <span className="badge badge-outline">انتخاب فایل</span>، تصویر جدیدی را از کامپیوتر خود انتخاب کنید.</li>
              <li>پس از انتخاب فایل، یک مسیر پیش‌فرض نمایش داده می‌شود. با کلیک بر روی <span className="badge badge-success">ذخیره در سرور</span>، فایل (در آینده) آپلود شده و آدرس آن در اطلاعات ذخیره خواهد شد. (توجه: قابلیت آپلود واقعی فایل در حال حاضر در مرحله پیاده‌سازی است و صرفاً اطلاعات متنی ذخیره می‌شود).</li>
            </ul>
          </li>
          <li>
            <b>پشتیبان‌گیری و بازیابی (اختیاری):</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>دکمه <span className="badge badge-outline badge-secondary">خروجی JSON</span> در هر بخش به شما امکان می‌دهد یک نسخه پشتیبان محلی از اطلاعات آن بخش در قالب فایل JSON تهیه کنید.</li>
              <li>دکمه <span className="badge badge-primary">خروجی همه (ZIP)</span> در بالای صفحه، از تمام بخش‌های استاندارد (FAQ، گالری، رویدادها و...) یک فایل ZIP حاوی JSONهای مجزا تهیه می‌کند.</li>
              <li>با استفاده از <span className="badge badge-secondary">بازیابی همه (ZIP)</span> می‌توانید محتوای پشتیبان‌گرفته شده را به پنل بازگردانید. (توجه: این کار محتوای فعلی را با محتوای فایل جایگزین می‌کند).</li>
            </ul>
          </li>
          <li>
            <b>اعتبارسنجی و خطاها:</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>برخی فیلدها الزامی هستند (مثلاً عنوان در بیشتر بخش‌ها). اگر فیلدی ناقص باشد، معمولاً با رنگ قرمز یا پیامی مشخص می‌شود.</li>
              <li>دکمه <span className="badge badge-success">ذخیره در سرور</span> تا رفع خطاهای اعتبارسنجی غیرفعال خواهد بود.</li>
              <li>پیام‌های موفقیت یا خطا با استفاده از اعلان‌های Toast (پنجره‌های کوچک موقت) نمایش داده می‌شوند.</li>
            </ul>
          </li>
          <li>
            <b>سوالات متداول (در مورد پنل):</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li><b>چرا تغییرات روی سایت نمایش داده نمی‌شود؟</b> <br/> مطمئن شوید که پس از انجام تغییرات، دکمه <span className="badge badge-success">ذخیره در سرور</span> را در همان بخش کلیک کرده‌اید. سپس سایت اصلی را رفرش کنید.</li>
              <li><b>اگر اشتباهی در ویرایش محتوا رخ داد چه کنم؟</b> <br/> در بخش‌هایی که قابلیت Undo/Redo دارند، از آن استفاده کنید. در غیر این صورت، محتوا را به صورت دستی اصلاح و مجدداً ذخیره کنید. می‌توانید از فایل JSON پشتیبان (در صورت تهیه) برای بازگردانی استفاده کنید.</li>
              <li><b>چطور لوگو یا تصویر آیتم گالری را تغییر دهم؟</b> <br/> می‌توانید URL تصویر جدید را مستقیماً در فیلد متنی وارد کنید، یا با استفاده از دکمه "انتخاب فایل"، تصویر جدیدی آپلود کنید. پس از انتخاب فایل، نام آن نمایش داده می‌شود. با ذخیره تغییرات، این فایل برای نمایش در سایت استفاده خواهد شد.</li>
            </ul>
          </li>
        </ol>
        <div className="mt-8 text-xs text-base-content/60 border-t pt-4">در صورت نیاز به راهنمایی بیشتر، با پشتیبانی BlockDays تماس بگیرید.</div>
      </div>
    </div>
  );
}

function GuidedTour() {
  // Placeholder for a guided tour component
  return null;
}

function AdminCMS() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState(CONTENT_SECTIONS[0].key);
  const [importedData, setImportedData] = useState<Record<string, any> | null>(null);
  const { theme, toggleTheme } = useCMSTheme();
  const [helpOpen, setHelpOpen] = useState(false);

  const VITE_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAuthed(false);
    setPassword('');
  };

  useEffect(() => {
    const savedPasswordHash = localStorage.getItem(ADMIN_PASSWORD_KEY);
    // Check if a password is set in environment and if the saved hash matches the current password
    if (VITE_ADMIN_PASSWORD && savedPasswordHash === VITE_ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      // If env password changed or not set, force logout
      localStorage.removeItem(ADMIN_PASSWORD_KEY);
      setAuthed(false);
    }
  }, [VITE_ADMIN_PASSWORD]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!VITE_ADMIN_PASSWORD) {
      showToast('Admin password is not configured. Please check setup instructions.', 'error', 5000);
      return;
    }
    if (password === VITE_ADMIN_PASSWORD) {
      // Store the actual password for session persistence (can be improved with hashing later)
      localStorage.setItem(ADMIN_PASSWORD_KEY, password);
      setAuthed(true);
      showToast('Login successful!', 'success');
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  if (!authed) {
    const isPasswordConfigured = !!VITE_ADMIN_PASSWORD;
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <form onSubmit={handleLogin} className="card bg-base-100 p-8 shadow-xl w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
          {!isPasswordConfigured && (
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Admin password not set. Refer to <code>ADMIN_AUTH_SETUP.md</code>. Login is disabled.</span>
            </div>
          )}
          <input
            type="password"
            className="input input-bordered w-full mb-4"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={!isPasswordConfigured}
          />
          <button 
            className="btn btn-primary w-full" 
            type="submit"
            disabled={!isPasswordConfigured}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-base-200 via-base-100 to-base-300 relative">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <FloatingQuickNav activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar onHelp={() => setHelpOpen(true)} theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <GlobalImportExportBar onImport={setImportedData} />
          <h1 className="text-3xl font-extrabold mb-8 text-primary drop-shadow">{CONTENT_SECTIONS.find(s => s.key === activeSection)?.label}</h1>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 md:p-10 rounded-2xl shadow-xl border border-base-200">
            {activeSection === 'global-settings' && <GlobalSettingsEditor imported={importedData?.['global.json']} />}
            {activeSection === 'header-config' && <HeaderConfigEditor imported={importedData?.['header.json']} />}
            {activeSection === 'hero-config' && <HeroConfigEditor imported={importedData?.['hero.json']} />}
            {activeSection === 'footer-config' && <FooterConfigEditor imported={importedData?.['footer.json']} />}
            {activeSection === 'contact-form-config' && <ContactFormConfigEditor imported={importedData?.['contact-form.json']} />}
            {activeSection === 'faq' && <FAQEditor imported={importedData?.['faq.json']} />}
            {activeSection === 'gallery' && <GalleryEditor imported={importedData?.['gallery.json']} />}
            {activeSection === 'past-events' && <PastEventsEditor imported={importedData?.['past-events.json']} />}
            {activeSection === 'sponsors' && <SponsorsEditor imported={importedData?.['sponsors.json']} />}
            {activeSection === 'stats' && <StatsEditor imported={importedData?.['stats.json']} />}
            {activeSection === 'upcoming-event' && <UpcomingEventEditor imported={importedData?.['upcoming-event.json']} />}
          </div>
        </main>
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <GuidedTour />
    </div>
  );
}

export default AdminCMS; 
import React, { useState, useEffect } from 'react';
import { fetchContent } from '../utils/api';
// @ts-ignore
import JSZip from 'jszip';
import { Info, User, HelpCircle, LogOut, Home, Image as ImageIcon, Calendar, BarChart2, Star, Video } from 'lucide-react';

const CONTENT_SECTIONS = [
  { key: 'faq', label: 'FAQ' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'past-events', label: 'Past Events' },
  { key: 'sponsors', label: 'Sponsors' },
  { key: 'stats', label: 'Stats' },
  { key: 'upcoming-event', label: 'Upcoming Event' },
];

const ADMIN_PASSWORD_KEY = 'blockdays_admin_password';
// WARNING: This is a hardcoded default password for the experimental Admin CMS.
// It is NOT secure for production use. 
// If this CMS is ever exposed publicly, this password MUST be changed 
// and ideally replaced with a proper authentication mechanism.
const DEFAULT_PASSWORD = 'blockdays2024'; // Change this as needed

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  active?: boolean;
  tags?: string[];
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
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button className="btn btn-outline btn-sm" onClick={handleExport} disabled={!!error}>خروجی JSON</button>
        <button className={`btn btn-sm ${isPreview ? 'btn-info' : 'btn-ghost'}`} onClick={() => setIsPreview(p => !p)}>{isPreview ? 'بازگشت به ویرایش' : 'پیش‌نمایش'}</button>
        <button className="btn btn-sm btn-warning" onClick={undo} disabled={!canUndo}>برگشت</button>
        <button className="btn btn-sm btn-warning" onClick={redo} disabled={!canRedo}>جلو</button>
        <button className="btn btn-sm btn-secondary" onClick={handleReload} disabled={loading}>بارگذاری مجدد از سایت</button>
        {loading && <span className="loading loading-spinner loading-xs ml-2"></span>}
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
}

function GalleryEditor({ imported }: { imported: GalleryItem[] | null }) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [newItem, setNewItem] = useState<GalleryItem>({ id: '', title: '', description: '', date: '', category: '', type: 'image', url: '', thumbnail: '' });

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
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    const updated = [...galleryItems];
    updated[editIndex] = editItem;
    setGalleryItems(updated);
    setEditIndex(null);
    setEditItem(null);
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
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!newItem.title.trim() || !newItem.url.trim()) return;
    setGalleryItems([...galleryItems, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ id: '', title: '', description: '', date: '', category: '', type: 'image', url: '', thumbnail: '' });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(galleryItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gallery.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">گالری تصاویر و ویدیوها</h2>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>خروجی JSON</button>
      </div>
      <ul className="space-y-4 mb-8">
        {galleryItems.map((item, i) => (
          <li key={item.id} className="bg-base-200 p-4 rounded-lg">
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان" />
                <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="توضیحات" />
                <input className="input input-bordered w-full mb-2" name="date" value={editItem?.date || ''} onChange={handleEditChange} placeholder="تاریخ" />
                <input className="input input-bordered w-full mb-2" name="category" value={editItem?.category || ''} onChange={handleEditChange} placeholder="دسته‌بندی" />
                <select className="select select-bordered w-full mb-2" name="type" value={editItem?.type || 'image'} onChange={handleEditChange}>
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                </select>
                <input className="input input-bordered w-full mb-2" name="url" value={editItem?.url || ''} onChange={handleEditChange} placeholder="آدرس فایل (URL)" />
                <input className="input input-bordered w-full mb-2" name="thumbnail" value={editItem?.thumbnail || ''} onChange={handleEditChange} placeholder="آدرس بندانگشتی (thumbnail)" />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel}>انصراف</button>
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
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن مورد جدید</h3>
        <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان" />
        <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={newItem.description} onChange={handleAddChange} placeholder="توضیحات" />
        <input className="input input-bordered w-full mb-2" name="date" value={newItem.date} onChange={handleAddChange} placeholder="تاریخ" />
        <input className="input input-bordered w-full mb-2" name="category" value={newItem.category} onChange={handleAddChange} placeholder="دسته‌بندی" />
        <select className="select select-bordered w-full mb-2" name="type" value={newItem.type} onChange={handleAddChange}>
          <option value="image">تصویر</option>
          <option value="video">ویدیو</option>
        </select>
        <input className="input input-bordered w-full mb-2" name="url" value={newItem.url} onChange={handleAddChange} placeholder="آدرس فایل (URL)" />
        <input className="input input-bordered w-full mb-2" name="thumbnail" value={newItem.thumbnail} onChange={handleAddChange} placeholder="آدرس بندانگشتی (thumbnail)" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>افزودن</button>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<PastEvent | null>(null);
  const [newItem, setNewItem] = useState<PastEvent>({ id: '', title: '', description: '', date: '', category: 'meetup', image: '', youtubeLink: '' });

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
    if (!newItem.title.trim() || !newItem.date.trim()) return;
    setEvents([...events, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ id: '', title: '', description: '', date: '', category: 'meetup', image: '', youtubeLink: '' });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'past-events.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">رویدادهای گذشته</h2>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>خروجی JSON</button>
      </div>
      <ul className="space-y-4 mb-8">
        {events.map((item, i) => (
          <li key={item.id} className="bg-base-200 p-4 rounded-lg">
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان" />
                <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="توضیحات" />
                <input className="input input-bordered w-full mb-2" name="date" value={editItem?.date || ''} onChange={handleEditChange} placeholder="تاریخ" />
                <select className="select select-bordered w-full mb-2" name="category" value={editItem?.category || 'meetup'} onChange={handleEditChange}>
                  <option value="meetup">میتاپ</option>
                  <option value="conference">کنفرانس</option>
                  <option value="videocast">ویدیوکست</option>
                </select>
                <input className="input input-bordered w-full mb-2" name="image" value={editItem?.image || ''} onChange={handleEditChange} placeholder="آدرس تصویر (URL)" />
                <input className="input input-bordered w-full mb-2" name="youtubeLink" value={editItem?.youtubeLink || ''} onChange={handleEditChange} placeholder="لینک یوتیوب" />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel}>انصراف</button>
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
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن رویداد جدید</h3>
        <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان" />
        <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={newItem.description} onChange={handleAddChange} placeholder="توضیحات" />
        <input className="input input-bordered w-full mb-2" name="date" value={newItem.date} onChange={handleAddChange} placeholder="تاریخ" />
        <select className="select select-bordered w-full mb-2" name="category" value={newItem.category} onChange={handleAddChange}>
          <option value="meetup">میتاپ</option>
          <option value="conference">کنفرانس</option>
          <option value="videocast">ویدیوکست</option>
        </select>
        <input className="input input-bordered w-full mb-2" name="image" value={newItem.image} onChange={handleAddChange} placeholder="آدرس تصویر (URL)" />
        <input className="input input-bordered w-full mb-2" name="youtubeLink" value={newItem.youtubeLink} onChange={handleAddChange} placeholder="لینک یوتیوب" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>افزودن</button>
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
}

function SponsorsEditor({ imported }: { imported: Sponsor[] | null }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(imported || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Sponsor | null>(null);
  const [newItem, setNewItem] = useState<Sponsor>({ id: '', name: '', logo: '', type: 'financial', website: '' });

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
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    if (editIndex === null || !editItem) return;
    const updated = [...sponsors];
    updated[editIndex] = editItem;
    setSponsors(updated);
    setEditIndex(null);
    setEditItem(null);
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
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!newItem.name.trim() || !newItem.logo.trim()) return;
    setSponsors([...sponsors, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ id: '', name: '', logo: '', type: 'financial', website: '' });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(sponsors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sponsors.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">حامیان</h2>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>خروجی JSON</button>
      </div>
      <ul className="space-y-4 mb-8">
        {sponsors.map((item, i) => (
          <li key={item.id} className="bg-base-200 p-4 rounded-lg">
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="name" value={editItem?.name || ''} onChange={handleEditChange} placeholder="نام" />
                <input className="input input-bordered w-full mb-2" name="logo" value={editItem?.logo || ''} onChange={handleEditChange} placeholder="آدرس لوگو (URL)" />
                <select className="select select-bordered w-full mb-2" name="type" value={editItem?.type || 'financial'} onChange={handleEditChange}>
                  <option value="financial">مالی</option>
                  <option value="moral">معنوی</option>
                  <option value="media">رسانه‌ای</option>
                </select>
                <input className="input input-bordered w-full mb-2" name="website" value={editItem?.website || ''} onChange={handleEditChange} placeholder="وبسایت" />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel}>انصراف</button>
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
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">افزودن حامی جدید</h3>
        <input className="input input-bordered w-full mb-2" name="name" value={newItem.name} onChange={handleAddChange} placeholder="نام" />
        <input className="input input-bordered w-full mb-2" name="logo" value={newItem.logo} onChange={handleAddChange} placeholder="آدرس لوگو (URL)" />
        <select className="select select-bordered w-full mb-2" name="type" value={newItem.type} onChange={handleAddChange}>
          <option value="financial">مالی</option>
          <option value="moral">معنوی</option>
          <option value="media">رسانه‌ای</option>
        </select>
        <input className="input input-bordered w-full mb-2" name="website" value={newItem.website} onChange={handleAddChange} placeholder="وبسایت" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>افزودن</button>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Stat | null>(null);
  const [newItem, setNewItem] = useState<Stat>({ icon: '', title: '', value: 0, tooltip: '' });

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
    if (!newItem.title.trim()) return;
    setStats([...stats, { ...newItem }]);
    setNewItem({ icon: '', title: '', value: 0, tooltip: '' });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stats.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">آمار</h2>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>خروجی JSON</button>
      </div>
      <ul className="space-y-4 mb-8">
        {stats.map((item, i) => (
          <li key={i} className="bg-base-200 p-4 rounded-lg">
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="icon" value={editItem?.icon || ''} onChange={handleEditChange} placeholder="آیکون" />
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان" />
                <input className="input input-bordered w-full mb-2" name="value" type="number" value={editItem?.value || 0} onChange={handleEditChange} placeholder="مقدار" />
                <input className="input input-bordered w-full mb-2" name="tooltip" value={editItem?.tooltip || ''} onChange={handleEditChange} placeholder="توضیح (Tooltip)" />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel}>انصراف</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{item.title}</div>
                <div className="mb-2">مقدار: {item.value}</div>
                <div className="mb-2 text-xs opacity-70">آیکون: {item.icon}</div>
                <div className="mb-2 text-xs opacity-70">{item.tooltip}</div>
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
        <h3 className="font-bold mb-2">افزودن آمار جدید</h3>
        <input className="input input-bordered w-full mb-2" name="icon" value={newItem.icon} onChange={handleAddChange} placeholder="آیکون" />
        <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان" />
        <input className="input input-bordered w-full mb-2" name="value" type="number" value={newItem.value} onChange={handleAddChange} placeholder="مقدار" />
        <input className="input input-bordered w-full mb-2" name="tooltip" value={newItem.tooltip} onChange={handleAddChange} placeholder="توضیح (Tooltip)" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>افزودن</button>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
    if (!newItem.title.trim() || !newItem.date.trim()) return;
    if (events.length >= 3) return;
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
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upcoming-event.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">رویدادهای آینده (حداکثر ۳ رویداد)</h2>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>خروجی JSON</button>
      </div>
      <ul className="space-y-4 mb-8">
        {events.map((item, i) => (
          <li key={i} className="bg-base-200 p-4 rounded-lg">
            {editIndex === i ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full mb-2" name="title" value={editItem?.title || ''} onChange={handleEditChange} placeholder="عنوان" />
                <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="توضیحات" />
                <input className="input input-bordered w-full mb-2" name="date" value={editItem?.date || ''} onChange={handleEditChange} placeholder="تاریخ" />
                <input className="input input-bordered w-full mb-2" name="registerLink" value={editItem?.registerLink || ''} onChange={handleEditChange} placeholder="لینک ثبت‌نام" />
                <input className="input input-bordered w-full mb-2" name="detailsLink" value={editItem?.detailsLink || ''} onChange={handleEditChange} placeholder="لینک جزئیات" />
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
                  <button className="btn btn-primary btn-sm" onClick={handleEditSave}>ذخیره</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditCancel}>انصراف</button>
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
                  <button className="btn btn-outline btn-xs" onClick={() => handleEdit(i)}>ویرایش</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(i)}>حذف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {events.length < 3 && (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">افزودن رویداد جدید</h3>
          <input className="input input-bordered w-full mb-2" name="title" value={newItem.title} onChange={handleAddChange} placeholder="عنوان" />
          <textarea className="textarea textarea-bordered w-full mb-2" name="description" value={newItem.description} onChange={handleAddChange} placeholder="توضیحات" />
          <input className="input input-bordered w-full mb-2" name="date" value={newItem.date} onChange={handleAddChange} placeholder="تاریخ" />
          <input className="input input-bordered w-full mb-2" name="registerLink" value={newItem.registerLink} onChange={handleAddChange} placeholder="لینک ثبت‌نام" />
          <input className="input input-bordered w-full mb-2" name="detailsLink" value={newItem.detailsLink} onChange={handleAddChange} placeholder="لینک جزئیات" />
          <input className="input input-bordered w-full mb-2" name="youtubeLink" value={newItem.youtubeLink} onChange={handleAddChange} placeholder="لینک یوتیوب (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="aparatLink" value={newItem.aparatLink} onChange={handleAddChange} placeholder="لینک آپارات (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="instagramLink" value={newItem.instagramLink} onChange={handleAddChange} placeholder="لینک اینستاگرام (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="infoLink" value={newItem.infoLink} onChange={handleAddChange} placeholder="لینک اطلاعات (اختیاری)" />
          <input className="input input-bordered w-full mb-2" name="tags" value={newItem.tags?.join(', ') || ''} onChange={handleAddChange} placeholder="برچسب‌ها (با ویرگول جدا کنید)" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" checked={!!newItem.active} onChange={handleAddChange} />
            <span>فعال باشد</span>
          </label>
          <button className="btn btn-primary btn-sm mt-2" onClick={handleAdd}>افزودن</button>
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
    faq: <HelpCircle size={20} />, gallery: <ImageIcon size={20} />, 'past-events': <Calendar size={20} />, sponsors: <Star size={20} />, stats: <BarChart2 size={20} />, 'upcoming-event': <Video size={20} />,
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
    faq: <HelpCircle size={18} />, gallery: <ImageIcon size={18} />, 'past-events': <Calendar size={18} />, sponsors: <Star size={18} />, stats: <BarChart2 size={18} />, 'upcoming-event': <Video size={18} />
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
        <h2 className="text-2xl font-extrabold mb-4 text-primary">راهنمای کامل مدیریت سایت</h2>
        <ol className="list-decimal list-inside space-y-4 text-right text-base">
          <li>
            <b>ورود به پنل مدیریت:</b> آدرس سایت را با <span className="badge badge-primary">/admin</span> باز کنید. رمز عبور پیش‌فرض <span className="badge badge-secondary">blockdays2024</span> است.
          </li>
          <li>
            <b>آشنایی با محیط:</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>منوی کناری: انتخاب بخش برای ویرایش (سوالات، گالری، رویدادها و ...)</li>
              <li>نوار بالا: تغییر تم، راهنما، خروج</li>
              <li>دکمه‌های سریع: پرش به هر بخش</li>
              <li>کارت هر بخش: ویرایش، افزودن، حذف، پیش‌نمایش و خروجی گرفتن</li>
            </ul>
          </li>
          <li>
            <b>ویرایش محتوا:</b> هر بخش (مثلاً سوالات متداول) را انتخاب کنید. موارد را ویرایش، حذف یا مورد جدید اضافه کنید. تغییرات به صورت <b>پیش‌نویس</b> ذخیره می‌شود و تا زمانی که خروجی نگیرید، روی سایت اعمال نمی‌شود.
          </li>
          <li>
            <b>پیش‌نمایش و خروجی:</b> پس از ویرایش، با دکمه <span className="badge badge-info">پیش‌نمایش</span> نتیجه را ببینید. با <span className="badge badge-success">خروجی JSON</span> فایل را دانلود و در پوشه <span className="badge badge-accent">public/content</span> جایگزین کنید.
          </li>
          <li>
            <b>بازگردانی (Undo/Redo):</b> با دکمه‌های <span className="badge badge-warning">برگشت</span> و <span className="badge badge-warning">جلو</span> تغییرات را به عقب یا جلو ببرید.
          </li>
          <li>
            <b>پشتیبان‌گیری و بازیابی:</b> با <span className="badge badge-primary">خروجی همه (ZIP)</span> از کل محتوا نسخه پشتیبان بگیرید یا با <span className="badge badge-secondary">بازیابی همه (ZIP)</span> محتوا را بازگردانید.
          </li>
          <li>
            <b>آپلود تصویر/ویدیو:</b> در بخش گالری و رویدادها، می‌توانید فایل را بکشید یا انتخاب کنید. فایل به صورت base64 یا آدرس در پروژه ذخیره می‌شود.
          </li>
          <li>
            <b>اعتبارسنجی و خطاها:</b> اگر فیلدی ناقص باشد، با رنگ قرمز و پیام هشدار نمایش داده می‌شود. تا رفع خطا نمی‌توانید خروجی بگیرید.
          </li>
          <li>
            <b>دسترسی و امنیت:</b> رمز عبور را تغییر دهید و فقط به افراد مطمئن بدهید. فایل‌های خروجی را فقط در پروژه خود جایگزین کنید.
          </li>
          <li>
            <b>سوالات متداول:</b>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
              <li>چرا تغییرات روی سایت نمایش داده نمی‌شود؟ <br /> باید فایل خروجی را جایگزین کنید و سایت را رفرش کنید.</li>
              <li>چطور فایل را جایگزین کنم؟ <br /> فایل خروجی را در پوشه <span className="badge badge-accent">public/content</span> کپی و جایگزین کنید.</li>
              <li>اگر اشتباه کردم چه کنم؟ <br /> از قابلیت بازگردانی یا بازیابی نسخه پشتیبان استفاده کنید.</li>
              <li>چطور تصویر/ویدیو اضافه کنم؟ <br /> فایل را آپلود یا آدرس‌دهی کنید. برای بهترین نتیجه، فایل را در پوشه <span className="badge badge-accent">public/images</span> یا <span className="badge badge-accent">public/videos</span> قرار دهید.</li>
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

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAuthed(false);
    // Optionally, clear the password input field as well
    setPassword(''); 
  };

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (saved === DEFAULT_PASSWORD) setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEFAULT_PASSWORD) {
      localStorage.setItem(ADMIN_PASSWORD_KEY, password);
      setAuthed(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <form onSubmit={handleLogin} className="card bg-base-100 p-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <input
            type="password"
            className="input input-bordered w-full mb-4"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="btn btn-primary w-full" type="submit">Login</button>
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
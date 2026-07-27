"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authApi, getRegistrationStatus } from "@/app/api/authApi";
import {
  User,
  Briefcase,
  Wrench,
  ImageIcon,
  Camera,
  Upload,
  CheckCircle,
  FileText,
  X,
  Plus,
  AlertCircle,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const ThemeSwal = Swal.mixin({
  buttonsStyling: false,
  width: '22em',
  customClass: {
    popup: 'rounded-3xl border border-[#E8E8E8] shadow-2xl bg-white p-6',
    title: 'text-[1.25rem] font-bold text-[#1C2C1C] mt-1',
    htmlContainer: 'text-[13px] text-gray-500 font-medium mt-1',
    actions: 'mt-6',
    confirmButton: 'px-12 py-3 rounded-xl bg-[#1C2C1C] hover:bg-[#2c3e2c] text-white text-[14px] font-bold transition-colors',
  }
});

// ─── ChevronDown Icon ─────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg
    className="w-4 h-4 pointer-events-none"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface CategoryGroup {
  id: string; // unique local ID for the UI
  categoryId: string;
  selectedSkillServices: string[];
  selectedSubCategories: string[];
  isCollapsed?: boolean;
}

// ─── MultiSelect Component ───────────────────────────────────────────────────
interface MultiSelectProps {
  options: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

const MultiSelect = ({
  options,
  selectedIds,
  onChange,
  placeholder,
  disabled = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels = options.filter((opt) => selectedIds.includes(opt.id));

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full rounded-lg border bg-white px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-all border-[#E0E0E0] ${isOpen ? "border-[#6E9625] ring-2 ring-[#6E9625]/40" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-gray-400"}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 max-h-[100px] overflow-y-auto">
          {selectedLabels.length === 0 ? (
            <span className="text-[13px] text-gray-400 font-medium select-none">
              {placeholder}
            </span>
          ) : (
            selectedLabels.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 bg-[#6E9625]/10 border border-[#6E9625]/20 text-[#1C2C1C] text-[12px] font-semibold px-2 py-0.5 rounded-md"
              >
                <span>{item.name}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removeOption(item.id, e)}
                    className="hover:text-red-500 rounded-full focus:outline-none ml-0.5"
                  >
                    &times;
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
          {selectedIds.length > 0 && (
            <span className="text-[10px] font-bold bg-[#6E9625] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {selectedIds.length}
            </span>
          )}
          <ChevronDown />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[240px] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full h-8 px-3 text-[12px] rounded-lg border border-gray-200 outline-none focus:border-[#6E9625]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-[12px] text-center text-gray-400">
                {options.length === 0 ? "No options available" : "No results found"}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${isSelected
                      ? "bg-[#6E9625]/10 text-[#1C2C1C] font-semibold"
                      : "text-[#1C2C1C]/80 hover:bg-gray-100"
                      }`}
                  >
                    <span>{opt.name}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                        ? "bg-[#6E9625] border-[#6E9625] text-white"
                        : "border-gray-300 bg-white"
                        }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────── types ─────────────────────────────────── */
interface PersonalForm {
  fullName: string;
  email: string;
  phone: string;
  professionalTitle: string;
  workLocation: string;
  workRadius: string | number;
  bio: string;
  profileImage: string | null;
}

interface BusinessForm {
  companyName: string;
  companyType: string;
  niNumber: string;
  primarySkills: string;
  planName: string;
}

const COMPANY_TYPES = [
  "Sole Trader",
  "Limited Company",
  "Partnership",
  "LLP",
  "Other",
];

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "business", label: "Business Details", icon: Briefcase },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─────────────────────────────────── component ─────────────────────────────── */
export default function TraderProfilePage() {
  const router = useRouter();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const insInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [traderStatus, setTraderStatus] = useState("PENDING");

  /* profile photo */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);

  /* proof of identity */
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);

  /* logo */
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  /* portfolio */
  const [existingPortfolio, setExistingPortfolio] = useState<any[]>([]);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  /* certificates */
  const [existingCertificates, setExistingCertificates] = useState<any[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([]);
  const [isCertDragging, setIsCertDragging] = useState(false);

  /* insurance */
  const [existingInsurance, setExistingInsurance] = useState<any[]>([]);
  const [insuranceFiles, setInsuranceFiles] = useState<File[]>([]);
  const [insurancePreviews, setInsurancePreviews] = useState<string[]>([]);
  const [isInsDragging, setIsInsDragging] = useState(false);

  /* forms */
  const [personalForm, setPersonalForm] = useState<PersonalForm>({
    fullName: "",
    email: "",
    phone: "",
    professionalTitle: "",
    workLocation: "",
    workRadius: "",
    bio: "",
    profileImage: null,
  });

  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    companyName: "",
    companyType: "",
    niNumber: "",
    primarySkills: "",
    planName: "",
  });


  const [tradeCategories, setTradeCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [initialCategoryGroups, setInitialCategoryGroups] = useState<CategoryGroup[]>([]);
  const [skillServicesMap, setSkillServicesMap] = useState<Record<string, { id: string; name: string }[]>>({});
  const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, { id: string; name: string }[]>>({});

  const [maxTrades, setMaxTrades] = useState<number>(1);
  const [unlimitedTrades, setUnlimitedTrades] = useState<boolean>(false);
  /* ── load profile ── */
  useEffect(() => {
    async function load() {
      try {
        const res = await authApi.getMyProfile();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = (res?.data || res) as any;
        const tp = p?.traderProfile || {};

        setPersonalForm({
          fullName: p?.fullName || "",
          email: p?.email || "",
          phone: p?.phone || tp?.phone || "",
          professionalTitle: tp?.professionalTitle || tp?.title || "",
          workLocation: tp?.location || tp?.workLocation || p?.city || "",
          workRadius: tp?.workRadius ?? "",
          bio: tp?.about || tp?.bio || tp?.description || "",
          profileImage: p?.profileImage || p?.avatar || tp?.logo || null,
        });

        setBusinessForm({
          companyName: tp?.companyName || tp?.businessName || "",
          companyType: tp?.companyType || "",
          niNumber: tp?.registrationNumber || tp?.niNumber || "",
          primarySkills: tp?.primarySkills || tp?.skills || "",
          planName: tp?.subscription?.plan?.name || tp?.subscriptionTier || "",
        });

        // Parse category details from backend
        const cDetails = tp?.categoryDetails || [];
        const sDetails = tp?.skillServiceDetails || [];
        const subDetails = tp?.subCategoryDetails || [];

        const groups: CategoryGroup[] = cDetails.map((c: any) => {
          const catSkills = sDetails.filter((s: any) => s.categoryId === c.id).map((s: any) => s.id);
          // A sub-category belongs to a skill service. We find all sub-categories whose skillServiceId is in our catSkills.
          const catSubs = subDetails.filter((sub: any) => catSkills.includes(sub.skillServiceId)).map((sub: any) => sub.id);
          return {
            id: c.id,
            categoryId: c.id,
            selectedSkillServices: catSkills,
            selectedSubCategories: catSubs,
            isCollapsed: true
          };
        });
        setCategoryGroups(groups);
        setInitialCategoryGroups(JSON.parse(JSON.stringify(groups)));

        // Pre-populate maps for existing selections so UI renders correctly
        const sMap: Record<string, any[]> = {};
        sDetails.forEach((s: any) => {
          if (!sMap[s.categoryId]) sMap[s.categoryId] = [];
          sMap[s.categoryId].push({ id: s.id, name: s.name });
        });
        setSkillServicesMap(sMap);

        const subMap: Record<string, any[]> = {};
        subDetails.forEach((sub: any) => {
          if (!subMap[sub.skillServiceId]) subMap[sub.skillServiceId] = [];
          subMap[sub.skillServiceId].push({ id: sub.id, name: sub.name });
        });

        // Convert skillServiceId-based map to generic ID-based map for UI compatibility
        // In the UI we lookup subcategories by skillServiceId
        setSubCategoriesMap(subMap);

        // Subscription limits
        const plan = tp?.subscription?.plan;
        if (plan) {
          setMaxTrades(plan.maxTrades || 1);
          setUnlimitedTrades(plan.unlimitedTrades || false);
        }

        const categories = await authApi.getCategories();

        setTradeCategories(
          Array.isArray(categories)
            ? categories
            : categories?.data || []
        );

        const regRes = await getRegistrationStatus();
        const unwrappedReg = regRes?.data || regRes;
        setTraderStatus(unwrappedReg?.verificationStatus ?? unwrappedReg?.status ?? "PENDING");



        // Helper to build absolute URLs, avoiding duplicate slashes
        const getFullUrl = (url: string) => {
          if (/^https?:\/\//i.test(url)) return url;
          const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
          const path = url.replace(/^\/+/, "");
          return `${base}/${path}`;
        };

        const avatar = p?.profileImage || p?.avatar || tp?.logo;

        const imageUrl = avatar
          ? avatar.startsWith("http")
            ? avatar
            : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")}/${avatar.replace(/^\/+/, "")}`
          : null;

        console.log("Profile Image URL:", imageUrl);

        setPreviewUrl(imageUrl);

        const logo = tp?.logo || tp?.profileImage;
        if (logo) setLogoPreview(getFullUrl(logo));

        // Load existing portfolio items
        const portfolio = tp?.portfolioItems || tp?.portfolio || [];
        setExistingPortfolio(portfolio);
        const pPreviews = portfolio.map((item: any) => {
          let url = typeof item === 'object' ? item.url || item.path || item.fileUrl : item;
          return url ? getFullUrl(url) : null;
        }).filter(Boolean);
        setPortfolioPreviews(pPreviews);

        // Load existing certificates
        const certs = tp?.certificates || [];
        setExistingCertificates(certs);
        const cPreviews = certs.map((item: any) => {
          let url = typeof item === 'object' ? item.url || item.path || item.fileUrl : item;
          return url ? getFullUrl(url) : null;
        }).filter(Boolean);
        setCertificatePreviews(cPreviews);

        // Load existing insurance
        const ins = tp?.insuranceDocuments || [];
        setExistingInsurance(ins);
        const iPreviews = ins.map((item: any) => {
          let url = typeof item === 'object' ? item.url || item.path || item.fileUrl : item;
          return url ? getFullUrl(url) : null;
        }).filter(Boolean);
        setInsurancePreviews(iPreviews);

      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);




  /* ── handlers: personal ── */
  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let { name, value } = e.target;
    if (name === "phone") {
      // Allow +, digits, spaces, and dashes for international numbers
      value = value.replace(/[^\d+\s-]/g, "");
      if (value.length > 20) return;
    }
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Update personal details profile image
    setSelectedProfileFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Sync with Business Profile / Logo
    setLogoFile(file);
    setLogoPreview(objectUrl);
  };

  const handleRemovePhoto = () => {
    setSelectedProfileFile(null);
    setPreviewUrl(null);
    setPersonalForm((prev) => ({ ...prev, profileImage: null }));
    if (profileInputRef.current) profileInputRef.current.value = "";
    
    // Sync with Business Profile / Logo
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  /* ── handlers: proof of identity ── */
  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIdFileName(file.name);
  };

  /* ── handlers: logo ── */
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  /* ── handlers: portfolio ── */
  const addPortfolioFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPortfolioFiles((prev) => [...prev, ...arr]);
    setPortfolioPreviews((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addPortfolioFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addPortfolioFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const removePortfolioItem = (index: number) => {
    setPortfolioPreviews((prev) => prev.filter((_, i) => i !== index));
    
    if (index < existingPortfolio.length) {
      // Removed an existing item
      setExistingPortfolio((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removed a newly added file
      const fileIndex = index - existingPortfolio.length;
      setPortfolioFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  /* ── handlers: certificates ── */
  const addCertificateFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type === "application/pdf");
    setCertificateFiles((prev) => [...prev, ...arr]);
    setCertificatePreviews((prev) => [
      ...prev,
      ...arr.map((f) => f.type === "application/pdf" ? "/placeholder.png" : URL.createObjectURL(f)),
    ]);
  };

  const handleCertificateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addCertificateFiles(e.target.files);
  };

  const handleCertDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsCertDragging(false);
    if (e.dataTransfer.files) addCertificateFiles(e.dataTransfer.files);
  }, []);

  const handleCertDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsCertDragging(true);
  };

  const handleCertDragLeave = () => setIsCertDragging(false);

  const removeCertificateItem = (index: number) => {
    setCertificatePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index < existingCertificates.length) {
      setExistingCertificates((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingCertificates.length;
      setCertificateFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  /* ── handlers: insurance ── */
  const addInsuranceFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type === "application/pdf");
    setInsuranceFiles((prev) => [...prev, ...arr]);
    setInsurancePreviews((prev) => [
      ...prev,
      ...arr.map((f) => f.type === "application/pdf" ? "/placeholder.png" : URL.createObjectURL(f)),
    ]);
  };

  const handleInsuranceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addInsuranceFiles(e.target.files);
  };

  const handleInsDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsInsDragging(false);
    if (e.dataTransfer.files) addInsuranceFiles(e.dataTransfer.files);
  }, []);

  const handleInsDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsInsDragging(true);
  };

  const handleInsDragLeave = () => setIsInsDragging(false);

  const removeInsuranceItem = (index: number) => {
    setInsurancePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index < existingInsurance.length) {
      setExistingInsurance((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingInsurance.length;
      setInsuranceFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  /* ── handlers: business ── */
  const handleBusinessChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBusinessForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryGroupChange = (groupId: string, field: keyof CategoryGroup, value: any) => {
    setCategoryGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;

      if (field === 'categoryId') {
        const newCatId = value as string;
        if (!skillServicesMap[newCatId]) {
          authApi.getSkillServices(newCatId).then(res => {
            setSkillServicesMap(m => ({ ...m, [newCatId]: Array.isArray(res) ? res : res?.data || [] }));
          });
        }
        return { ...g, categoryId: newCatId, selectedSkillServices: [], selectedSubCategories: [] };
      }

      if (field === 'selectedSkillServices') {
        const newSkills = value as string[];
        newSkills.forEach(skillId => {
          if (!subCategoriesMap[skillId]) {
            authApi.getSubCategories(skillId).then(res => {
              setSubCategoriesMap(m => ({ ...m, [skillId]: Array.isArray(res) ? res : res?.data || [] }));
            });
          }
        });
        // We just clear subcategories when skills change to enforce re-selection and avoid orphaned subcategories
        return { ...g, selectedSkillServices: newSkills, selectedSubCategories: [] };
      }

      return { ...g, [field]: value };
    }));
  };

  const addCategoryGroup = () => {
    setCategoryGroups(prev => [
      ...prev.map(g => ({ ...g, isCollapsed: true })),
      {
        id: Date.now().toString() + Math.random().toString(),
        categoryId: "",
        selectedSkillServices: [],
        selectedSubCategories: [],
        isCollapsed: false
      }
    ]);
  };

  const removeCategoryGroup = (groupId: string) => {
    setCategoryGroups(prev => prev.filter(g => g.id !== groupId));
  };

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personalForm.fullName.trim()) { ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Full Name is required.' }); return; }

    if (!personalForm.email.trim()) { ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Email is required.' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalForm.email.trim())) {
      ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Please enter a valid email address.' }); return;
    }

    if (!personalForm.phone || !personalForm.phone.trim()) {
      ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Phone number is required.' }); return;
    }
    // Allow optional +, spaces, dashes, and 9-15 digits
    const phoneRegex = /^\+?[\d\s\-]{9,15}$/;
    if (!phoneRegex.test(personalForm.phone)) {
      ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Please enter a valid phone number (e.g. +351 912 345 678).' }); return;
    }

    if (!businessForm.companyName.trim()) { ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Company Name is required.' }); return; }
    if (!businessForm.companyType.trim()) { ThemeSwal.fire({ icon: 'warning', iconColor: '#F59E0B', title: 'Validation Error', text: 'Company Type is required.' }); return; }



    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullName", personalForm.fullName);
      fd.append("email", personalForm.email);
      fd.append("phone", personalForm.phone);
      // professionalTitle, workLocation, and bio are mapped to location and about fields
      // optional geographic fields – send empty if not applicable
      fd.append("latitude", "22.5530");
      fd.append("longitude", "75.7569");
      fd.append("companyName", businessForm.companyName);
      fd.append("companyType", businessForm.companyType);
      fd.append("registrationNumber", businessForm.niNumber);

      const normalizeGroups = (groups: CategoryGroup[]) => {
        return groups
          .filter(g => g.categoryId && g.selectedSkillServices.length > 0 && g.selectedSubCategories.length > 0)
          .map(g => ({
            categoryId: g.categoryId,
            selectedSkillServices: [...g.selectedSkillServices].sort(),
            selectedSubCategories: [...g.selectedSubCategories].sort()
          }))
          .sort((a, b) => a.categoryId.localeCompare(b.categoryId));
      };

      const categoriesChanged = JSON.stringify(normalizeGroups(categoryGroups)) !== JSON.stringify(normalizeGroups(initialCategoryGroups));

      if (traderStatus !== "MANUAL_CHECK" && categoriesChanged) {
        const validGroups = categoryGroups.filter(g => g.categoryId && g.selectedSkillServices.length > 0 && g.selectedSubCategories.length > 0);

        const tradeCategories = validGroups.map(g => g.categoryId);
        const skillServiceIds = validGroups.flatMap(g => g.selectedSkillServices);
        const subCategoryIds = validGroups.flatMap(g => g.selectedSubCategories);

        if (tradeCategories.length > 0) {
          fd.append("tradeCategories", JSON.stringify(tradeCategories));
        }
        if (skillServiceIds.length > 0) {
          fd.append("skillsServices", JSON.stringify(skillServiceIds));
        }
        if (subCategoryIds.length > 0) {
          fd.append("subCategories", JSON.stringify(subCategoryIds));
        }
      }

      const numericRadius = Number(personalForm.workRadius);
      if (!isNaN(numericRadius) && numericRadius >= 1) {
        fd.append("workRadius", String(numericRadius));
      }
      fd.append("location", personalForm.workLocation);
      fd.append("about", personalForm.bio);

      if (selectedProfileFile) fd.append("profileImage", selectedProfileFile);
      if (idFile) fd.append("document", idFile);
      if (logoFile) fd.append("logo", logoFile);
      // portfolio files are sent to a separate endpoint

      const updateRes = await authApi.updateProfile(fd);

      // --- NEW: Update Assets ---
      if (traderStatus !== "MANUAL_CHECK") {
        const assetsFd = new FormData();
        assetsFd.append("aboutUs", personalForm.bio || " ");
        
        if (portfolioFiles && portfolioFiles.length > 0) {
          portfolioFiles.forEach((file) => {
            assetsFd.append("portfolioImages", file);
          });
        }

        if (certificateFiles && certificateFiles.length > 0) {
          certificateFiles.forEach((file) => {
            assetsFd.append("certificates", file);
          });
        }

        if (insuranceFiles && insuranceFiles.length > 0) {
          insuranceFiles.forEach((file) => {
            assetsFd.append("insuranceDocuments", file);
          });
        }
        
        await authApi.updateTraderAssets(assetsFd);
      }
      // --------------------------

      const backendMessage = updateRes?.message;
      const finalMessage = categoriesChanged 
        ? "Profile updated successfully! Your category changes are pending approval." 
        : (backendMessage || "Profile updated successfully!");

      ThemeSwal.fire({ 
        icon: categoriesChanged ? 'info' : 'success', 
        iconColor: '#6E9625', 
        title: categoriesChanged ? 'Notice' : 'Success', 
        text: finalMessage 
      });

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("mode") === "update") {
        router.push("/auth/trader-signup/step-3");
      }
    } catch (err: any) {
      console.error("Update profile error", err);

      const errorMessage = err?.response?.data?.message || "Failed to update profile";
      // If it's a specific logic error, we use a softer icon. Otherwise standard error.
      const isLogicError = errorMessage.toLowerCase().includes("pending");

      ThemeSwal.fire({
        icon: isLogicError ? 'info' : 'error',
        iconColor: isLogicError ? '#6E9625' : '#EF4444',
        title: isLogicError ? 'Notice' : 'Error',
        text: errorMessage,
        confirmButtonText: 'Okay'
      });
    } finally {
      setSaving(false);
    }
  };

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EDE8] p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white animate-pulse border border-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────── render ───────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F0EDE8]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-[1.75rem] font-bold text-[#1C2C1C] leading-tight">
            Profile Management
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage how your professional identity appears to clients.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-6 items-start">

            {/* ── Left sidebar ── */}
            <div className="w-48 flex-shrink-0 space-y-1">
              {TABS.filter(tab => tab.id !== "portfolio" || businessForm.planName).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${activeTab === id
                    ? "bg-[#1C2C1C] text-white shadow-sm"
                    : "text-[#1C2C1C]/60 hover:bg-white hover:text-[#1C2C1C]"
                    }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Right content ── */}
            <div className="flex-1 space-y-5">

              {/* ════ PERSONAL INFO ════ */}
              {activeTab === "personal" && (
                <>
                  {/* Profile photo card */}
                  <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-5">
                    <div className="flex items-center gap-5">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-[#E8E8E8]">
                          {previewUrl ? (
                            <img
                              src={previewUrl || "/customerNavLogo.png"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log("Profile image failed:", e.currentTarget.src);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <User size={32} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => profileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#1C2C1C] flex items-center justify-center border-2 border-white hover:bg-[#2c3e2c] transition-colors"
                        >
                          <Camera size={11} className="text-white" />
                        </button>
                      </div>

                      {/* Buttons */}
                      <div>
                        <p className="text-[14px] font-bold text-[#1C2C1C] mb-0.5">
                          Profile Photo
                        </p>
                        <p className="text-[12px] text-gray-400 mb-3">
                          Upload a professional photo for better visibility.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => profileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C2C1C] text-white rounded-lg text-[12px] font-semibold hover:bg-[#2c3e2c] transition-colors"
                          >
                            <Upload size={12} />
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileFileSelect}
                      />
                    </div>
                  </div>

                  {/* Personal details card */}
                  <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-6">
                    <h2 className="text-[14px] font-bold text-[#1C2C1C] mb-5">
                      Personal Details
                    </h2>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Full Name
                        </label>
                        <input
                          id="tp-fullName"
                          type="text"
                          name="fullName"
                          value={personalForm.fullName}
                          onChange={handlePersonalChange}
                          placeholder="Ricardo Santos"
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                        />
                      </div>

                      {/* Professional Title */}
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Professional Title
                        </label>
                        <input
                          id="tp-professionalTitle"
                          type="text"
                          name="professionalTitle"
                          value={personalForm.professionalTitle}
                          onChange={handlePersonalChange}
                          placeholder="Senior Electrical Engineer"
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="tp-phone"
                          type="text"
                          name="phone"
                          value={personalForm.phone}
                          onChange={handlePersonalChange}
                          placeholder="+351 912 345 678"
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                        />
                      </div>

                      {/* Work Location */}
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Work Location
                        </label>
                        <input
                          id="tp-workLocation"
                          type="text"
                          name="workLocation"
                          value={personalForm.workLocation}
                          onChange={handlePersonalChange}
                          placeholder="Cascais, Portugal"
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                        />
                      </div>

                      {/* Work Radius */}
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Work Radius (miles)
                        </label>
                        <input
                          id="tp-workRadius"
                          type="number"
                          name="workRadius"
                          value={personalForm.workRadius}
                          onChange={handlePersonalChange}
                          placeholder="e.g. 50"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Email
                        </label>
                        <input
                          id="tp-email"
                          type="email"
                          name="email"
                          value={personalForm.email}
                          onChange={handlePersonalChange}
                          placeholder="your.email@example.com"
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                        />
                      </div>

                      {/* About Us */}
                      <div className="col-span-2">
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          About Us
                        </label>
                        <textarea
                          id="tp-bio"
                          name="bio"
                          value={personalForm.bio}
                          onChange={handlePersonalChange}
                          rows={3}
                          placeholder="Over 10 years of experience in residential and commercial systems..."
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identity & Logo uploads */}
                  <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-6">
                    <div className={`grid gap-5 ${traderStatus === "APPROVED" ? "grid-cols-1" : "grid-cols-2"}`}>

                      {/* Proof of Identity */}
                      {traderStatus !== "APPROVED" && (
                        <div className="border border-dashed border-[#C8D8B0] rounded-xl p-5 flex flex-col items-center text-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#6E9625]/10 flex items-center justify-center">
                            <FileText size={18} className="text-[#6E9625]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#1C2C1C]">
                              Proof of Identity
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Upload a valid National ID or Driving Licence PDF / JPG
                            </p>
                            {idFileName && (
                              <p className="text-[11px] text-[#6E9625] mt-1 truncate max-w-[180px]">
                                {idFileName}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => idInputRef.current?.click()}
                            className="px-4 py-1.5 bg-[#1C2C1C] text-white rounded-lg text-[12px] font-semibold hover:bg-[#2c3e2c] transition-colors"
                          >
                            Browse Files
                          </button>
                          <input
                            ref={idInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={handleIdFileSelect}
                          />
                        </div>
                      )}

                      {/* Profile / Logo */}
                      <div className="border border-dashed border-[#C8D8B0] rounded-xl p-5 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#6E9625]/10 flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={18} className="text-[#6E9625]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#1C2C1C]">
                            Profile / Logo
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            A high-quality square image for your profile.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-4 py-1.5 bg-[#6E9625] text-white rounded-lg text-[12px] font-semibold hover:bg-[#5a7c1e] transition-colors"
                        >
                          Upload Media
                        </button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoSelect}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ════ BUSINESS DETAILS ════ */}
              {activeTab === "business" && (
                <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-6">
                  <h2 className="text-[14px] font-bold text-[#1C2C1C] mb-1">
                    Business Details
                  </h2>
                  <p className="text-[12px] text-gray-400 mb-5">
                    These details help clients verify your professional credentials.
                  </p>

                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    {/* Company Name */}
                    <div>
                      <label className="block text-[12px] font-medium text-gray-500 mb-1">
                        Registered Company Name
                      </label>
                      <input
                        id="tp-companyName"
                        type="text"
                        name="companyName"
                        value={businessForm.companyName}
                        onChange={handleBusinessChange}
                        placeholder="e.g. Santos Electrical Ltd"
                        className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                      />
                    </div>

                    {/* Company Type */}
                    <div>
                      <label className="block text-[12px] font-medium text-gray-500 mb-1">
                        Company Type
                      </label>
                      <select
                        id="tp-companyType"
                        name="companyType"
                        value={businessForm.companyType}
                        onChange={handleBusinessChange}
                        className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all bg-white"
                      >
                        <option value="">Select type</option>
                        {COMPANY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* NI / Registration Number */}
                    <div>
                      <label className="block text-[12px] font-medium text-gray-500 mb-1">
                        NI / Registration Number
                      </label>
                      <input
                        id="tp-niNumber"
                        type="text"
                        name="niNumber"
                        value={businessForm.niNumber}
                        onChange={handleBusinessChange}
                        placeholder="e.g. AB 12 34 56 C"
                        className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                      />
                    </div>

                    {/* Subscription Plan */}
                    {businessForm.planName && (
                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                          Subscription Plan
                        </label>
                        <input
                          id="tp-planName"
                          type="text"
                          name="planName"
                          value={businessForm.planName}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] bg-gray-50 text-[13px] text-gray-400 font-bold uppercase cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>

                  {/* Trade Categories & Skill Services */}
                  <div className="border-t border-[#E8E8E8] pt-5 mt-5">
                    <h3 className="text-[14px] font-bold text-[#1C2C1C] mb-1">
                      Trade Categories & Skill Services
                    </h3>


                    <div className="flex flex-col gap-6">
                      {categoryGroups.map((group, index) => {
                        // Filter out categories already selected in other groups
                        const availableCategories = tradeCategories.filter(cat =>
                          cat.id === group.categoryId || !categoryGroups.some(g => g.categoryId === cat.id)
                        );

                        const skillServicesOptions = skillServicesMap[group.categoryId] || [];
                        const subCategoriesOptions = group.selectedSkillServices.flatMap(skillId => subCategoriesMap[skillId] || []);

                        return (
                          <div key={group.id} className="relative bg-[#FAFAFA] border border-[#1C2C1C]/10 rounded-[20px] p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-[14px] font-bold text-[#1C2C1C]">Category {index + 1}</h4>
                              <div className="flex items-center gap-2">
                                {group.isCollapsed && traderStatus !== "MANUAL_CHECK" && (
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryGroupChange(group.id, 'isCollapsed', false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                  >
                                    <Edit2 size={14} strokeWidth={2.5} />
                                  </button>
                                )}
                                {traderStatus !== "MANUAL_CHECK" && categoryGroups.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeCategoryGroup(group.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                  >
                                    <X size={16} strokeWidth={2.5} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {group.isCollapsed ? (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-[16px] font-bold text-[#1C2C1C]">
                                    {availableCategories.find(c => c.id === group.categoryId)?.name || "Unknown Category"}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-4 mt-2">
                                  {group.selectedSkillServices.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[12px] font-bold text-[#1C2C1C]/50 uppercase tracking-wider">Skill Services</span>
                                      <div className="flex flex-wrap gap-2">
                                        {group.selectedSkillServices.map(id => {
                                          // Use pre-fetched map or global state as fallback
                                          const name = skillServicesOptions.find(s => s.id === id)?.name;
                                          if (!name) return null;
                                          return (
                                            <span key={id} className="bg-[#6E9625]/10 text-[#6E9625] px-3 py-1.5 rounded-md text-[13px] font-semibold">
                                              {name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {group.selectedSubCategories.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[12px] font-bold text-[#1C2C1C]/50 uppercase tracking-wider">Sub Categories</span>
                                      <div className="flex flex-wrap gap-2">
                                        {group.selectedSubCategories.map(id => {
                                          const name = subCategoriesOptions.find(s => s.id === id)?.name;
                                          if (!name) return null;
                                          return (
                                            <span key={id} className="bg-[#F5F5F5] text-[#1C2C1C]/70 border border-[#1C2C1C]/10 px-3 py-1.5 rounded-md text-[13px] font-semibold">
                                              {name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-5">
                                <div className="relative">
                                  <select
                                    value={group.categoryId}
                                    onChange={(e) => handleCategoryGroupChange(group.id, 'categoryId', e.target.value)}
                                    className="w-full h-[44px] rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/40 outline-none transition-all font-medium border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] appearance-none cursor-pointer"
                                  >
                                    <option value="" disabled>Select a Category *</option>
                                    {availableCategories.map(cat => (
                                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown />
                                </div>

                                <MultiSelect
                                  options={skillServicesOptions}
                                  selectedIds={group.selectedSkillServices}
                                  onChange={(ids) => handleCategoryGroupChange(group.id, 'selectedSkillServices', ids)}
                                  placeholder="Select Skill Services *"
                                  disabled={!group.categoryId}
                                />

                                <MultiSelect
                                  options={subCategoriesOptions}
                                  selectedIds={group.selectedSubCategories}
                                  onChange={(ids) => handleCategoryGroupChange(group.id, 'selectedSubCategories', ids)}
                                  placeholder="Select Sub Categories *"
                                  disabled={group.selectedSkillServices.length === 0}
                                />

                                <div className="mt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryGroupChange(group.id, 'isCollapsed', true)}
                                    disabled={!group.categoryId || group.selectedSkillServices.length === 0 || group.selectedSubCategories.length === 0}
                                    className="bg-[#6E9625] text-white text-[13px] font-bold py-2.5 px-6 rounded-full hover:bg-[#5C7D1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Save Category
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {traderStatus !== "MANUAL_CHECK" && (() => {
                        const maxCats = unlimitedTrades ? 9999 : (maxTrades || 1);
                        const canAddMore = categoryGroups.length < maxCats;

                        return (
                          <button
                            type="button"
                            onClick={addCategoryGroup}
                            disabled={!canAddMore}
                            className={`flex items-center justify-center gap-2 py-4 rounded-[16px] border-2 border-dashed font-bold text-[14px] transition-all
                                        ${canAddMore
                                ? "border-[#6E9625]/40 text-[#6E9625] hover:bg-[#6E9625]/5"
                                : "border-[#1C2C1C]/10 text-[#1C2C1C]/30 cursor-not-allowed bg-[#FAFAFA]"
                              }
                                    `}
                          >
                            <Plus size={18} strokeWidth={2.5} />
                            {canAddMore ? "Add Another Category" : `Maximum ${maxCats === 9999 ? 'Unlimited' : maxCats} Categories Reached`}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}


              {/* ════ PORTFOLIO ════ */}
              {activeTab === "portfolio" && (
                <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-6">
                  <h2 className="text-[14px] font-bold text-[#1C2C1C] mb-1">
                    Portfolio
                  </h2>
                  <p className="text-[12px] text-gray-400 mb-5">
                    Showcase your best work to attract more clients.
                  </p>

                  {/* Drop zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => portfolioInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer transition-colors ${isDragging
                      ? "border-[#6E9625] bg-[#6E9625]/5"
                      : "border-[#C8D8B0] hover:border-[#6E9625] hover:bg-[#6E9625]/5"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#6E9625]/10 flex items-center justify-center mb-3">
                      <Upload size={20} className="text-[#6E9625]" />
                    </div>
                    <p className="text-[13px] font-semibold text-[#1C2C1C]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      PNG, JPG up to 10 MB each
                    </p>
                    <input
                      ref={portfolioInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePortfolioSelect}
                    />
                  </div>

                  {/* Preview grid */}
                  {portfolioPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {portfolioPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100"
                        >
                          <img
                            src={src}
                            alt={`Portfolio ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePortfolioItem(i);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => portfolioInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#C8D8B0] flex items-center justify-center hover:border-[#6E9625] hover:bg-[#6E9625]/5 transition-colors"
                      >
                        <Plus size={20} className="text-[#6E9625]" />
                      </button>
                    </div>
                  )}

                  <hr className="my-8 border-[#E8E8E8]" />

                  {/* ════ CERTIFICATES ════ */}
                  <h2 className="text-[14px] font-bold text-[#1C2C1C] mb-1">
                    Certificates
                  </h2>
                  <p className="text-[12px] text-gray-400 mb-5">
                    Upload your professional certificates.
                  </p>

                  <div
                    onDrop={handleCertDrop}
                    onDragOver={handleCertDragOver}
                    onDragLeave={handleCertDragLeave}
                    onClick={() => certInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer transition-colors ${isCertDragging
                      ? "border-[#6E9625] bg-[#6E9625]/5"
                      : "border-[#C8D8B0] hover:border-[#6E9625] hover:bg-[#6E9625]/5"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#6E9625]/10 flex items-center justify-center mb-3">
                      <Upload size={20} className="text-[#6E9625]" />
                    </div>
                    <p className="text-[13px] font-semibold text-[#1C2C1C]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      PNG, JPG, PDF up to 10 MB each
                    </p>
                    <input
                      ref={certInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      onChange={handleCertificateSelect}
                    />
                  </div>

                  {certificatePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {certificatePreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 flex items-center justify-center"
                        >
                          <img
                            src={src}
                            alt={`Certificate ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "/pdf-icon.png"; }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCertificateItem(i);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => certInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#C8D8B0] flex items-center justify-center hover:border-[#6E9625] hover:bg-[#6E9625]/5 transition-colors"
                      >
                        <Plus size={20} className="text-[#6E9625]" />
                      </button>
                    </div>
                  )}

                  <hr className="my-8 border-[#E8E8E8]" />

                  {/* ════ INSURANCE ════ */}
                  <h2 className="text-[14px] font-bold text-[#1C2C1C] mb-1">
                    Insurance Documents
                  </h2>
                  <p className="text-[12px] text-gray-400 mb-5">
                    Upload your insurance policies.
                  </p>

                  <div
                    onDrop={handleInsDrop}
                    onDragOver={handleInsDragOver}
                    onDragLeave={handleInsDragLeave}
                    onClick={() => insInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer transition-colors ${isInsDragging
                      ? "border-[#6E9625] bg-[#6E9625]/5"
                      : "border-[#C8D8B0] hover:border-[#6E9625] hover:bg-[#6E9625]/5"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#6E9625]/10 flex items-center justify-center mb-3">
                      <Upload size={20} className="text-[#6E9625]" />
                    </div>
                    <p className="text-[13px] font-semibold text-[#1C2C1C]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      PNG, JPG, PDF up to 10 MB each
                    </p>
                    <input
                      ref={insInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      onChange={handleInsuranceSelect}
                    />
                  </div>

                  {insurancePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {insurancePreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 flex items-center justify-center"
                        >
                          <img
                            src={src}
                            alt={`Insurance ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "/pdf-icon.png"; }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeInsuranceItem(i);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => insInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#C8D8B0] flex items-center justify-center hover:border-[#6E9625] hover:bg-[#6E9625]/5 transition-colors"
                      >
                        <Plus size={20} className="text-[#6E9625]" />
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ── Submit button ── */}
              <button
                id="trader-update-profile-btn"
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#1C2C1C] hover:bg-[#2c3e2c] text-white text-[14px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />
                    Update Profile
                  </>
                )}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

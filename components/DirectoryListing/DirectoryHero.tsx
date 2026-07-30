"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hammer, Search } from 'lucide-react';
import { IoShieldHalfOutline } from "react-icons/io5";
import { FaScrewdriverWrench, FaLocationDot, FaLayerGroup } from "react-icons/fa6";
import { authApi } from '@/app/api/authApi';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ label, icon: Icon, value, onChange, options, disabled, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.id === value) || null;

  return (
    <div 
      className={`flex-1 flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-4 md:px-2 lg:px-4 py-4 border-b md:border-b-0 md:border-r border-[#F3F4F6] min-w-0 relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
      ref={dropdownRef}
      onClick={() => !disabled && setIsOpen(!isOpen)}
    >
      <Icon className="text-[#243A24] flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
      <div className="text-left min-w-0 flex-1">
        <span className="block text-[10px] lg:text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-1">{label}</span>
        <div className="flex items-center justify-between gap-2">
          <span className="block w-full text-[13px] lg:text-[15px] font-bold text-[#243A24] truncate">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronDown size={14} className={`text-[#243A24] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.12)] border border-gray-100 z-50 max-h-[320px] overflow-y-auto py-2 text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div 
            className="px-5 py-3 hover:bg-[#F4F7F1] text-[14px] font-semibold text-[#6B7280] cursor-pointer transition-colors"
            onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt: any) => (
            <div 
              key={opt.id}
              className={`px-5 py-3 hover:bg-[#F4F7F1] text-[14px] cursor-pointer transition-colors flex items-center justify-between ${value === opt.id ? 'bg-[#F4F7F1] text-[#6E9625] font-bold' : 'text-[#243A24] font-medium'}`}
              onClick={(e) => { e.stopPropagation(); onChange(opt.id); setIsOpen(false); }}
            >
              <span className="truncate">{opt.name}</span>
              {value === opt.id && (
                <div className="w-2 h-2 rounded-full bg-[#6E9625] flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DirectoryHero = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [skillServices, setSkillServices] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [location, setLocation] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authApi.getCategories();
        const cats = Array.isArray(res) ? res : res?.data || res?.categories || [];
        setCategories([...cats].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch skills when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSkillServices([]);
      setSelectedSkill('');
      setSubCategories([]);
      setSelectedSubCategory('');
      return;
    }
    const fetchSkills = async () => {
      try {
        const res = await authApi.getSkillServices(selectedCategory);
        const skills = Array.isArray(res) ? res : res?.data || res?.services || [];
        setSkillServices([...skills].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
        setSelectedSkill('');
        setSubCategories([]);
        setSelectedSubCategory('');
      } catch (err) {
        console.error('Failed to load skills', err);
      }
    };
    fetchSkills();
  }, [selectedCategory]);

  // Fetch subcategories when skill changes
  useEffect(() => {
    if (!selectedSkill) {
      setSubCategories([]);
      setSelectedSubCategory('');
      return;
    }
    const fetchSubCategories = async () => {
      try {
        const res = await authApi.getSubCategories(selectedSkill);
        const subs = Array.isArray(res) ? res : res?.data || res?.subCategories || [];
        setSubCategories([...subs].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
        setSelectedSubCategory('');
      } catch (err) {
        console.error('Failed to load subcategories', err);
      }
    };
    fetchSubCategories();
  }, [selectedSkill]);

  const handleSearch = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const params = new URLSearchParams();
    if (selectedCategory) params.append('categoryId', selectedCategory);
    if (selectedSkill) params.append('skillService', selectedSkill);
    if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
    if (location) params.append('location', location);
    
    router.push(`/directory-listing/search?${params.toString()}`);
  };

  return (
    <section className="bg-[#F7F9F6] pt-24 pb-20 px-4 sm:px-6 md:pt-36 md:pb-32">
      <div className="max-w-[1400px] mx-auto text-center">

        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 bg-[#65A30D1A]/10 px-4 py-2 rounded-full mb-6 sm:mb-12 border border-[#65A30D33]/20">
          <IoShieldHalfOutline size={16} className="text-[#064E3B]" />
          <span className="text-[#65A30D] text-[12px] font-bold tracking-wider uppercase">
            Premium Trade Network
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[32px] sm:text-[38px] md:text-[46px] lg:text-[60px] font-bold text-[#243A24] leading-[1.1] mb-8" style={{ fontFamily: "var(--font-bricolage)" }}>
          Find Local and Expert <br className="max-sm:hidden" />
          <span className="text-[#6E9625]">Tradespeople</span> for Your Job
        </h1>

        {/* Subheadline */}
        <p className="text-[16px] md:text-[18px] lg:text-[20px] text-[#4B5563] font-medium max-w-2xl mx-auto mb-10 sm:mb-16 md:mb-20 leading-relaxed">
          Browse trusted and vetted professionals, compare <br className="hidden md:block" />
          profiles, and hire with confidence
        </p>

        {/* Search Bar Container */}
        <div 
          className="w-full max-w-[1280px] mx-auto bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-2 border-[#243A24] p-3"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-2 lg:gap-4">

            {/* Category */}
            <CustomDropdown
              label="Category"
              icon={Hammer}
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories.map(c => ({ id: c.id || c._id, name: c.name }))}
              placeholder="All Trades"
            />

            {/* Service */}
            <CustomDropdown
              label="Service"
              icon={FaScrewdriverWrench}
              value={selectedSkill}
              onChange={setSelectedSkill}
              options={skillServices.map(s => ({ id: s.id || s._id, name: s.name }))}
              placeholder="Select Service"
              disabled={!selectedCategory}
            />

            {/* Location */}
            <div className="flex-[0.8] flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-4 md:px-2 lg:px-4 py-4 min-w-0">
              <FaLocationDot className="text-[#243A24] flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
              <div className="text-left min-w-0 flex-1">
                <span className="block text-[10px] lg:text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-1">Location</span>
                <input
                  type="text"
                  placeholder="Postcode/City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full text-[13px] lg:text-[15px] font-bold text-[#243A24] placeholder-[#9CA3AF] bg-transparent outline-none truncate"
                />
              </div>
            </div>

            {/* Search Button */}
            <button 
              type="button"
              onClick={handleSearch}
              className="bg-[#243A24] hover:bg-[#1A301A] text-white px-6 py-4 md:px-3 lg:px-6 lg:py-5 rounded-[18px] flex items-center justify-center gap-2 lg:gap-3 font-bold text-[15px] md:text-[13px] lg:text-[16px] transition-all min-w-full md:min-w-[100px] lg:min-w-[160px] cursor-pointer flex-shrink-0"
            >
              <Search className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
              <span className="truncate max-md:block md:hidden lg:block">Search Trader</span>
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};

export default DirectoryHero;

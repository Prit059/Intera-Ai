import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Briefcase, Code, Users, ChevronDown, Search, Check } from 'lucide-react';

export const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap, description: 'Preparing for placements' },
    { id: 'professional', label: 'Professional', icon: Briefcase, description: 'Career transition' },
    { id: 'developer', label: 'Developer', icon: Code, description: 'Technical interviews' },
    { id: 'recruiter', label: 'Recruiter', icon: Users, description: 'Hiring talent' },
    { id: 'designer', label: 'Designer', icon: Code, description: 'UI/UX & Design roles' },
    { id: 'manager', label: 'Manager', icon: Briefcase, description: 'Leadership positions' },
    { id: 'consultant', label: 'Consultant', icon: Users, description: 'Business consulting' },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: Briefcase, description: 'Startup founder' }
  ];

  const selectedRoleData = roles.find(role => role.id === selectedRole);
  const filteredRoles = roles.filter(role =>
    role.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (roleId) => {
    onRoleChange(roleId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-white font-medium text-sm mb-3">
        What's your role?
      </label>
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-4 rounded-2xl border transition-all duration-300 ease-out
          backdrop-blur-lg bg-white/5 border-white/20 
          hover:bg-white/10 hover:border-white/30
          focus:outline-none focus:ring-2 focus:ring-blue-400/50
          ${selectedRole ? 'border-blue-400/50 bg-blue-500/10' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedRoleData ? (
              <>
                <selectedRoleData.icon className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">{selectedRoleData.label}</div>
                  <div className="text-white/50 text-sm">{selectedRoleData.description}</div>
                </div>
              </>
            ) : (
              <div className="text-white/50">Select your role</div>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-white/50 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl shadow-black/20 overflow-hidden animate-fade-in-up">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>

          {/* Role Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`
                      w-full p-4 flex items-center space-x-3 transition-all duration-200
                      hover:bg-white/10 focus:outline-none focus:bg-white/10
                      ${selectedRole === role.id ? 'bg-blue-500/20' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${selectedRole === role.id ? 'text-blue-400' : 'text-white/70'}`} />
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${selectedRole === role.id ? 'text-blue-400' : 'text-white'}`}>
                        {role.label}
                      </div>
                      <div className="text-white/50 text-sm">{role.description}</div>
                    </div>
                    {selectedRole === role.id && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-white/50">
                No roles found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Tag as TagIcon } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  tags: Tag[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TagSelector = ({ tags, value, onChange, placeholder = "No tag", disabled = false }: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedTag = tags.find(tag => tag.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 
          text-sm flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'}
        `}
      >
        <div className="flex items-center space-x-2">
          {selectedTag ? (
            <>
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: selectedTag.color }}
              />
              <span className="text-gray-900 dark:text-gray-100">{selectedTag.name}</span>
            </>
          ) : (
            <>
              <TagIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {/* No tag option */}
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2.5 flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left
                ${value === '' ? 'bg-gray-50 dark:bg-gray-700' : ''}
              `}
            >
              <TagIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
            </button>

            {/* Tag options */}
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  onChange(tag.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2.5 flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                   text-left
                  ${value === tag.id ? 'bg-gray-50 dark:bg-gray-700' : ''}
                `}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-gray-900 dark:text-gray-100">{tag.name}</span>
                {value === tag.id && (
                  <svg className="w-4 h-4 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
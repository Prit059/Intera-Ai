// frontend/src/components/Tags/Tags.jsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { X } from 'lucide-react';

const DEFAULT_TAGS = [
  { id: 'javascript', label: 'Javascript' },
  { id: 'express', label: 'Express' },
  { id: 'vue', label: 'Vue' },
  { id: 'jest', label: 'Jest' },
  { id: 'next', label: 'Next' },
  { id: 'typescript', label: 'Typescript' },
  { id: 'redis', label: 'Redis' },
  { id: 'git', label: 'Git' },
  { id: 'node', label: 'Node' },
];

export function Tags({ 
  tags = DEFAULT_TAGS, 
  selectedTags = [], 
  onTagsChange,
  placeholder = "Select topics",
  title = "TOPICS"
}) {
  const selectedsContainerRef = useRef(null);

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [selectedTags]);

  const removeSelectedTag = (id) => {
    const newSelected = selectedTags.filter((tag) => tag.id !== id);
    onTagsChange?.(newSelected);
  };

  const addSelectedTag = (tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      onTagsChange?.([...selectedTags, tag]);
    }
  };

  return (
    <MotionConfig transition={{ type: 'spring', stiffness: 300, damping: 40 }}>
      <div className="relative flex w-full flex-col">
        <motion.h2
          layout
          className="text-sm font-semibold text-gray-300 mb-2"
        >
          {title}
        </motion.h2>
        
        {/* Selected Tags Container */}
        <motion.div
          ref={selectedsContainerRef}
          layout
          className="mb-3 flex min-h-14 w-full flex-wrap gap-1.5 rounded-2xl border border-gray-700 bg-black/50 p-2"
        >
          {selectedTags.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
              {placeholder}
            </div>
          ) : (
            selectedTags.map((tag) => (
              <motion.div
                key={tag.id}
                layoutId={`tag-${tag.id}`}
                className="flex w-fit items-center gap-1 border border-gray-600 bg-gray-800 py-1 pr-1 pl-3"
                style={{ borderRadius: 10, zIndex: 20 }}
              >
                <motion.span
                  layoutId={`tag-${tag.id}-label`}
                  className="truncate font-medium text-gray-200 text-sm"
                >
                  {tag.label}
                </motion.span>

                <button
                  title="Remove"
                  onClick={() => removeSelectedTag(tag.id)}
                  className="rounded-full p-1 hover:bg-gray-700 transition-colors"
                >
                  <X className="size-4 text-gray-400" />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Available Tags Container */}
        {tags.length > selectedTags.length && (
          <motion.div
            layout
            className="w-full rounded-2xl border border-gray-700 bg-gray-900/50 p-2"
          >
            <motion.div className="flex flex-wrap gap-2">
              {tags
                .filter(
                  (tag) =>
                    !selectedTags.some((selected) => selected.id === tag.id),
                )
                .map((tag) => (
                  <motion.button
                    key={tag.id}
                    layoutId={`tag-${tag.id}`}
                    onClick={() => addSelectedTag(tag)}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-gray-800 px-3 py-1.5 hover:bg-gray-700 transition-colors"
                    style={{ borderRadius: 10, zIndex: 10 }}
                  >
                    <motion.span
                      layoutId={`tag-${tag.id}-label`}
                      className="font-medium text-gray-300 text-sm"
                    >
                      {tag.label}
                    </motion.span>
                  </motion.button>
                ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}
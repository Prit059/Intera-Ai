import React, { useEffect, useRef, useState } from 'react'
import { LuChevronDown, LuPin, LuPinOff, LuSparkles } from 'react-icons/lu'
import AIResponseReview from '../AIResponseReview';
import { useDarkMode } from '../../context/DarkModeContext';

function QuestionCard({
  question,
  answer,
  onLearnMore,
  isPinned,
  isTogglePin,
  questionId,
}) {

  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);
  const { darkmode } = useDarkMode();

  useEffect(()=>{
    if(isExpanded){
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight + 10);
    }else{
      setHeight(0);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className='w-[60vw]'>
      <div className='relative m-2'>
        <div className='flex items-center font-semibold text-[14px] justify-between p-3 border rounded-2xl shadow-2xl hover:border border-violet-600 transition duration-300'>
          <h2>{question}</h2>
          <div className='flex items-center gap-4.5'>
            
            <button onClick={toggleExpand} className='flex gap-0.5 items-center justify-center text-[15px] text-blue-500 hover:text-violet-600 transition-colors duration-300'>
              {isExpanded ? "Hide Answer" : "Show Answer"}
              <LuChevronDown className={`text-lg transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            <button onClick={()=>isTogglePin(questionId)} className='bg-violet-100 rounded-lg border border-violet-500 p-1.5'>
              {!isPinned ? 
                <LuPin className='text-xl  text-violet-600 hover:text-black transition-colors duration-300' /> :
                <LuPinOff className='text-xl text-black hover:text-violet-600 transition-colors duration-300' />
              }
            </button>
          </div>
        </div>

        <div className={`w-full transition-all duration-300 ease-in-out overflow-hidden`} style={{ maxHeight: `${height}px` }}>
          <div ref={contentRef} className={`p-2.5 mt-1 text-[17px] bg-black border border-black font-medium rounded-2xl shadow-lg `}>
            <AIResponseReview content={answer}/>
          <button onClick={onLearnMore} className='flex bg-cyan-100 p-1 rounded-lg border border-cyan-500 items-center justify-center text-lg text-black mt-2 gap-1 hover:text-violet-600 transition-colors duration-300'>
            <LuSparkles />
            Learn More
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
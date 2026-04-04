import React from 'react'
import { useState } from 'react'
import { LuCopy, LuCheck, LuCode} from 'react-icons/lu'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useDarkMode } from '../context/DarkModeContext'

function AIResponseReview({ content }) {
   if(!content){
    return null;
   }
   const { darkmode } = useDarkMode();
  return (
    <div className={`max-w-4xl mx-auto p-2 rounded-2xl bg-black border border-gray-500 ${darkmode ? 'text-black' : 'text-white'}`}>
      <div className='text-[14px] prose prose-slate dark:prose-invert max-w-none'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, className, children, ...props}){
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              const isInline = !className;

              return !isInline ? (
                <CodeBlock 
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                />
              ): (
                <code className='px-1 py-05 bg-gray-700 rounded text-sm' {...props}>
                  {children}
                </code>
              );
            },
            p({children}){
              return <p className='text-[17px] font-medium'>{children}</p>
            },
            strong({children}){
              return <strong>{children}</strong>;
            },
            em({children}){
              return <em>{children}</em>
            },
            ul({children}){
              return <ul className='list-disc pl-6 space-y-2 my-4'>{children}</ul>
            },
            ol({children}){
              return <ol className='list-decimal pl-6 space-y-2 my-4'>{children}</ol>
            },
            li({children}){
              return <li className='mb-1'>{children}</li>
            },
            blockquote({children}){
              return <blockquote className='border-l-4 border-gray-400 pl-4 italic my-4'>{children}</blockquote>
            },
            h1({children}){
              return <h1 className='text-2xl font-bold mt-6 mb-4'>{children}</h1>
            },
            h2({children}){
              return <h2 className='text-xl font-bold mt-6 mb-3'>{children}</h2>
            },
            h3({children}){
              return <h3 className='text-lg font-bold mt-4 mb-2'>{children}</h3>
            },
            h4({children}){
              return <h4 className='text-base font-bold mt-4 mb-2'>{children}</h4>
            },
            a({children, href}){
              return <a href={href} className='text-blue-500 hover:underline'>{children}</a>
            },
            table({children}){
              return <div className='overflow-x-auto my-4'>
                        <table className='min-w-full divide-y divide-gray-300 border border-gray-200'>{children}</table>
                    </div>
            },
            thead({children}){
              return <thead className='bg-gray-50'>{children}</thead>
            },
            tbody({children}){
              return <tbody className='divide-y divide-gray-200'>{children}</tbody>
            },
            tr({children}){
              return <tr className=''>{children}</tr>
            },
            th({children}){
              return <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider '>{children}</th>
            },
            td({children}){
              return <td className='px-3 py-2 whitespace-nowrap'>{children}</td>
            },
            hr(){
              return <hr className='border-t border-gray-300 my-4' />
            },
            img({src, alt}){
              return <img src={src} alt={alt} className='my-4 max-w-full rounded-xl' />
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

function CodeBlock({code, language}){
  const [copied, setCopied] = useState(false);

  const handlecopy = () => {
    navigator.clipboard.writeText(code)
      .then (() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
  };

  return (
    <>
    <div className='relative my-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shadow-lg'>
      <div className='flex p-3.5 items-center justify-between bg-gray-300 text-xl'> 
        <div className='flex items-center gap-2 text-black'>
          <LuCode size={16} className=''></LuCode>
          <span className='font-semibold'>
            {language || 'Code'}
          </span>
        </div>
        <button onClick={handlecopy} className='text-black flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600' aria-label='Copy code'>
          {copied ? (
            <LuCheck size={16} className='text-green-600'></LuCheck>
          ):(
            <LuCopy size={16}></LuCopy>
          )}
          {copied && (
            <span className='text-lg font-semibold'>
              Copied
            </span>
          )}
        </button>
      </div>

      <SyntaxHighlighter language={language}
      style={oneLight}
      customStyle={{fontSize: 14.5, margin: 0, padding: '1rem', background: 'transparent'}}>
        {code}
      </SyntaxHighlighter>
      </div>
    </>
  )
}
export default AIResponseReview
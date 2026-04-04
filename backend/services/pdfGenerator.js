// services/pdfGenerator.js - FIXED TABLE WIDTH (No Text Wrapping)
const puppeteer = require('puppeteer');

exports.generatePdf = async (formula) => {
  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${formula.title} | Intera-ai</title>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #000000;
            padding: 0;
            margin: 0;
            background: #ffffff;
            position: relative;
          }
          
          /* Background Watermark */
          body::before {
            content: "INTERA-AI";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: 800;
            color: rgba(0, 0, 0, 0.03);
            letter-spacing: 8px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
            font-family: 'Inter', sans-serif;
          }
          
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 48px 40px;
            position: relative;
            z-index: 1;
            background: transparent;
          }
          
          /* Page Break */
          .page-break {
            page-break-before: always;
            margin-top: 0;
          }
          
          .page-break:first-of-type {
            page-break-before: avoid;
          }
          
          /* Header */
          .header {
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #000000;
          }
          
          .header h1 {
            font-size: 36px;
            font-weight: 800;
            color: #000000;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
          }
          
          .badge-container {
            display: flex;
            gap: 12px;
            margin: 16px 0;
            flex-wrap: wrap;
          }
          
          .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            background: #f5f5f5;
            color: #333333;
            border: 1px solid #e0e0e0;
          }
          
          .description {
            margin-top: 20px;
            padding: 20px;
            background: #fafafa;
            border-left: 3px solid #000000;
            color: #333333;
            font-size: 14px;
            line-height: 1.6;
          }
          
          /* Section Styles */
          .section {
            margin: 48px 0;
          }
          
          .section h2 {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 24px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000000;
          }
          
          /* Table Styles - NO WRAPPING */
          .formula-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            table-layout: fixed;
          }
          
          .formula-table th {
            background: #f5f5f5;
            color: #000000;
            padding: 14px 16px;
            text-align: left;
            font-weight: 700;
            font-size: 14px;
            border-bottom: 2px solid #000000;
          }
          
          .formula-table td {
            padding: 14px 16px;
            font-size: 13px;
            border-bottom: 1px solid #e0e0e0;
            vertical-align: middle;
          }
          
          /* Column Widths - Optimized for formula to stay on one line */
          .formula-table th:first-child, .formula-table td:first-child {
            width: 32%;
            word-break: keep-all;
            white-space: normal;
          }
          .formula-table th:nth-child(2), .formula-table td:nth-child(2) {
            width: 20%;
            word-break: keep-all;
          }
          .formula-table th:last-child, .formula-table td:last-child {
            width: 48%;
            word-break: normal;
          }
          
          .formula-table code {
            background: #f5f5f5;
            color: #000000;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
            white-space: nowrap;
          }
          
          /* Formula Cards */
          .formula-card {
            background: #fafafa;
            border-left: 4px solid #000000;
            padding: 20px;
            margin: 16px 0;
            border: 1px solid #e0e0e0;
          }
          
          .formula-card .formula-name {
            font-weight: 700;
            color: #000000;
            margin-bottom: 12px;
            font-size: 18px;
          }
          
          .formula-card code {
            background: #ffffff;
            color: #000000;
            padding: 10px 14px;
            border-radius: 8px;
            display: inline-block;
            font-family: 'Courier New', monospace;
            font-size: 15px;
            font-weight: 600;
            margin: 10px 0;
            border: 1px solid #e0e0e0;
            white-space: nowrap;
          }
          
          .formula-card p {
            font-size: 14px;
            font-weight: 500;
            color: #333333;
          }
          
          /* Example Cards */
          .example-card {
            background: #fafafa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e0e0e0;
          }
          
          .example-card .question {
            font-weight: 700;
            color: #000000;
            margin-bottom: 16px;
            font-size: 15px;
            background: #f0f0f0;
            padding: 12px;
            border-radius: 6px;
          }
          
          .example-card .solution {
            background: #ffffff;
            padding: 16px;
            border-radius: 6px;
            margin-top: 12px;
            border-left: 3px solid #000000;
            color: #333333;
            font-size: 13px;
            font-weight: 500;
          }
          
          /* Two Column Layout */
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin: 32px 0;
          }
          
          .concept-box, .mistake-box {
            background: #fafafa;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #e0e0e0;
          }
          
          .concept-box h3, .mistake-box h3 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 700;
            padding-bottom: 8px;
            border-bottom: 2px solid #000000;
          }
          
          .concept-list, .mistake-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .concept-list li, .mistake-list li {
            padding: 8px 0 8px 24px;
            position: relative;
            font-size: 13px;
            font-weight: 500;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .concept-list li:last-child, .mistake-list li:last-child {
            border-bottom: none;
          }
          
          .concept-list li:before {
            content: "✓";
            color: #000000;
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          
          .mistake-list li:before {
            content: "✗";
            color: #000000;
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          
          /* Tip Box */
          .tip-box {
            background: #fafafa;
            padding: 16px 20px;
            margin: 12px 0;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            border: 1px solid #e0e0e0;
          }
          
          .tip-box:before {
            content: "💡";
            font-size: 16px;
          }
          
          .tip-box p {
            margin: 0;
            flex: 1;
            color: #333333;
            font-size: 13px;
            font-weight: 500;
          }
          
          /* Images Grid */
          .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin: 24px 0;
          }
          
          .image-card {
            background: #fafafa;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
          }
          
          .image-card img {
            width: 100%;
            height: auto;
            display: block;
          }
          
          .image-caption {
            padding: 12px;
            font-size: 12px;
            color: #666666;
            text-align: center;
            background: #ffffff;
            border-top: 1px solid #e0e0e0;
          }
          
          /* Footer */
          .footer {
            margin-top: 60px;
            padding: 24px 0 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            background: #ffffff;
            position: relative;
            z-index: 1;
          }
          
          .footer .logo {
            font-weight: 800;
            font-size: 16px;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
          }
          
          .footer p {
            font-size: 10px;
            color: #888888;
            margin: 2px 0;
          }
          
          /* Keep Together */
          .keep-together {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          @media print {
            body {
              background: white;
            }
            .formula-card, .example-card, .image-card {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- PAGE 1: Header + Quick Reference -->
          <div class="header">
            <h1>${formula.title}</h1>
            <div class="badge-container">
              <span class="badge">${formula.category}</span>
              <span class="badge">${formula.difficulty}</span>
              <span class="badge">${formula.estimatedTime} min read</span>
            </div>
            ${formula.description ? `
            <div class="description">
              ${formula.description}
            </div>
            ` : ''}
          </div>

          <!-- Quick Reference Table - NO WRAPPING -->
          ${formula.formulas && formula.formulas.length > 0 ? `
          <div class="section">
            <h2>Quick Reference</h2>
            <table class="formula-table">
              <thead>
                <tr><th>Formula</th><th>Name</th><th>Description</th></tr>
              </thead>
              <tbody>
                ${formula.formulas.map(f => `
                <tr>
                  <td><code>${f.formula}</code></td>
                  <td><strong>${f.name}</strong></td>
                  <td>${f.explanation}</td>
                 </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Images Section -->
          ${formula.images && formula.images.length > 0 ? `
          <div class="section">
            <h2>Visual Reference</h2>
            <div class="images-grid">
              ${formula.images.map(img => `
                <div class="image-card keep-together">
                  <img src="${img.url}" alt="${img.caption || 'Diagram'}" />
                  ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- PAGE 2: Formula Details -->
          ${formula.formulas && formula.formulas.length > 0 ? `
          <div class="page-break">
            <div class="section">
              <h2>Formula Details</h2>
              ${formula.formulas.map(f => `
                <div class="formula-card keep-together">
                  <div class="formula-name">${f.name}</div>
                  <code>${f.formula}</code>
                  <p>${f.explanation}</p>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- PAGE 3: Solved Examples -->
          ${formula.examples && formula.examples.length > 0 ? `
          <div class="page-break">
            <div class="section">
              <h2>Solved Examples</h2>
              ${formula.examples.map((e, i) => `
                <div class="example-card keep-together">
                  <div class="question">Example ${i + 1}: ${e.question}</div>
                  <div class="solution">
                    <strong>Solution:</strong><br>
                    ${e.solution.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- PAGE 4: Concepts, Mistakes, Tips -->
          <div class="page-break">
            ${(formula.concepts && formula.concepts.length > 0) || (formula.mistakes && formula.mistakes.length > 0) ? `
            <div class="two-column">
              ${formula.concepts && formula.concepts.length > 0 ? `
              <div class="concept-box">
                <h3>✓ Key Concepts</h3>
                <ul class="concept-list">
                  ${formula.concepts.map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${formula.mistakes && formula.mistakes.length > 0 ? `
              <div class="mistake-box">
                <h3>✗ Common Mistakes</h3>
                <ul class="mistake-list">
                  ${formula.mistakes.map(m => `<li>${m}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
            </div>
            ` : ''}

            ${formula.tips && formula.tips.length > 0 ? `
            <div class="section">
              <h2>Pro Tips & Shortcuts</h2>
              ${formula.tips.map(t => `
                <div class="tip-box">
                  <p>${t}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="logo">INTERA-AI</div>
            <p>AI-Powered Learning Platform • Master Aptitude with Confidence</p>
            <p>© ${new Date().getFullYear()} Intera-ai • All Rights Reserved</p>
            <p>Generated from Intera-ai Formula Sheet Library • For personal use only</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    await page.emulateMediaType('screen');
    
    // Wait for KaTeX to render
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof renderMathInElement !== 'undefined') {
          renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false}
            ]
          });
        }
        setTimeout(resolve, 1000);
      });
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      }
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};
import requests

with open('test_local.pdf', 'wb') as f:
    f.write(b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 21 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Test) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n0000000305 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n377\n%%EOF\n')

try:
    files = {'resume': ('test_local.pdf', open('test_local.pdf', 'rb'), 'application/pdf')}
    req = requests.post('http://localhost:5000/api/upload-resume', files=files)
    print("STATUS", req.status_code)
    print("BODY", req.text)
except Exception as e:
    print("ERR", e)

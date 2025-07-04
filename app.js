const handleSignPdf = async () => {
  if (!file || !typedName || !droppedPosition) {
    alert('Please upload a PDF, type your signature, and place it on the PDF.');
    return;
  }

  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('signatureText', typedName);
  formData.append('font', selectedFont);
  formData.append('x', droppedPosition.x);
  formData.append('y', droppedPosition.y);
  formData.append('page', 1); // or the correct page number

  const response = await fetch('http://localhost:5000/sign-pdf', {
    method: 'POST',
    body: formData,
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'signed.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
};

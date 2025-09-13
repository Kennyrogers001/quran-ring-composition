async function exportToPdf(svgElement, title) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
    });

    // Get SVG dimensions
    const svgWidth = svgElement.getBoundingClientRect().width;
    const svgHeight = svgElement.getBoundingClientRect().height;

    // Create a canvas to draw the SVG
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth * 2; // Increase resolution for better quality
    canvas.height = svgHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Create an image from the SVG string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        // Draw the image onto the canvas
        ctx.fillStyle = 'white'; // Set a white background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png');

        // PDF dimensions
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const margin = 40;

        // Add title to PDF
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, margin + 10);

        // Add image to PDF
        const imgProps = doc.getImageProperties(imgData);
        const aspectRatio = imgProps.width / imgProps.height;
        let newImgWidth = pdfWidth - (2 * margin);
        let newImgHeight = newImgWidth / aspectRatio;

        if (newImgHeight > pdfHeight - (2 * margin) - 40) {
            newImgHeight = pdfHeight - (2 * margin) - 40;
            newImgWidth = newImgHeight * aspectRatio;
        }

        const x = (pdfWidth - newImgWidth) / 2;
        const y = margin + 40;

        doc.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);

        // Save the PDF
        doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_export.pdf`);
    };

    img.onerror = function(e) {
        console.error('Failed to load SVG image for PDF export.', e);
        alert('Could not export to PDF. See console for details.');
        URL.revokeObjectURL(url);
    };

    img.src = url;
}
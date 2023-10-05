
document.addEventListener('DOMContentLoaded', function() {
    var downloadBtn = document.getElementById('download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            let content = document.documentElement.innerHTML;
            let opt = {
                margin: 10,
                filename: 'ReadingList.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(content).set(opt).outputPdf().then(function(pdf) {
                var blob = new Blob([pdf], { type: 'application/pdf' });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'ReadingList.pdf';
                link.click();
            });
        });
    }
});

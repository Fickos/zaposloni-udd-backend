const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();

module.exports.extractTextFromPDF = async function (pdfBuffer) {
    const data = await pdfExtract.extractBuffer(pdfBuffer);
    
    let text = "";

    for (const page of data.pages) {
        let oldY = null;
        let lastStr = null;
        page.content.forEach((c) => {
            if (oldY !== c.y && lastStr !== "") {
                text += `\n${c.str}`;
            } else {
                text += c.str === "" ? "\n" : c.str;
            }
            oldY = c.y;
            lastStr = c.str;
        });
    }
    return text;
}

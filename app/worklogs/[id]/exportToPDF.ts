import jsPDF from "jspdf";

interface Personnel {
    role: string;
    count: number;
}

interface Equipment {
    type: string;
    count: number;
    hours: number;
}

interface Material {
    name: string;
    quantity: number;
    unit: string;
}

interface WorkLog {
    _id: string;
    date: string;
    project: string;
    projectName?: string;
    author: string;
    authorName?: string;
    weather?: string;
    temperature?: number;
    workDescription: string;
    personnel?: Personnel[];
    equipment?: Equipment[];
    materials?: Material[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export function exportToPDF(workLog: WorkLog) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    const lineGap = 8;
    let lastLineY = y;  // Keep track of the last Y position to draw the rectangle

    doc.setDrawColor(226, 232, 240); // Set light gray color for border
    const drawRect = () => {
        if (lastLineY < pageHeight - margin) {
            // Draw a rectangle that fits the content if it's on a single page
            doc.rect(margin, margin, pageWidth - 2 * margin, lastLineY - margin); // Adjust to content height
        } else {
            // Full page border if the content spans multiple pages
            doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin); // Full page border
        }
    };


    const addLine = (label?: string, value?: string | number) => {
        if (y + lineGap > pageHeight - margin) {
            drawRect();
            doc.addPage();
            y = margin + 10;
        }

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.text(`${label ?? ""}`, margin + 6, y);
        doc.setFont("Helvetica", "normal");
        doc.text(`${value ?? "N/A"}`, label ? margin + 40 : margin + 6, y);
        y += lineGap;
        lastLineY = y;
    };

    const addHeader = (label: string) => {
        if (y + 4 * lineGap > pageHeight - margin) {
            drawRect();
            doc.addPage();
            y = margin + 10;
        }
        doc.setFontSize(14);
        y += lineGap;
        doc.setFont("Helvetica", "bold");
        doc.text(`${label}`, margin + 6, y);
        y += 4;
        doc.line(margin + 6, y, pageWidth - 2 * margin +6, y);
        y += lineGap;
        lastLineY = y;
    };


    doc.setFontSize(18);
    doc.setFont("Helvetica", "bold");
    doc.text("Work Log - " + new Date(workLog.date).toLocaleDateString(), margin + 6, y + 10)
    y += lineGap + 10;
    addLine("Created: ", workLog.createdAt ? new Date(workLog.createdAt).toLocaleString() : 'Unknown');



    // Basic Info
    addHeader("Basic Information")
    addLine("Date", new Date(workLog.date).toLocaleDateString());
    addLine("Project", workLog.projectName || workLog.project);
    addLine("Author", workLog.authorName || workLog.author);
    addLine("Weather", workLog.weather);
    addLine("Temperature", typeof workLog.temperature === "number" ? `${workLog.temperature}°C` : undefined);

    y += lineGap;

    // Work Description
    addHeader("Work Description")
    const workDescLines = doc.splitTextToSize(workLog.workDescription, 180);
    workDescLines.forEach((line: string) => {
        if (y + lineGap > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        addLine("",line);

    });


    // Personnel
    if (workLog.personnel?.length) {
        addHeader("Personnel");
        workLog.personnel.forEach(({ role, count }) => {
            addLine("Role", role);
            addLine("Count", count);
        });
    }

    // Equipment
    if (workLog.equipment?.length) {
        addHeader("Equipment");
        workLog.equipment.forEach(({ type, count, hours }) => {
            addLine("Type", type);
            addLine("Count", count);
            addLine("Hours", hours);
        });
    }

    // Materials
    if (workLog.materials?.length) {
        addHeader("Materials");
        workLog.materials.forEach(({ name, quantity, unit }) => {
            addLine("Name", name);
            addLine("Quantity", quantity);
            addLine("Unit", unit);
        });
    }

    // Notes
    if (workLog.notes) {
        addHeader("Notes");
        const notesLines = doc.splitTextToSize(workLog.notes, 180);
        notesLines.forEach((line: string) => {
            if (y + lineGap > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            addLine("",line)
        });
    }
    drawRect();
    doc.save(`WorkLog-${new Date(workLog.date).toISOString().split("T")[0]}.pdf`);
}

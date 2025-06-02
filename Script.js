document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and script running.");

    // Attach event listeners to Save Shift buttons dynamically
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        let saveButton = document.querySelector(`button[data-day="${day}"]`);
        if (saveButton) {
            saveButton.addEventListener("click", () => saveShift(day));
        }
    });

    // Attach event listener for the Download PDF button
    let downloadBtn = document.getElementById("downloadPdfBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadPDF);
    } else {
        console.error("Download PDF button not found!");
    }
});

// Function to calculate hours worked
function calculateHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;

    let start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);

    if (end < start) {
        // Handles overnight shifts
        end.setDate(end.getDate() + 1);
    }

    let diff = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
    return diff;
}

// Function to update total shift calculations
function updateTotals() {
    let totalHours = 0;
    let weekdayHours = 0;
    let weekendHours = 0;
    let sleepoverCount = 0;
    let brokenShift1 = 0;
    let brokenShift2 = 0;

    let days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    days.forEach(day => {
        let shiftTimes = [];
        let dailyTotalHours = 0;

        for (let i = 1; i <= 4; i++) {
            let start = document.getElementById(`${day}StartTime${i}`).value;
            let end = document.getElementById(`${day}EndTime${i}`).value;
            let shiftType = document.getElementById(`${day}ShiftType${i}`).value;
            let dateField = document.getElementById(`${day}Date`);
            let date = dateField ? new Date(dateField.value) : null;

           if (start && end && date) {
                const hours = calculateHours(start, end);

                // Handle leave separately
                if (shiftType === "annual leave") {
                    annualLeaveHours += hours;
                    continue;
                } else if (shiftType === "personal leave") {
                    personalLeaveHours += hours;
                    continue;
                }

                totalHours += hours;
                shiftTimes.push({ start, end, hours });

                if (shiftType === "sleepover") sleepoverCount++;
                if (date.getDay() === 6 || date.getDay() === 0) {
                    weekendHours += hours;
                } else {
                    weekdayHours += hours;
                }
            }
        }

        // Sort shifts in ascending order by start time
        shiftTimes.sort((a, b) => new Date(`1970-01-01T${a.start}:00`) - new Date(`1970-01-01T${b.start}:00`));

        // **Calculate Broken Shift 1 and 2 Allowance**
        if (shiftTimes.length === 2) {
            let breakTime = (new Date(`1970-01-01T${shiftTimes[1].start}:00`) - new Date(`1970-01-01T${shiftTimes[0].end}:00`)) / (1000 * 60 * 60);
            if (breakTime > 0) brokenShift1 += 1; // Count BS1 only if there's a break
        }

        if (shiftTimes.length === 3) {
            let firstBreak = (new Date(`1970-01-01T${shiftTimes[1].start}:00`) - new Date(`1970-01-01T${shiftTimes[0].end}:00`)) / (1000 * 60 * 60);
            let secondBreak = (new Date(`1970-01-01T${shiftTimes[2].start}:00`) - new Date(`1970-01-01T${shiftTimes[1].end}:00`)) / (1000 * 60 * 60);
            if (firstBreak > 0 && secondBreak > 0) brokenShift2 += 1; // Count BS2 only if two breaks exist
        }
    });

    // Update UI with calculated values
    document.getElementById("total-hours").innerText = totalHours.toFixed(2);
    document.getElementById("weekday-hours").innerText = weekdayHours.toFixed(2);
    document.getElementById("weekend-hours").innerText = weekendHours.toFixed(2);
    document.getElementById("sleepovers").innerText = sleepoverCount;
    document.getElementById("broken-shift-1").innerText = brokenShift1;
    document.getElementById("broken-shift-2").innerText = brokenShift2;
}

// Function to save shift data
function saveShift(day) {
    console.log(`Saving shifts for ${day}`);

    const date = document.getElementById(`${day}Date`).value;
    const shiftTable = document.getElementById("shiftEntries");

    // Remove old rows for this specific day to prevent duplicates
    const rowsToRemove = Array.from(shiftTable.rows).filter(row => row.dataset.day === day);
    rowsToRemove.forEach(row => shiftTable.removeChild(row));

    // Collect shift data
    const shifts = [
        { start: document.getElementById(`${day}StartTime1`).value, end: document.getElementById(`${day}EndTime1`).value, type: document.getElementById(`${day}ShiftType1`).value },
        { start: document.getElementById(`${day}StartTime2`).value, end: document.getElementById(`${day}EndTime2`).value, type: document.getElementById(`${day}ShiftType2`).value },
        { start: document.getElementById(`${day}StartTime3`).value, end: document.getElementById(`${day}EndTime3`).value, type: document.getElementById(`${day}ShiftType3`).value },
        { start: document.getElementById(`${day}StartTime4`).value, end: document.getElementById(`${day}EndTime4`).value, type: document.getElementById(`${day}ShiftType4`).value }
    ];

    shifts.forEach(shift => {
        if (shift.start && shift.end) {
            const row = shiftTable.insertRow();
            row.dataset.day = day;
            row.innerHTML = `
                <td>${date}</td>
                <td>${shift.start}</td>
                <td>${shift.end}</td>
                <td>${calculateHours(shift.start, shift.end).toFixed(2)}</td>
                <td>${shift.type}</td>
            `;
            shiftTable.appendChild(row);
        }
    });

    updateTotals();
}

// Function to download the shift list as a PDF
function downloadPDF() {
    console.log("Attempting to download PDF");

    let shiftList = document.getElementById("shiftList");

    if (!shiftList) {
        console.error("Shift list container not found");
        return;
    }

    let options = {
        margin: 0.5,
        filename: 'Support_Worker_Timesheet.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(shiftList).save();
}
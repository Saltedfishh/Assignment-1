// --- Global State Variables ---
let timeBlocks = []; // Array to hold all task objects: [{name: 'Task 1', duration: 300, notes: []}, ...] (duration in seconds)
let currentBlockIndex = 0;
let timeRemaining = 0; // Time in seconds
let timerInterval = null;
let isRunning = false;
let isPaused = false;

// --- Feature 2 (Individual): Time Block Warning System ---
const WARNING_THRESHOLD_SECONDS = 60; // 1 minute warning
let warningAlerted = false; // Flag to ensure the warning only triggers once per block

// --- Feature 1 (Individual): Meeting Note Integration ---
let meetingNotes = []; // Stores all notes: [{blockIndex: 0, timeRemaining: 120, note: "Decision made"}, ...]

// --- Feature 3 (Individual): Dynamic Time Reallocation (Setup) ---
let timeBlocksContainer = null; // Reference to the list container for modification logic

// --- Basic Features (1, 2, 3) Implementation ---

/**
 * Adds a new task block to the timeBlocks array.
 */
function addTimeBlock(name = null, minutes = null) {
    const taskName = name || document.getElementById('taskNameInput').value.trim();
    const taskMinutes = minutes || parseInt(document.getElementById('taskMinutesInput').value);

    if (!taskName || isNaN(taskMinutes) || taskMinutes <= 0) {
        alert('Please enter a valid task name and minutes.');
        return;
    }

    const durationSeconds = taskMinutes * 60;
    // Initialize the notes array for the new block
    timeBlocks.push({ name: taskName, duration: durationSeconds, notes: [] }); 

    if (!name) { 
        document.getElementById('taskNameInput').value = '';
        document.getElementById('taskMinutesInput').value = '10';
    }

    renderTimeBlocks();
    updateTotalTime();
}

/**
 * Renders the list of time blocks in the UI.
 */
function renderTimeBlocks() {
    timeBlocksContainer = document.getElementById('timeBlocksList'); // Ensure the container is set
    timeBlocksContainer.innerHTML = ''; 

    timeBlocks.forEach((block, index) => {
        const minutes = Math.floor(block.duration / 60);
        const seconds = block.duration % 60;
        const timeStr = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const div = document.createElement('div');
        div.className = `time-block-item ${index === currentBlockIndex && isRunning ? 'current-block' : ''}`;
        div.id = `block-${index}`;

        // Add the 'modifiable' class for Feature 3 (Dynamic Reallocation) targetting
        if (index > currentBlockIndex && isRunning) {
             div.classList.add('modifiable-future-block');
        } else {
             div.classList.remove('modifiable-future-block');
        }

        div.innerHTML = `
            <span>${index + 1}. ${block.name}</span>
            <span class="block-duration">${timeStr}</span>
            <button onclick="removeTimeBlock(${index})" ${isRunning ? 'disabled' : ''}>X</button>
        `;
        timeBlocksContainer.appendChild(div);
    });
}
// ... (updateDisplay and updateTotalTime functions remain the same) ...

function updateDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = timeStr;
}

function updateTotalTime() {
    if (isRunning || isPaused) return;
    const totalDuration = timeBlocks.reduce((sum, block) => sum + block.duration, 0);
    updateDisplay(totalDuration);
}

function removeTimeBlock(index) {
    if (isRunning) {
        alert("Cannot remove task while the timer is running.");
        return;
    }
    timeBlocks.splice(index, 1);
    renderTimeBlocks();
    updateTotalTime();
}



function toggleTimer() {
    if (isRunning) {
        stopTimer();
    } else {
        if (timeBlocks.length === 0) {
            alert('Please add at least one time block to start the timer.');
            return;
        }
        
        currentBlockIndex = 0;
        isRunning = true;
        isPaused = false;
        warningAlerted = false; // Reset warning flag
        timeRemaining = timeBlocks[currentBlockIndex].duration;
        
        document.getElementById('startStopBtn').textContent = 'Stop Timer';
        document.getElementById('pauseResumeBtn').textContent = 'Pause';
        document.getElementById('pauseResumeBtn').style.display = 'inline-block';
        document.getElementById('modifyBtn').style.display = 'none'; 
        document.getElementById('noteSection').style.display = 'block'; // Show notes section
        
        startCountdown();
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    currentBlockIndex = 0;
    warningAlerted = false;
    
    document.getElementById('startStopBtn').textContent = 'Start Timer';
    document.getElementById('pauseResumeBtn').style.display = 'none';
    document.getElementById('modifyBtn').style.display = 'none';
    document.getElementById('noteSection').style.display = 'none'; // Hide notes section
    
    // Remove the warning class from the display
    document.getElementById('timerDisplay').classList.remove('warning-time');

    renderTimeBlocks(); 
    updateTotalTime(); 
}

function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    
    renderTimeBlocks(); 

    timerInterval = setInterval(() => {
        if (timeRemaining <= WARNING_THRESHOLD_SECONDS && !warningAlerted && timeRemaining > 0) {
            // Trigger visual warning
            document.getElementById('timerDisplay').classList.add('warning-time');
            console.log("TIME WARNING!");
            // Optional: Play a sound alert here
            warningAlerted = true;
        }

        if (timeRemaining <= 0) {
            // Block finished - Check if the warning was active and remove it
            document.getElementById('timerDisplay').classList.remove('warning-time');
            warningAlerted = false; // Reset flag for the next block

            // Move to the next block
            currentBlockIndex++;

            if (currentBlockIndex < timeBlocks.length) {
                timeRemaining = timeBlocks[currentBlockIndex].duration;
                renderTimeBlocks(); 
            } else {
                alert('All time blocks completed!');
                stopTimer();
                return;
            }
        }

        timeRemaining--;
        updateDisplay(timeRemaining);
    }, 1000); 
}

function pauseResumeTimer() {
    if (isPaused) {
        isPaused = false;
        document.getElementById('pauseResumeBtn').textContent = 'Pause';
        document.getElementById('modifyBtn').style.display = 'none'; 
        // Also hide the dynamic reallocation buttons
        hideDynamicReallocationInterface();
        startCountdown(); 
    } else {
        isPaused = true;
        clearInterval(timerInterval);
        document.getElementById('pauseResumeBtn').textContent = 'Resume';
        document.getElementById('modifyBtn').style.display = 'inline-block'; 
        // The dynamic reallocation interface can be shown via the Modify button
    }
}


// --- Feature 3 (Basic) Modification (Modified to integrate F3 Individual) ---

function showModifyInterface() {
    if (!isPaused || !isRunning) {
        alert("Modification is only allowed when the timer is paused.");
        return;
    }
    
    // Display the dynamic reallocation interface instead of a simple prompt
    showDynamicReallocationInterface();
}

/**
 * Basic Time Addition to Current Task (Part of Basic Feature 3)
 */
function basicAddTime(minutes) {
    const secondsToAdd = minutes * 60;
    timeRemaining += secondsToAdd;
    timeBlocks[currentBlockIndex].duration += secondsToAdd;
    
    updateDisplay(timeRemaining);
    renderTimeBlocks();
    alert(`Added ${minutes} minutes to the current task (${timeBlocks[currentBlockIndex].name}). Click Resume to continue.`);
}


// --- Feature 1 (Individual): Meeting Note Integration ---

/**
 * Saves a note with the current timestamp and task context.
 */
function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();

    if (!noteText) {
        alert("Please enter a note before saving.");
        return;
    }

    const currentTaskName = timeBlocks[currentBlockIndex].name;

    meetingNotes.push({
        blockIndex: currentBlockIndex,
        taskName: currentTaskName,
        timeRemaining: timeRemaining, // Remaining time when note was taken
        timestamp: new Date().toLocaleTimeString(),
        note: noteText
    });

    console.log("Note Saved:", meetingNotes[meetingNotes.length - 1]);
    
    // Clear input field after saving
    noteInput.value = '';
    
    // Optional: Add visual confirmation (e.g., flash the save button)
    alert(`Note saved for ${currentTaskName} at ${Math.floor(timeRemaining/60)}:${String(timeRemaining%60).padStart(2, '0')}.`);
}


// --- Feature 3 (Individual): Dynamic Time Reallocation ---

/**
 * Shows the interface for dynamic reallocation.
 */
function showDynamicReallocationInterface() {
    // 1. Show a basic input for adding time to the current task (Basic F3 enhancement)
    const currentTaskName = timeBlocks[currentBlockIndex].name;
    const interfaceContainer = document.getElementById('reallocationInterface');
    
    interfaceContainer.innerHTML = `
        <p><strong>Current Task:</strong> ${currentTaskName}</p>
        <hr>
        <h4>1. Quick Add to Current Task (Basic F3)</h4>
        <button onclick="basicAddTime(5)">+ 5 Min</button>
        <button onclick="basicAddTime(10)">+ 10 Min</button>
        
        <h4 style="margin-top: 15px;">2. Dynamic Reallocation (Individual F3)</h4>
        <p>Borrow time from a future task:</p>
        <div id="reallocationList">
            </div>
        <button onclick="pauseResumeTimer()">Close / Resume</button>
    `;

    interfaceContainer.style.display = 'block';
    
    // 2. Populate the reallocation list with future tasks
    const reallocationList = document.getElementById('reallocationList');
    reallocationList.innerHTML = '';
    
    timeBlocks.forEach((block, index) => {
        if (index > currentBlockIndex) {
            const minutes = Math.floor(block.duration / 60);
            if (minutes > 0) { // Only allow borrowing from tasks with duration > 0
                const item = document.createElement('div');
                item.className = 'reallocation-item';
                item.innerHTML = `
                    <span>${index + 1}. ${block.name} (${minutes} min)</span>
                    <button onclick="promptBorrowTime(${index})">Borrow</button>
                `;
                reallocationList.appendChild(item);
            }
        }
    });
}

/**
 * Hides the interface for dynamic reallocation.
 */
function hideDynamicReallocationInterface() {
    document.getElementById('reallocationInterface').style.display = 'none';
}

/**
 * Prompts user for time to borrow and executes the transfer.
 * @param {number} sourceIndex - Index of the future task to borrow from.
 */
function promptBorrowTime(sourceIndex) {
    const sourceTask = timeBlocks[sourceIndex];
    const sourceMinutes = Math.floor(sourceTask.duration / 60);

    const minutesToBorrow = parseInt(prompt(`Borrow how many minutes from "${sourceTask.name}" (Max: ${sourceMinutes} min)?`));

    if (isNaN(minutesToBorrow) || minutesToBorrow <= 0 || minutesToBorrow > sourceMinutes) {
        alert("Invalid amount or exceeds available time in the source task.");
        return;
    }
    
    // Execute transfer
    const secondsToBorrow = minutesToBorrow * 60;

    // 1. Decrease the source task's duration
    sourceTask.duration -= secondsToBorrow;

    // 2. Increase the current task's remaining time AND original duration
    timeRemaining += secondsToBorrow;
    timeBlocks[currentBlockIndex].duration += secondsToBorrow;

    // 3. Update UI and alert
    updateDisplay(timeRemaining);
    renderTimeBlocks(); // Re-render the main list to update task durations
    showDynamicReallocationInterface(); // Re-render the reallocation list

    alert(`Transferred ${minutesToBorrow} minutes from ${sourceTask.name} to the current task.`);
}

// --- Feature 2 (Basic) Modification: Export/Import CSV ---
// Modified export function to include notes array (though notes are complex to handle in simple CSV)

function exportBlocks() {
    let csvContent = "TaskName,Duration(Minutes)\n"; // Keeping CSV simple for this example

    timeBlocks.forEach(block => {
        const minutes = block.duration / 60;
        csvContent += `${block.name.replace(/,/g, '')},${minutes}\n`; // Basic sanitization
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "timeblocks_agenda.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ... (importBlocks function remains the same) ...
function importBlocks(event) {
    if (isRunning) {
        alert("Cannot import blocks while the timer is running. Please stop the timer first.");
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        timeBlocks = [];
        
        for (let i = 1; i < lines.length; i++) {
            const [name, minutesStr] = lines[i].split(',');
            const minutes = parseFloat(minutesStr);
            
            if (name && !isNaN(minutes) && minutes > 0) {
                addTimeBlock(name.trim(), minutes);
            }
        }
        
        renderTimeBlocks();
        updateTotalTime();
        alert(`Successfully imported ${timeBlocks.length} time blocks.`);
    };

    reader.readAsText(file);
}
// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    addTimeBlock("Project Overview", 5); 
    addTimeBlock("Feature Discussion", 10);
    addTimeBlock("Action Items", 5);

    updateTotalTime(); 
});
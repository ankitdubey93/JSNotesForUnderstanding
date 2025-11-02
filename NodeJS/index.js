const express = require('express');
const path = require("path");
const fs = require('fs');
const multer = require('multer');



const app = express();
const PORT = 3000;


const uploadDIR = path.join(__dirname, 'uploads');


// -- 1. File Upload Setup (using Multer)...

// Create the uploads directory if it doesn't exist

if(!fs.existsSync(uploadDIR)) {
    fs.mkdirSync(uploadDIR);
    console.log(`Created director: ${uploadDIR}`);
}

// Multer storage configuration: saving files to disk
// This logic defines WHERE and under WHAT NAME the Writable Stream should save the file.

const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        // Multer creates the fs.createWriteStream here, using uploadDIR.
        cb(null, uploadDIR);

    },

    filename: function (req,file,cb) {
        // Create a unqiue filename to prevent collisions.

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.round() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));

    }

});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }  // We have set a 10MB Limit



});


// ---2. HTML Client Generation (Served from the server)

function generateHtml (files = []) {
    const fileListHtml = files.map(file => ` <li class="p-2 bg-white/10 rounded-lg flex justify-between items-center mb-2">
            <span class="text-white font-mono text-sm break-all">${file}</span>
            <a href="/download/${file}" class="ml-4 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full transition duration-150 shadow-md" download>
                Download
            </a>
        </li>
    `).join('');
     return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Node.js Express File Demo (Using Multer)</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Inter', sans-serif; }
        </style>
    </head>
    <body class="bg-gray-900 min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div class="w-full max-w-2xl bg-gray-800 p-6 sm:p-10 rounded-xl shadow-2xl">
            <h1 class="text-3xl font-extrabold text-white mb-6 border-b border-gray-700 pb-3">
                Express File Stream Demo (Using Multer)
            </h1>

            <!-- File Upload Section -->
            <section class="mb-8 bg-gray-700 p-6 rounded-lg">
                <h2 class="text-xl font-semibold text-white mb-4">Upload File (Multer Middleware - Uses Streams)</h2>
                <form action="/upload" method="post" enctype="multipart/form-data" class="space-y-4">
                    <input type="file" name="uploaded_file" required class="w-full p-2 border border-gray-600 rounded-lg text-white bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100">
                    <button type="submit" class="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition duration-150 shadow-md">
                        Upload
                    </button>
                </form>
            </section>

            <!-- File List/Download Section -->
            <section class="bg-gray-700 p-6 rounded-lg">
                <h2 class="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                    Available Downloads (res.download - Uses Streams)
                </h2>
                <ul id="file-list" class="space-y-2">
                    ${fileListHtml || '<li class="text-gray-400">No files uploaded yet.</li>'}
                </ul>
            </section>
        </div>

        <script>
            // Simple success message logic after POST redirect
            document.addEventListener('DOMContentLoaded', () => {
                const urlParams = new URLSearchParams(window.location.search);
                const status = urlParams.get('status');
                const message = urlParams.get('message');
                const container = document.querySelector('.w-full.max-w-2xl');

                if (status === 'success' && message) {
                    const alertHtml = \`
                        <div class="fixed top-4 left-1/2 -translate-x-1/2 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50">
                            \${decodeURIComponent(message)}
                        </div>
                    \`;
                    container.insertAdjacentHTML('beforebegin', alertHtml);
                    setTimeout(() => {
                        const alert = document.querySelector('.fixed.top-4');
                        if (alert) alert.remove();
                        // Clean up URL parameters after showing message
                        window.history.replaceState(null, null, window.location.pathname);
                    }, 5000);
                }
            });
        </script>
    </body>
    </html>
    `;
}

// GET / - Serve the main page and list files
app.get('/', async (req, res) => {
    try {
        const files = await fs.promises.readdir(uploadDIR);
        res.send(generateHtml(files));
    } catch (error) {
        // If directory doesn't exist (shouldn't happen here) or other errors
        console.error("Error reading directory:", error);
        res.status(500).send(generateHtml([]));
    }
});

// POST /upload - Handle file upload using Multer middleware
app.post('/upload', upload.single('uploaded_file'), (req, res) => {
    // Multer (the middleware) handles parsing the incoming HTTP request stream,
    // managing the disk storage, and handling backpressure.
    // By the time this function executes, the file is already written to disk.
    
    if (!req.file) {
        return res.redirect('/?status=error&message=' + encodeURIComponent('No file selected for upload.'));
    }

    console.log('File uploaded successfully:', req.file.filename);

    const message = `File uploaded using Multer! Stored as: ${req.file.filename}`;
    res.redirect('/?status=success&message=' + encodeURIComponent(message));
});


// GET /download/:filename - Handle file download (remains stream-based)
app.get('/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(uploadDIR, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Error: File not found.');
    }

    // res.download() internally creates an fs.createReadStream(filePath) (a Readable Stream)
    // and pipes its content directly to the response object (a Writable Stream).
    console.log(`Starting stream download for: ${fileName}`);
    res.download(filePath, fileName, (err) => {
        if (err) {
            // Error handling for download interruption
            console.error(`Download failed for ${fileName}:`, err);
            if (!res.headersSent) {
                res.status(500).send('Could not complete download.');
            }
        } else {
            console.log(`Download successful for: ${fileName}`);
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`To run this: 
                 1. Install dependencies: npm install express multer
                 2. Save the code as server.js
                 3. Run: node server.js`);
});

/**
 * AI Road Safety Analyzer — Frontend Controller
 * Handles image selection, previewing, API communication, and dynamic results visualization.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const chooseBtn = document.getElementById('choose-btn');
    const dropPrompt = document.getElementById('drop-prompt');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const previewFilename = document.getElementById('preview-filename');
    const changeImageBtn = document.getElementById('change-image-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const alertBox = document.getElementById('alert-box');
    const sampleBtns = document.querySelectorAll('.sample-btn');

    // Results Elements
    const resultsSection = document.getElementById('results-section');
    const safetyBanner = document.getElementById('safety-banner');
    const safetyBadge = document.getElementById('safety-badge');
    const safetyHeadline = document.getElementById('safety-headline');
    const safetyReasons = document.getElementById('safety-reasons');
    const pedAlertBanner = document.getElementById('pedestrian-alert-banner');
    const pedAlertMsg = document.getElementById('ped-alert-msg');
    
    const resultOriginalImg = document.getElementById('result-original-img');
    const resultAnalyzedImg = document.getElementById('result-analyzed-img');
    
    const statVehicles = document.getElementById('stat-vehicles');
    const statPedestrians = document.getElementById('stat-pedestrians');
    const statSigns = document.getElementById('stat-signs');
    const statMarkings = document.getElementById('stat-markings');
    const statCalibration = document.getElementById('stat-calibration');
    
    const roadSignContent = document.getElementById('road-sign-content');
    const occlusionContent = document.getElementById('occlusion-content');
    const perfTime = document.getElementById('perf-time');
    const perfObjects = document.getElementById('perf-objects');

    // Navigation items
    const navHomeBtn = document.getElementById('nav-home-btn');
    const navAboutBtn = document.getElementById('nav-about-btn');

    // State
    let selectedFile = null;
    let selectedSample = null;

    // 1. Navigation handling
    navHomeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navHomeBtn.classList.add('active');
        navAboutBtn.classList.remove('active');
        document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
    });

    navAboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navAboutBtn.classList.add('active');
        navHomeBtn.classList.remove('active');
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });

    // 2. File Selection & Drag-and-Drop
    chooseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener('click', () => {
        if (!selectedFile && !selectedSample) {
            fileInput.click();
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    changeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    // 3. Quick Sample Selection
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sampleName = btn.getAttribute('data-sample');
            handleSampleSelect(sampleName, btn.textContent);
        });
    });

    function handleFileSelect(file) {
        hideAlert();
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showAlert('Please select a valid image format (JPG, JPEG, or PNG).');
            return;
        }

        selectedFile = file;
        selectedSample = null;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewFilename.textContent = file.name;
            dropPrompt.style.display = 'none';
            previewContainer.style.display = 'flex';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function handleSampleSelect(sampleName, label) {
        hideAlert();
        selectedFile = null;
        selectedSample = sampleName;
        fileInput.value = '';

        previewImage.src = `/static/samples/${sampleName}`;
        previewFilename.textContent = `Sample: ${label}`;
        dropPrompt.style.display = 'none';
        previewContainer.style.display = 'flex';
        analyzeBtn.disabled = false;
    }

    function resetUpload() {
        selectedFile = null;
        selectedSample = null;
        fileInput.value = '';
        dropPrompt.style.display = 'block';
        previewContainer.style.display = 'none';
        previewImage.src = '';
        analyzeBtn.disabled = true;
        hideAlert();
    }

    function showAlert(message) {
        alertBox.textContent = message;
        alertBox.className = 'alert-box alert-error';
        alertBox.style.display = 'block';
    }

    function hideAlert() {
        alertBox.style.display = 'none';
    }

    // 4. Image Analysis Dispatch
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile && !selectedSample) {
            showAlert('Please select or upload a road image first.');
            return;
        }

        hideAlert();
        setLoading(true);

        const formData = new FormData();
        if (selectedFile) {
            formData.append('image', selectedFile);
        } else if (selectedSample) {
            formData.append('sample_name', selectedSample);
        }

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Server processing failed.');
            }

            renderResults(data);
        } catch (err) {
            showAlert(err.message || 'An error occurred while analyzing the image. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            analyzeBtn.disabled = true;
            btnText.textContent = 'Processing Computer Vision Pipeline...';
            btnSpinner.style.display = 'inline-block';
        } else {
            analyzeBtn.disabled = false;
            btnText.textContent = 'Analyze Image';
            btnSpinner.style.display = 'none';
        }
    }

    // 5. Render Results Function
    function renderResults(data) {
        // A. Safety Status Banner
        const safety = data.safety_assessment;
        safetyBadge.textContent = safety.level;
        safetyHeadline.textContent = safety.headline;
        
        safetyBanner.className = 'safety-banner';
        if (safety.level === 'SAFE') {
            safetyBanner.classList.add('safe');
        } else if (safety.level === 'CAUTION') {
            safetyBanner.classList.add('caution');
        } else {
            safetyBanner.classList.add('high-risk');
        }

        // Reasons List
        safetyReasons.innerHTML = '';
        if (safety.reasons && safety.reasons.length > 0) {
            safety.reasons.forEach(r => {
                const li = document.createElement('li');
                li.textContent = r;
                safetyReasons.appendChild(li);
            });
        }

        // B. Pedestrian Hazard Alert Banner
        if (data.pedestrian_safety && data.pedestrian_safety.alert_active) {
            pedAlertBanner.style.display = 'flex';
            pedAlertMsg.textContent = data.pedestrian_safety.alert_message;
        } else {
            pedAlertBanner.style.display = 'none';
        }

        // C. Visual Image Comparison
        resultOriginalImg.src = data.original_image_url;
        resultAnalyzedImg.src = data.analyzed_image_url;

        // D. Detection Summary Table
        statVehicles.textContent = data.statistics.vehicles;
        statPedestrians.textContent = data.statistics.pedestrians;
        statSigns.textContent = data.statistics.road_signs;
        statMarkings.textContent = data.statistics.road_markings;
        statCalibration.textContent = data.camera_calibration.status;

        // E. Road Sign Recognition Box
        if (data.road_signs && data.road_signs.detected && data.road_signs.items.length > 0) {
            let signsHtml = '';
            data.road_signs.items.forEach(sign => {
                signsHtml += `
                    <div class="sign-badge-item">
                        <div>
                            <strong>${sign.label}</strong>
                            <div class="text-muted" style="font-size:0.75rem;">${sign.action}</div>
                        </div>
                        <span class="preview-tag font-bold">${sign.confidence}</span>
                    </div>
                `;
            });
            roadSignContent.innerHTML = signsHtml;
        } else {
            roadSignContent.innerHTML = `<p class="text-muted">No clearly visible road sign detected.</p>`;
        }

        // F. Occlusion Consideration Box
        if (data.occlusion_analysis && data.occlusion_analysis.detected) {
            let occHtml = `
                <div style="color:#92400e; font-weight:600; margin-bottom:0.25rem;">
                    ⚠ Possible Object Occlusion (${data.occlusion_analysis.count} detected)
                </div>
            `;
            data.occlusion_analysis.items.forEach(item => {
                occHtml += `
                    <div class="sign-badge-item" style="font-size:0.8rem;">
                        <span>${item.obj1} & ${item.obj2}</span>
                        <span class="preview-tag">${item.overlap_percent}% overlap</span>
                    </div>
                `;
            });
            occHtml += `<div class="text-muted" style="font-size:0.75rem; margin-top:0.4rem;">
                Note: Single-frame overlap detected. Full temporal tracking is considered for future video-based extensions.
            </div>`;
            occlusionContent.innerHTML = occHtml;
        } else {
            occlusionContent.innerHTML = `
                <p class="text-muted">No spatial bounding box overlaps detected.</p>
                <div class="text-muted" style="font-size:0.75rem; margin-top:0.3rem;">
                    Multi-object tracking & temporal re-identification are designed for video pipelines.
                </div>
            `;
        }

        // G. Performance Information
        perfTime.textContent = `${data.performance.processing_time_seconds} s`;
        perfObjects.textContent = data.performance.objects_detected;

        // Show Results Section and scroll smoothly
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

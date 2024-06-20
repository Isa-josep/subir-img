document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileDescription = document.getElementById('fileDescription');
    const fileList = document.getElementById('fileList');
    const uploadButton = document.getElementById('uploadButton');
    const clearButton = document.getElementById('clearButton');

    let filesToUpload = [];
    let userLocation = 'No especificada';

    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = `${position.coords.latitude},${position.coords.longitude}`;
        }, (error) => {
            console.error('Error getting location:', error);
        });
    } else {
        console.log('Geolocation is not supported by this browser.');
    }

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFiles);

    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        handleFiles({ target: { files } });
    });

    function handleFiles(event) {
        const files = event.target.files;
        filesToUpload = [...filesToUpload, ...[...files].filter(file => file.type.startsWith('image/'))];
        renderFileList();
    }

    function renderFileList() {
        fileList.innerHTML = ''; // Clear the list
        filesToUpload.forEach((file, index) => {
            const listItem = document.createElement('div');
            listItem.classList.add('file-item');
            
            const fileName = document.createElement('span');
            fileName.classList.add('file-name');
            fileName.textContent = file.name;

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                listItem.appendChild(img);
            }

            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                filesToUpload.splice(index, 1);
                renderFileList();
            });

            listItem.appendChild(fileName);
            listItem.appendChild(removeButton);
            fileList.appendChild(listItem);
        });
    }

    uploadButton.addEventListener('click', () => {
        if (filesToUpload.length > 0) {
            const description = fileDescription.value;
            filesToUpload.forEach(file => {
                uploadFile(file, description);
            });
        } else {
            alert('No files selected for upload');
        }
    });

    clearButton.addEventListener('click', () => {
        filesToUpload = [];
        renderFileList();
    });

    function uploadFile(file, description) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('descripcion', description);
        formData.append('ubicacion', userLocation);

        fetch('http://localhost:3000/upload', { // Asegúrate de que la URL y el puerto coinciden con tu servidor Node.js
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

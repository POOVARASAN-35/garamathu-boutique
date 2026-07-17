import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, X, Edit, Trash2, GripHorizontal, AlertTriangle } from 'lucide-react';

export default function ImageUpload({ 
  images, 
  setImages, 
  productName, 
  token, 
  addToast, 
  maxImages = 10, 
  uploadType = 'product', 
  entityName = '' 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [replaceIndex, setReplaceIndex] = useState(null);

  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Validate single file format & size
  const validateFile = (file) => {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return `❌ Only JPG, PNG, and WEBP files are allowed.`;
    }
    if (file.size > 5 * 1024 * 1024) {
      return `❌ Image size cannot exceed 5MB.`;
    }
    return null;
  };

  // Convert image to WebP and compress
  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(webpFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          }, 'image/webp', 0.85); // Compress at 85% quality
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // XMLHttpRequest based upload to track upload progress
  const uploadFilesWithProgress = (filesList, nameVal, authToken, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      if (uploadType === 'category') {
        formData.append('categoryName', nameVal);
      } else {
        formData.append('productName', nameVal);
      }
      
      filesList.forEach(file => {
        formData.append('images', file);
      });

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (err) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.message || 'Upload failed'));
          } catch (err) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      const uploadUrl = uploadType === 'category'
        ? `http://localhost:5000/api/upload/category-images?categoryName=${encodeURIComponent(nameVal)}`
        : 'http://localhost:5000/api/upload/product-images';

      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      xhr.send(formData);
    });
  };

  // Process selected files, validate, compress and upload
  const processAndUploadFiles = async (filesList, isReplacement = false, targetIdx = null) => {
    if (!filesList || filesList.length === 0) return;

    const nameVal = entityName || productName || 'temp';

    if (!isReplacement && images.length + filesList.length > maxImages) {
      addToast(`❌ You can upload a maximum of ${maxImages} images.`, 'warning');
      return;
    }

    // Validate
    const errors = [];
    const validFiles = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      addToast(errors[0], 'error');
      if (validFiles.length === 0) return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress & Convert WebP on the fly
      const processedFiles = await Promise.all(
        validFiles.map(file => convertToWebP(file).catch(err => {
          console.warn('WebP compression failed, using original file:', err);
          return file; // fallback
        }))
      );

      // Perform request
      const response = await uploadFilesWithProgress(
        processedFiles,
        nameVal,
        token,
        (percent) => setUploadProgress(percent)
      );

      if (response.success && response.paths) {
        addToast(response.message || '✅ Images uploaded successfully.', 'success');
        
        if (isReplacement && targetIdx !== null) {
          const updated = [...images];
          updated[targetIdx] = response.paths[0];
          setImages(updated);
        } else {
          setImages([...images, ...response.paths]);
        }
      } else {
        addToast(response.message || 'Upload failed.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setReplaceIndex(null);
    }
  };

  // Drag Zone events
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOverDropZone = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processAndUploadFiles(files);
  };

  // Input file selectors triggers
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processAndUploadFiles(files);
  };

  // Replace file handlers
  const triggerReplace = (idx) => {
    setReplaceIndex(idx);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && replaceIndex !== null) {
      processAndUploadFiles([files[0]], true, replaceIndex);
    }
    e.target.value = ''; // Reset input
  };

  // Delete handlers
  const promptDelete = (idx) => {
    setDeleteIndex(idx);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updated = images.filter((_, idx) => idx !== deleteIndex);
      setImages(updated);
      addToast('Image removed from listing.', 'info');
      setDeleteIndex(null);
    }
  };

  // HTML5 Drag & Drop sorting handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedImages = [...images];
    const draggedItem = reorderedImages[draggedIndex];

    reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setImages(reorderedImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const borderVariants = {
    idle: { borderColor: "rgba(202, 138, 4, 0.2)", backgroundColor: "rgba(251, 248, 240, 0.4)", scale: 1 },
    dragActive: { borderColor: "#c23d17", backgroundColor: "rgba(194, 61, 23, 0.05)", scale: 1.01, boxShadow: "0 0 15px rgba(194, 61, 23, 0.15)" }
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag/Drop area */}
      {images.length < maxImages && (
        <motion.div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOverDropZone}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          animate={isDragging ? "dragActive" : "idle"}
          variants={borderVariants}
          transition={{ duration: 0.2 }}
          className="w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 glass-card"
        >
          <div className="w-12 h-12 bg-gold-500/10 text-gold-600 rounded-full flex items-center justify-center mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950">
            Drag & Drop {uploadType === 'category' ? 'Category' : 'Product'} Images
          </span>
          <span className="text-[10px] text-gold-600 font-semibold my-0.5">OR</span>
          <span className="text-xs font-extrabold text-wine-accent hover:underline">Click to Browse Files</span>
          <div className="mt-4 text-[9px] text-gray-400 font-extrabold uppercase tracking-widest space-y-0.5 text-center">
            <div>JPG • PNG • WEBP</div>
            <div>Maximum {maxImages} Images</div>
            <div>Maximum File Size 5MB Each</div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
          />
        </motion.div>
      )}

      {/* Progress animation */}
      {isUploading && (
        <div className="w-full bg-white border border-gold-500/10 rounded-xl p-4 space-y-2 shadow-sm">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-950">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-wine-accent animate-ping" />
              Uploading and compressing...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-wine-accent to-gold-500" 
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Hidden file input for Replace */}
      <input
        type="file"
        ref={replaceFileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleReplaceSelect}
      />

      {/* Image Preview responsive grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div
                key={img + idx}
                layout
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-white border rounded-xl overflow-hidden shadow-sm aspect-square flex flex-col justify-between transition-all duration-300 ${
                  draggedIndex === idx ? 'opacity-40 border-wine-accent border-2 scale-95' : 'border-gold-500/10 hover:shadow-md hover:border-gold-500/20'
                }`}
              >
                <div className="relative w-full flex-1 bg-sand-50 overflow-hidden select-none">
                 <img
                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                    alt={`${uploadType === 'category' ? 'Category' : 'Product'} image ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  
                  {/* Cover Image Badge */}
                  {idx === 0 ? (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-gold-500 to-amber-500 text-white font-montserrat font-bold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                      <span>⭐</span> Cover Image
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white/80 font-montserrat font-bold text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Image {idx + 1}
                    </div>
                  )}

                  {/* Drag reorder handle */}
                  <div className="absolute top-2 right-2 bg-white/90 hover:bg-white text-emerald-950 p-1.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" title="Drag to reorder">
                    <GripHorizontal className="w-3 h-3 text-gold-600" />
                  </div>
                </div>

                {/* Control Actions footer */}
                <div className="bg-sand-50/50 border-t border-gold-500/5 p-2 flex justify-between items-center text-[9px] font-bold text-gray-500">
                  <button
                    type="button"
                    onClick={() => triggerReplace(idx)}
                    className="flex items-center gap-1 hover:text-emerald-950 transition-colors uppercase tracking-wider"
                  >
                    <Edit className="w-2.5 h-2.5 text-gold-600" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => promptDelete(idx)}
                    className="flex items-center gap-1 text-wine-accent hover:text-red-700 transition-colors uppercase tracking-wider"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setDeleteIndex(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-sm w-full bg-white rounded-2xl border border-gold-500/20 p-6 text-center shadow-luxury z-10 space-y-4"
            >
              <div className="w-10 h-10 bg-wine-accent/5 text-wine-accent rounded-full flex items-center justify-center mx-auto border border-wine-accent/15">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-playfair text-base font-bold text-emerald-950">Delete Image?</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Are you sure you want to delete this image? This action cannot be undone.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteIndex(null)}
                  className="px-4 py-2 border border-gold-500/10 text-emerald-950 text-xs font-bold rounded-xl hover:bg-sand-50 transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-wine-accent text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm uppercase tracking-wider"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

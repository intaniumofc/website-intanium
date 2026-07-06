'use client';

import * as React from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";

export const FileUploadCard = React.forwardRef(
  ({ className, files = [], onFilesChange, onFileRemove, onClose, accept = "image/*", multiple = true, maxFileSize = 50 * 1024 * 1024, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef(null);

    // Handler for drag enter event
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    // Handler for drag leave event
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    // Handler for drag over event
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Helper to validate and filter files
    const validateFiles = (fileList) => {
      return fileList.filter(file => {
        if (file.size > maxFileSize) {
          alert(`File ${file.name} melebihi ukuran maksimal ${formatFileSize(maxFileSize)}.`);
          return false;
        }
        return true;
      });
    };

    // Handler for drop event
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      let droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles && droppedFiles.length > 0) {
        droppedFiles = validateFiles(droppedFiles);
        if (droppedFiles.length > 0) {
          if (!multiple) {
            onFilesChange([droppedFiles[0]]);
          } else {
            onFilesChange(droppedFiles);
          }
        }
      }
    };

    // Handler for file input change
    const handleFileSelect = (e) => {
      let selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        selectedFiles = validateFiles(selectedFiles);
        if (selectedFiles.length > 0) {
          if (!multiple) {
            onFilesChange([selectedFiles[0]]);
          } else {
            onFilesChange(selectedFiles);
          }
        }
      }
    };

    // Trigger file input click
    const triggerFileSelect = () => fileInputRef.current?.click();

    // Format file size for display
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 KB";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    
    // Animation variants for Framer Motion
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };
    
    const fileItemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    };

    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="p-6 text-left">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <UploadCloud className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Upload files</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select and upload the files of your choice
                </p>
              </div>
            </div>
            {onClose && (
               <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={onClose} type="button">
                 <X className="w-4 h-4" />
               </Button>
            )}
          </div>

          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={cn(
              "mt-6 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 cursor-pointer",
              isDragging
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                : "border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={accept}
              className="hidden"
              onChange={handleFileSelect}
            />
            <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-4" />
            <p className="font-semibold text-slate-850 dark:text-slate-200 text-sm">Choose a file or drag & drop it here.</p>
            <p className="text-xs text-slate-500 mt-1.5">
              JPEG, PNG, PDF, WEBP, or MP4 formats, up to {formatFileSize(maxFileSize)}.
            </p>
            <Button variant="outline" size="sm" className="mt-4 pointer-events-none" type="button">
              Browse File
            </Button>
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
            <ul className="space-y-4">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.li
                    key={file.id}
                    variants={fileItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                    className="flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 shrink-0">
                        {file.file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "FILE"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-xs">{file.file.name}</p>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
                          {file.status === "uploading" && (
                            <span>{formatFileSize((file.file.size * file.progress) / 100)} of {formatFileSize(file.file.size)}</span>
                          )}
                          {(file.status === "completed" || file.status === "error") && (
                            <span>{formatFileSize(file.file.size)}</span>
                          )}
                          <span className="mx-0.5">•</span>
                          <span className={cn(
                             {"text-purple-600 font-semibold": file.status === 'uploading'},
                             {"text-emerald-600 font-semibold": file.status === 'completed'},
                             {"text-red-500 font-semibold": file.status === 'error'}
                          )}>
                            {file.status === 'uploading' ? `Uploading...` : file.status === 'error' ? 'Failed' : 'Completed'}
                          </span>
                        </div>
                        {file.status === 'uploading' && <Progress value={file.progress} className="h-1 mt-1.5" />}
                      </div>
                    </div>
                    
                     <div className="flex items-center gap-2 shrink-0">
                        {file.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => onFileRemove(file.id)} type="button">
                           {file.status === 'completed' ? <Trash2 className="w-4 h-4 text-red-500" /> : <X className="w-4 h-4" />}
                        </Button>
                     </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </motion.div>
    );
  }
);
FileUploadCard.displayName = "FileUploadCard";

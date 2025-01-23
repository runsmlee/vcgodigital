'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, FileText, Send, File, Loader2, AlertCircle } from 'lucide-react';
import { Card, Text, Title, Button } from '@tremor/react';
import type { AnalysisInput } from '@/types/analysis';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AnalysisInput>();
  const router = useRouter();

  const resetForm = () => {
    setError(false);
    reset();
    setSelectedFile(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setValue('File', [file] as unknown as FileList);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, [setValue]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: AnalysisInput) => {
    try {
      setIsUploading(true);
      
      if (!selectedFile) {
        throw new Error('No file selected');
      }

      const formData = new FormData();
      formData.append('Startup Name', data['Startup Name']);
      formData.append('Email to receive the evaluation result', data['Email to receive the evaluation result']);
      formData.append('File', selectedFile);
      formData.append('submittedAt', new Date().toISOString());
      formData.append('formMode', 'test');

      console.log('Uploading file:', selectedFile.name);
      console.log('FormData:', Object.fromEntries(formData.entries()));

      const response = await fetch('https://n8n-qnj8.onrender.com/webhook/pitchdeck-analyzer', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error:', errorText);
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      const analysisResult = Array.isArray(result) ? result[0].output : result;
      
      if (analysisResult) {
        localStorage.setItem('analysisResult', JSON.stringify(analysisResult));
        router.push(`/analysis/${data['Startup Name']}`);
      } else {
        throw new Error('Invalid analysis result received');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <Text className="text-muted-foreground">Analyzing...</Text>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <Title className="text-xl font-semibold">Analysis Failed</Title>
              <Text className="text-muted-foreground">Please try again later.</Text>
              <Button onClick={resetForm} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Title className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Pitch Deck Analyzer
            </Title>
            <Text className="text-lg text-muted-foreground">
              Get professional analysis of your startup pitch deck in minutes
            </Text>
          </motion.div>

          <Card className="p-6 sm:p-8 bg-gradient-to-br from-background to-muted/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Startup Name
                </label>
                <input
                  {...register("Startup Name", { required: "Startup name is required" })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent/50 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter your startup name"
                />
                {errors["Startup Name"] && (
                  <p className="text-destructive text-sm mt-1">{errors["Startup Name"].message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  {...register("Email to receive the evaluation result", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent/50 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter your email"
                  type="email"
                />
                {errors["Email to receive the evaluation result"] && (
                  <p className="text-destructive text-sm mt-1">{errors["Email to receive the evaluation result"].message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pitch Deck (PDF)
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 rounded-lg transition-all duration-200 ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-input border-dashed hover:border-primary'
                  }`}
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <File className="mx-auto h-12 w-12 text-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setValue('File', new DataTransfer().files);
                          }}
                          className="mt-2 text-sm text-destructive hover:text-destructive/90 transition-colors"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className={`mx-auto h-12 w-12 transition-colors ${
                          isDragging ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div className="flex text-sm text-muted-foreground">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf"
                              {...register("File", {
                                required: "Pitch deck file is required"
                              })}
                              onChange={handleFileInput}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-muted-foreground">PDF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.File && (
                  <p className="text-destructive text-sm mt-1">{errors.File.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                disabled={!selectedFile || isUploading}
              >
                <div className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  Analyze Pitch Deck
                </div>
              </Button>
            </form>
          </Card>

          <footer className="mt-8 text-center">
            <Text className="text-sm text-muted-foreground">
              This service uses AI to analyze pitch decks. The analysis provided should be used for reference purposes only.
            </Text>
            <Text className="text-sm text-muted-foreground mt-2">
              This is Beta.
            </Text>
          </footer>
        </div>
      </main>
    </>
  );
}

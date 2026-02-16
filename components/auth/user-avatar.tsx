'use client';

import { useRef } from 'react';
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload';
import { useAuthStore } from '@/lib/stores/auth-store';
import { User, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function UserAvatar({ className, size = 'md', editable = false }: UserAvatarProps) {
  const { user } = useAuthStore();
  const { uploadAvatar, isUploading, error } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (editable && !isUploading) {
      e.stopPropagation();
      console.log('📸 [AVATAR] Click detected, opening hidden input');
      fileInputRef.current?.click();
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-20 w-20 rounded-[2rem]',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-10 w-10',
  };

  return (
    <div 
      className={cn(
        'relative group overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all',
        sizeClasses[size],
        editable && 'cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 dark:hover:ring-offset-slate-950',
        className
      )}
      onClick={handleClick}
    >
      {user?.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt={user.display_name || 'User'}
          fill
          className="object-cover"
        />
      ) : (
        <User className={cn('text-slate-400', iconSizes[size])} />
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        </div>
      )}

      {editable && !isUploading && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Camera className="h-4 w-4 text-white" />
        </div>
      )}

      {error && (
        <div className="absolute top-0 right-0 bg-rose-500 rounded-full h-3 w-3 border-2 border-white dark:border-slate-900" title={error} />
      )}

      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
          accept="image/*"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

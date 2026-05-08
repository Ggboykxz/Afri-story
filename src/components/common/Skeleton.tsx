import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton = ({ className = '', variant = 'rect' }: SkeletonProps) => {
  const baseClasses = "bg-white/5 animate-pulse";
  const variantClasses = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const WorkCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[2/3] w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
  </div>
);

export const ForumThreadSkeleton = () => (
  <div className="p-6 rounded-2xl border border-white/5 flex gap-6 items-center">
    <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
    <div className="flex-1 space-y-3">
      <Skeleton variant="text" className="w-2/3 h-5" />
      <Skeleton variant="text" className="w-1/3 h-3" />
    </div>
    <Skeleton className="w-16 h-10" />
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row items-center gap-8">
      <Skeleton variant="circle" className="w-32 h-32" />
      <div className="flex-1 space-y-4 text-center md:text-left">
        <Skeleton variant="text" className="w-48 h-10 mx-auto md:mx-0" />
        <Skeleton variant="text" className="w-32 h-4 mx-auto md:mx-0" />
        <div className="flex gap-4 justify-center md:justify-start">
          <Skeleton className="w-24 h-8 rounded-full" />
          <Skeleton className="w-24 h-8 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

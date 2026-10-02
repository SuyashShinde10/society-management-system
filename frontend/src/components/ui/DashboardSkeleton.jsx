import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Common Skeleton Theme matching Awaastech's warm cream design system
 * Base: #EFECE6 / Highlight: #F9F8F3
 */
export const SocietySkeletonTheme = ({ children }) => (
  <SkeletonTheme baseColor="#EAE6DC" highlightColor="#F7F5EE">
    {children}
  </SkeletonTheme>
);

/**
 * 4 Stats/Metrics Cards Skeleton mirroring Dashboard Overview
 */
export const StatsCardsSkeleton = ({ count = 4 }) => (
  <SocietySkeletonTheme>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          style={{ minHeight: '120px' }}
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton width={100} height={14} borderRadius={6} />
            <Skeleton circle width={36} height={36} />
          </div>
          <div className="space-y-1">
            <Skeleton width={120} height={28} borderRadius={8} />
            <Skeleton width={80} height={12} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  </SocietySkeletonTheme>
);

/**
 * Table Skeleton with header and matching rows (for Users/Members, Bills, Logs)
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <SocietySkeletonTheme>
    <div className="bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-6 shadow-sm w-full">
      {/* Table Header Filter / Search bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Skeleton width={220} height={38} borderRadius={20} />
        <div className="flex gap-2">
          <Skeleton width={100} height={36} borderRadius={20} />
          <Skeleton width={120} height={36} borderRadius={20} />
        </div>
      </div>

      {/* Table Column Titles */}
      <div className="grid gap-4 py-3 border-b border-[#E8E4D9] mb-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} width="70%" height={14} borderRadius={4} />
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid gap-4 py-3.5 border-b border-[#F4EFE6] items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            <div className="flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <div className="space-y-1">
                <Skeleton width={90} height={14} borderRadius={4} />
                <Skeleton width={60} height={10} borderRadius={4} />
              </div>
            </div>
            <Skeleton width="60%" height={14} borderRadius={4} />
            <Skeleton width="50%" height={14} borderRadius={4} />
            <Skeleton width={70} height={24} borderRadius={12} />
            <div className="flex gap-2 justify-end">
              <Skeleton width={30} height={30} borderRadius={8} />
              <Skeleton width={30} height={30} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </SocietySkeletonTheme>
);

/**
 * Cards Grid Skeleton (for Notices, Complaints, Meetings, Amenities)
 */
export const CardsGridSkeleton = ({ count = 6 }) => (
  <SocietySkeletonTheme>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          style={{ minHeight: '180px' }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <Skeleton width={80} height={22} borderRadius={12} />
              <Skeleton width={60} height={12} borderRadius={4} />
            </div>
            <Skeleton width="85%" height={18} borderRadius={6} className="mb-2" />
            <Skeleton count={2} height={12} borderRadius={4} className="mb-1" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#F4EFE6] mt-4">
            <div className="flex items-center gap-2">
              <Skeleton circle width={24} height={24} />
              <Skeleton width={80} height={12} borderRadius={4} />
            </div>
            <Skeleton width={70} height={28} borderRadius={16} />
          </div>
        </div>
      ))}
    </div>
  </SocietySkeletonTheme>
);

/**
 * Chart Skeleton (for Analytics and Financial Reports)
 */
export const ChartSkeleton = () => (
  <SocietySkeletonTheme>
    <div className="bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-6 shadow-sm w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <Skeleton width={160} height={20} borderRadius={6} />
          <Skeleton width={110} height={12} borderRadius={4} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={80} height={32} borderRadius={16} />
          <Skeleton width={80} height={32} borderRadius={16} />
        </div>
      </div>
      <div className="h-[280px] w-full flex items-end justify-between gap-3 pt-6 px-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              width="100%"
              height={`${35 + (i * 12) % 60}%`}
              borderRadius="8px 8px 0 0"
            />
            <Skeleton width={30} height={12} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  </SocietySkeletonTheme>
);

/**
 * Full Dashboard Skeleton (used when loading dashboard view or as fallback)
 */
export const DashboardPageSkeleton = () => (
  <SocietySkeletonTheme>
    <div className="min-h-screen bg-[#F9F8F3] text-[#2C2C2C] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Top Header Skeleton */}
      <header className="bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-4 sm:p-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton width={44} height={44} borderRadius={14} />
          <div className="space-y-1">
            <Skeleton width={180} height={22} borderRadius={6} />
            <Skeleton width={130} height={14} borderRadius={4} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={100} height={38} borderRadius={20} />
          <Skeleton circle width={40} height={40} />
        </div>
      </header>

      {/* Main Body Skeleton (Sidebar + Content) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Sidebar Navigation Skeleton */}
        <aside className="w-full lg:w-64 bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-4 shadow-sm h-fit space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
              <Skeleton circle width={22} height={22} />
              <Skeleton width="65%" height={16} borderRadius={4} />
            </div>
          ))}
        </aside>

        {/* Content Area Skeleton */}
        <main className="flex-1 flex flex-col gap-6">
          <StatsCardsSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <div className="bg-[#FFFDF9] border border-[#E8E4D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <Skeleton width={140} height={18} borderRadius={6} />
                <Skeleton count={4} height={36} borderRadius={10} className="mb-2" />
              </div>
              <Skeleton width="100%" height={40} borderRadius={12} />
            </div>
          </div>
          <TableSkeleton rows={4} cols={5} />
        </main>
      </div>
    </div>
  </SocietySkeletonTheme>
);

export default DashboardPageSkeleton;

import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './admin/components/admin-dashboard-client';


interface DashboardStats {
  totalReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  totalGuests: number;
  totalRooms: number;
  occupancyRate: number;
  totalUsers: number;
  totalBusinessUnits: number;
  recentReservations: Array<{
    id: string;
    confirmationNumber: string;
    guestName: string;
    checkInDate: Date;
    checkOutDate: Date;
    status: string;
    totalAmount: string;
    currency: string;
  }>;
  recentPayments: Array<{
    id: string;
    amount: string;
    currency: string;
    status: string;
    method: string;
    guestName: string | null;
    createdAt: Date;
  }>;
  roomStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  paymentStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

async function getDashboardStats(businessUnitId: string): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalReservations,
    todayCheckIns,
    todayCheckOuts,
    totalRevenue,
    totalGuests,
    totalRooms,
    occupiedRooms,
    totalUsers,
    totalBusinessUnits,
    recentReservations,
    recentPayments,
    roomStatusBreakdown,
    paymentStatusBreakdown,
  ] = await Promise.all([
    // Total reservations
    prisma.reservation.count({
      where: { businessUnitId },
    }),
    
    // Today's check-ins
    prisma.reservation.count({
      where: {
        businessUnitId,
        checkInDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['CONFIRMED', 'CHECKED_IN'],
        },
      },
    }),
    
    // Today's check-outs
    prisma.reservation.count({
      where: {
        businessUnitId,
        checkOutDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    }),
    
    // Total revenue
    prisma.payment.aggregate({
      where: {
        reservation: { businessUnitId },
        status: 'SUCCEEDED',
      },
      _sum: {
        amount: true,
      },
    }),
    
    // Total guests
    prisma.guest.count({
      where: { businessUnitId },
    }),
    
    // Total rooms
    prisma.room.count({
      where: { businessUnitId },
    }),
    
    // Occupied rooms
    prisma.room.count({
      where: {
        businessUnitId,
        status: 'OCCUPIED',
      },
    }),
    
    // Total users (system-wide)
    prisma.user.count(),
    
    // Total business units (system-wide)
    prisma.businessUnit.count(),
    
    // Recent reservations
    prisma.reservation.findMany({
      where: { businessUnitId },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    
    // Recent payments
    prisma.payment.findMany({
      where: {
        reservation: { businessUnitId },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    
    // Room status breakdown
    prisma.room.groupBy({
      by: ['status'],
      where: { businessUnitId },
      _count: {
        status: true,
      },
    }),
    
    // Payment status breakdown
    prisma.payment.groupBy({
      by: ['status'],
      where: {
        reservation: { businessUnitId },
      },
      _count: {
        status: true,
      },
    }),
  ]);

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  return {
    totalReservations,
    todayCheckIns,
    todayCheckOuts,
    totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
    totalGuests,
    totalRooms,
    occupancyRate,
    totalUsers,
    totalBusinessUnits,
    recentReservations: recentReservations.map(reservation => ({
      id: reservation.id,
      confirmationNumber: reservation.confirmationNumber,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      status: reservation.status,
      totalAmount: reservation.totalAmount.toString(),
      currency: reservation.currency,
    })),
    recentPayments: recentPayments.map(payment => ({
      id: payment.id,
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      guestName: payment.guestName,
      createdAt: payment.createdAt,
    })),
    roomStatusBreakdown: roomStatusBreakdown.map(item => ({
      status: item.status,
      count: item._count.status,
    })),
    paymentStatusBreakdown: paymentStatusBreakdown.map(item => ({
      status: item.status,
      count: item._count.status,
    })),
  };
}

const AdminPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // Check if user has access to this business unit
  const isAdmin = session.user.assignments.some(
    assignment => assignment.role.name === 'SUPER_ADMIN'
  );

  const isAuthorizedForUnit = session.user.assignments.some(
    assignment => assignment.businessUnitId === businessUnitId
  );

  if (!isAdmin && !isAuthorizedForUnit) {
    const defaultUnitId = session.user.assignments[0]?.businessUnitId;
    redirect(defaultUnitId ? `/${defaultUnitId}` : '/select-unit');
  }

  const stats = await getDashboardStats(businessUnitId);

  return <AdminDashboardClient stats={stats} businessUnitId={businessUnitId} />;
};

export default AdminPage;
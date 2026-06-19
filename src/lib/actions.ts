'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// User Registration Action
export async function registerUser(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = (formData.get('email') as string).toLowerCase().trim();
    const mobileNumber = formData.get('mobileNumber') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !firstName) {
      return { error: 'Required fields are missing' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists with this email address' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        mobileNumber,
        image: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firstName}`,
      },
    });

    return { success: true, user: { id: newUser.id, email: newUser.email } };
  } catch (error: any) {
    console.error('Registration action error:', error);
    return { error: error.message || 'Failed to sign up' };
  }
}

// Get all chats of current logged-in user
export async function getUserChats() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });
}

// Create a new chat
export async function createChat(title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const chat = await prisma.chat.create({
    data: {
      userId: session.user.id,
      title: title || 'New Chat',
    },
  });

  return chat;
}

// Get messages for a specific chat session
export async function getChatMessages(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Verify ownership
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  if (!chat) return [];

  return prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });
}

// Delete a chat session
export async function deleteChat(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.chat.deleteMany({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  revalidatePath('/chat');
  return { success: true };
}

// Update profile details
export async function updateProfile(data: { firstName: string; lastName: string; mobileNumber: string; image?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        mobileNumber: data.mobileNumber,
        image: data.image,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
  }
}

// Fetch user E-tickets
export async function getUserTickets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
}

// Cancel (delete) a ticket
export async function deleteTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.ticket.deleteMany({
    where: {
      id: ticketId,
      userId: session.user.id,
    },
  });

  revalidatePath('/qr');
  revalidatePath('/history');
  return { success: true };
}

// Create a ticket directly (called on payment confirmation)
export async function createTicket(data: {
  attraction: string;
  date: string;
  time: string;
  adult: number;
  child: number;
  foreigner: number;
  totalPrice: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const ticketId = 't-' + Math.random().toString(36).substr(2, 9);
  
  const ticket = await prisma.ticket.create({
    data: {
      id: ticketId,
      userId: session.user.id,
      attraction: data.attraction,
      date: data.date,
      time: data.time,
      adult: data.adult,
      child: data.child,
      foreigner: data.foreigner,
      totalPrice: data.totalPrice,
      qrData: `KATAAR-TICKET-${ticketId}-${Date.now()}`,
      status: 'existing',
    },
  });

  revalidatePath('/qr');
  revalidatePath('/history');
  return ticket;
}

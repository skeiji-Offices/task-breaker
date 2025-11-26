
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const goal = await prisma.goal.findUnique({
            where: { id },
        });

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        if (goal.userId && goal.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.goal.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

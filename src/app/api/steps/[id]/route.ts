import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { isCompleted } = await request.json();

        const existingStep = await prisma.step.findUnique({
            where: { id },
            include: { goal: true },
        });

        if (!existingStep) {
            return NextResponse.json({ error: 'Step not found' }, { status: 404 });
        }

        if (existingStep.goal.userId && existingStep.goal.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const step = await prisma.step.update({
            where: { id },
            data: { isCompleted },
        });

        return NextResponse.json(step);
    } catch (error) {
        console.error('Error updating step:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

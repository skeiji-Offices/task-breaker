import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json([]);
        }

        const goals = await prisma.goal.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                steps: {
                    orderBy: {
                        deadline: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

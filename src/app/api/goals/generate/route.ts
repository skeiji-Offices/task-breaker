import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { addDays, differenceInDays, format } from 'date-fns';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Initialize Gemini
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
console.log("API Key Status:", apiKey ? "Set" : "Not Set");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, deadline } = await request.json();

        if (!title || !deadline) {
            return NextResponse.json({ error: 'Title and deadline are required' }, { status: 400 });
        }

        const targetDate = new Date(deadline);
        const now = new Date();
        const daysUntilDeadline = differenceInDays(targetDate, now);

        if (daysUntilDeadline < 0) {
            return NextResponse.json({ error: 'Deadline must be in the future' }, { status: 400 });
        }

        // Prompt for Gemini
        const prompt = `
      あなたはタスク管理のエキスパートです。
      以下のタスクを達成するために、5〜10個の具体的な実行ステップに分解してください。
      
      タスク名: "${title}"
      現在のタスクの締め切り: ${format(targetDate, 'yyyy-MM-dd')}
      今日の日付: ${format(now, 'yyyy-MM-dd')}
      
      要件:
      1. 各ステップは具体的で実行可能なアクションにすること。
      2. ステップの順序は論理的に正しいこと。
      3. 各ステップに「現実的な締め切り日(deadline)」を割り振ること。
         - 最初のアクションは今日から近い日付に。
         - 最後のアクションは親タスクの締め切り日またはその直前に。
         - 日付は "YYYY-MM-DD" 形式で出力すること。
      4. 出力は以下のJSON形式の配列のみを返してください。Markdownのコードブロックは不要です。
      
      [
        { "title": "ステップ名", "deadline": "YYYY-MM-DD" },
        ...
      ]
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up potential markdown formatting
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let stepsData;
        try {
            stepsData = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({ error: 'Failed to generate valid steps' }, { status: 500 });
        }

        // Save to Database
        const goal = await prisma.goal.create({
            data: {
                title,
                deadline: targetDate,
                userId: session.user.id,
                steps: {
                    create: stepsData.map((step: any) => ({
                        title: step.title,
                        deadline: new Date(step.deadline),
                    })),
                },
            },
            include: {
                steps: true,
            },
        });

        return NextResponse.json(goal);

    } catch (error) {
        console.error('Error in generate route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

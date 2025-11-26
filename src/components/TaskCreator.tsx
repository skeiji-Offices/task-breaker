'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskCreatorProps {
    onGoalCreated: () => void;
}

export function TaskCreator({ onGoalCreated }: TaskCreatorProps) {
    const [title, setTitle] = React.useState('');
    const [date, setDate] = React.useState<Date>();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/goals/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    deadline: date.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create goal');
            }

            setTitle('');
            setDate(undefined);
            onGoalCreated();
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('タスクの作成に失敗しました。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mb-8">
            <CardHeader>
                <CardTitle>新しいタスクを作成</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">タスク名</Label>
                        <Input
                            id="title"
                            placeholder="例: 夏までにWebアプリをリリースする"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label>締め切り日</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-[280px] justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                    disabled={isLoading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'yyyy/MM/dd') : <span>日付を選択</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button type="submit" className="w-full" disabled={!title || !date || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                AIが計画を立てています...
                            </>
                        ) : (
                            '分解して計画を立てる'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

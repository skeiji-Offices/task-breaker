'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StepItem } from './StepItem';

interface Step {
    id: string;
    title: string;
    isCompleted: boolean;
    deadline: string;
}

interface Goal {
    id: string;
    title: string;
    description: string | null;
    deadline: string;
    createdAt: string;
    steps: Step[];
}

interface GoalListProps {
    goals: Goal[];
    onGoalUpdate: () => void;
}

export function GoalList({ goals, onGoalUpdate }: GoalListProps) {
    if (goals.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                まだタスクがありません。「分解して計画を立てる」から始めましょう。
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onGoalUpdate={onGoalUpdate} />
            ))}
        </div>
    );
}

function GoalCard({ goal, onGoalUpdate }: { goal: Goal; onGoalUpdate: () => void }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const completedSteps = goal.steps.filter((s) => s.isCompleted).length;
    const totalSteps = goal.steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent accordion toggle
        if (!confirm('このタスクを削除してもよろしいですか？')) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/goals/${goal.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onGoalUpdate();
            } else {
                alert('削除に失敗しました。');
            }
        } catch (error) {
            console.error('Failed to delete goal', error);
            alert('削除中にエラーが発生しました。');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg leading-tight">{goal.title}</CardTitle>
                        <CardDescription>
                            期限: {format(new Date(goal.deadline), 'yyyy/MM/dd')}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>進捗状況</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0 flex-1">
                    <div className="space-y-3 mt-4 border-t pt-4">
                        {goal.steps.map((step) => (
                            <StepItem key={step.id} step={step} onUpdate={onGoalUpdate} />
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

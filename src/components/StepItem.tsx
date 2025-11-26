import { format, isPast, differenceInDays } from 'date-fns';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    title: string;
    isCompleted: boolean;
    deadline: string; // ISO string from JSON
}

interface StepItemProps {
    step: Step;
    onUpdate: () => void;
}

export function StepItem({ step, onUpdate }: StepItemProps) {
    const deadlineDate = new Date(step.deadline);
    const isOverdue = isPast(deadlineDate) && !step.isCompleted;
    const isUrgent = differenceInDays(deadlineDate, new Date()) <= 3 && !step.isCompleted && !isOverdue;

    const toggleStatus = async () => {
        try {
            const response = await fetch(`/api/steps/${step.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isCompleted: !step.isCompleted }),
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error('Failed to update step status', error);
        }
    };

    return (
        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="mt-1">
                <button onClick={toggleStatus} className="focus:outline-none">
                    {step.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                </button>
            </div>
            <div className="flex-1 space-y-1">
                <p className={cn("text-sm font-medium leading-none", step.isCompleted && "line-through text-muted-foreground")}>
                    {step.title}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                    <span className={cn(
                        "flex items-center",
                        isOverdue && "text-red-600 font-bold",
                        isUrgent && "text-orange-500 font-bold"
                    )}>
                        {isOverdue && <AlertCircle className="mr-1 h-3 w-3" />}
                        期限: {format(deadlineDate, 'yyyy/MM/dd')}
                    </span>
                </div>
            </div>
        </div>
    );
}

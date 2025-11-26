'use client';

import * as React from 'react';
import { TaskCreator } from '@/components/TaskCreator';
import { GoalList } from '@/components/GoalList';
import { UserMenu } from '@/components/UserMenu';

export default function Home() {
  const [goals, setGoals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchGoals = React.useCallback(async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Failed to fetch goals', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // ...

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-2 relative">
          <div className="absolute right-0 top-0">
            <UserMenu />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Task Breaker
          </h1>
          <p className="text-muted-foreground">
            大きな目標を、AIが実行可能なステップに分解します。
          </p>
        </header>

        <section>
          <TaskCreator onGoalCreated={fetchGoals} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            あなたの目標リスト
          </h2>
          {loading ? (
            <div className="text-center py-10">読み込み中...</div>
          ) : (
            <GoalList goals={goals} onGoalUpdate={fetchGoals} />
          )}
        </section>
      </div>
    </main>
  );
}

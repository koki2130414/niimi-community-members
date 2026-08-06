"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";

export function QuizBlock({
  question,
  choices,
  correctIndex,
}: {
  question: string;
  choices: string[];
  correctIndex: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card>
      <CardBody>
        <p className="mb-3 text-sm font-semibold text-brand-green-dark">{question}</p>
        <div className="space-y-2">
          {choices.map((choice, i) => {
            const isCorrect = submitted && i === correctIndex;
            const isWrongSelected = submitted && selected === i && i !== correctIndex;
            return (
              <button
                key={i}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(i)}
                className={`block w-full rounded-lg border px-3.5 py-2.5 text-left text-sm transition ${
                  isCorrect
                    ? "border-brand-green bg-brand-cream text-brand-green-dark"
                    : isWrongSelected
                      ? "border-brand-danger bg-red-50 text-brand-danger"
                      : selected === i
                        ? "border-brand-green-dark bg-brand-beige"
                        : "border-brand-beige hover:bg-brand-cream"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {!submitted ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={() => setSubmitted(true)}
            className="mt-3 rounded-full bg-brand-green-dark px-5 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            回答する
          </button>
        ) : (
          <p className="mt-3 text-xs font-semibold text-brand-green-light">
            {selected === correctIndex ? "🎉 正解です！" : "残念、もう一度復習してみましょう。"}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

import React from 'react';
import { Button } from '@shared/components/Button';
import {
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const ButtonGroupDefaultExample = () => {
  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text] p-8">
      <div className="mx-auto max-w-3xl space-y-8 rounded-[--radius-lg] bg-slate-900/60 p-6 shadow-lg border border-[--color-border-subtle]">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold">Button component sheet</h1>
          <p className="text-[--color-text-muted] text-[--text-xs]">
            Quick reference for all Button variants, icon treatments, and
            layouts.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">With icons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" startIcon={<PlusIcon className="h-4 w-4" />}>
              Add item
            </Button>
            <Button
              variant="secondary"
              endIcon={<ArrowRightIcon className="h-4 w-4" />}
            >
              Continue
            </Button>
            <Button
              variant="destructive"
              startIcon={<TrashIcon className="h-4 w-4" />}
            >
              Delete
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Icon only</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="iconOnly">
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button variant="iconOnly">
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Full width</h2>
          <div className="space-y-2">
            <Button variant="primary" fullWidth>
              Primary full width
            </Button>
            <Button variant="secondary" fullWidth>
              Secondary full width
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonGroupDefaultExample;


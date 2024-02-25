'use client';
import { lusitana } from '@/app/ui/fonts';
import {
  ArrowRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import { Button } from './button';
import { authenticateWithGoogle } from '../lib/actions';
import { useFormState, useFormStatus } from 'react-dom';

export default function SocialLogin() {
  return (
    <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <LoginWithGoogleButton />
    </div>
  );
}

function LoginWithGoogleButton() {
  const [errorMessage, dispatch] = useFormState(
    authenticateWithGoogle,
    undefined,
  );
  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-5 pt-4">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Or use your Google Account
        </h1>
        <LoginButton />
        <div
          className="flex h-8 items-end space-x-1 "
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="mt-4 w-full" aria-disabled={pending} color="blue">
      Log in with Google{' '}
      <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}

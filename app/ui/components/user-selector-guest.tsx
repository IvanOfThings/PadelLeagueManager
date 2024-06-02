import { UserCircleIcon } from '@heroicons/react/24/outline';
import { User } from '@/app/lib/definitions';

export function AddingNewUser({
  users,
  userId,
  label,
  inputName,
  guest,
  onChangeUser,
  onChangeGuest,
}: {
  users: User[];
  userId: string;
  label: string;
  guest: boolean;
  inputName: string;
  onChangeUser?: (participant: User) => void;
  onChangeGuest?: (guest: boolean) => void;
}) {
  return (
    <div className="relative">
      <div className="mb-2  grid grid-cols-7 gap-4">
        <span className="col-span-2 inline-block px-8 py-3  ">
          <label htmlFor="customer" className=" block text-sm font-medium">
            {`${label}`}
          </label>
        </span>
        <span className=" col-span-3 inline-block px-5  py-1 ">
          <div className="relative">
            <select
              id="customer"
              name={`${inputName}`}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={`${userId}`}
              onChange={(e) => {
                if (onChangeUser) {
                  const user = users.find((u) => u.id === e.target.value);
                  if (user !== undefined) {
                    onChangeUser(user);
                  }
                }
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>{' '}
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </span>
        <span className="col-span-2 inline-block px-8 py-3  ">
          <div className="topping flex grid grid-cols-2 gap-4">
            <input
              type="checkbox"
              id="guest"
              name="guest"
              value="guest"
              checked={guest}
              onChange={(e) => {
                if (onChangeGuest) {
                  onChangeGuest(!guest);
                }
              }}
            />
            <label htmlFor="guest">Invitado</label>
          </div>
        </span>
      </div>
    </div>
  );
}

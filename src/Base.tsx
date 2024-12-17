import { Outlet } from "react-router";
import { ModeToggle } from "./components/mode-toggle";

export function Base() {
  return (
    <div className="flex flex-col flex-nowrap w-full max-h-screen h-screen overflow-hidden">
      <header className="w-full flex flex-row flex-nowrap items-center px-8 py-4">
        <ModeToggle className="ml-auto" />
      </header>
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  )
}
